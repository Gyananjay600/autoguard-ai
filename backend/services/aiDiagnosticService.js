import { query } from '../config/db.js';
import KnowledgeService from './knowledgeService.js';

export class AIDiagnosticService {
  /**
   * Dispatches LLM inference call to Groq API (OpenAI-compatible)
   */
  static async callGroqAPI({ systemPrompt, userPrompt, model, maxTokens = 1000, temperature = 0.7 }) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.includes('your_groq_api_key')) {
      console.warn('[AI] GROQ_API_KEY is not configured or placeholder detected. Using heuristic fallback.');
      return null;
    }

    const targetModel = model || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model: targetModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature,
        max_tokens: maxTokens
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || '',
      model: data.model || targetModel
    };
  }

  /**
   * Generate Quick AI Explanation (Mode: QUICK)
   * Matches Java AIExplainerService
   */
  static async generateQuickExplanation(prediction, sensorSummary, vehicle) {
    const start = Date.now();
    const modelName = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    const ragContext = await KnowledgeService.findRelevantContext(
      `${prediction.predicted_fault_type} ${sensorSummary}`
    );

    const systemPrompt = `You are AutoGuard AI, a friendly vehicle maintenance assistant.
Explain vehicle faults in simple, clear language for non-technical car owners. Keep responses under 100 words.
Be helpful, reassuring, and provide one direct recommended action.`;

    const userPrompt = `Vehicle sensor analysis results:
${sensorSummary}

Risk Score: ${Number(prediction.risk_score).toFixed(1)} / 100
Risk Level: ${prediction.risk_level}
Predicted Issue: ${prediction.predicted_fault_type}

RELEVANT MAINTENANCE KNOWLEDGE:
${ragContext}

Please explain this to the vehicle owner in simple terms.
What does this mean and what should they do?`;

    let explanationText = '';
    let finalModel = modelName;

    try {
      const result = await this.callGroqAPI({
        systemPrompt,
        userPrompt,
        model: modelName,
        maxTokens: 500,
        temperature: 0.7
      });

      if (result && result.content) {
        explanationText = result.content;
        finalModel = result.model;
      } else {
        explanationText = this.generateFallbackQuickExplanation(prediction, vehicle);
      }
    } catch (err) {
      console.error('[AI] Quick analysis inference error:', err.message);
      explanationText = this.generateFallbackQuickExplanation(prediction, vehicle);
    }

    const latencyMs = Date.now() - start;

    // Save into ai_explanations
    const expInsert = await query(
      `INSERT INTO ai_explanations (model_name, prompt_summary, explanation_text, mode, prediction_id)
       VALUES (?, ?, ?, 'QUICK', ?)`,
      [
        finalModel,
        `Quick analysis: ${prediction.predicted_fault_type}`,
        explanationText,
        prediction.id
      ]
    );

    // Save into ai_request_log
    await query(
      `INSERT INTO ai_request_log (model_name, mode, latency_ms, vehicle_name, predicted_fault, risk_score, risk_level)
       VALUES (?, 'QUICK', ?, ?, ?, ?, ?)`,
      [
        finalModel,
        latencyMs,
        vehicle.name,
        prediction.predicted_fault_type,
        prediction.risk_score,
        prediction.risk_level
      ]
    );

    return {
      id: expInsert.insertId,
      modelName: finalModel,
      explanationText,
      mode: 'QUICK',
      latencyMs
    };
  }

  /**
   * Generate Deep AI Diagnostic (Mode: DEEP)
   * Matches Java AIDiagnosticService
   */
  static async generateDeepDiagnostic(prediction, sensorSummary, vehicle, maintenanceHistory = []) {
    const start = Date.now();
    const deepModelName = process.env.GROQ_DEEP_MODEL || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    const maintenanceContext = maintenanceHistory.length === 0
      ? 'No maintenance records found.'
      : maintenanceHistory
          .slice(0, 5)
          .map(m => `- ${m.date}: ${m.action} (${m.repair_done ? 'Completed' : 'Pending'})`)
          .join('\n');

    const ragContext = await KnowledgeService.findRelevantContext(
      `${prediction.predicted_fault_type} ${sensorSummary}`
    );

    const systemPrompt = `You are AutoGuard AI, an expert automotive master diagnostic system.
Provide detailed technical analysis of vehicle faults.
Include: root cause analysis, severity assessment, recommended repairs with priority,
estimated urgency, and a step-by-step maintenance checklist.
Be thorough, precise, and adhere to OEM mechanical standards.`;

    const userPrompt = `VEHICLE INFORMATION:
Make: ${vehicle.make} | Model: ${vehicle.model} | Year: ${vehicle.year} | Mileage: ${vehicle.mileage} km
Engine Type: ${vehicle.engine_type || 'Standard'} | VIN: ${vehicle.vin || 'N/A'}

SENSOR ANALYSIS:
${sensorSummary}

RISK ASSESSMENT:
Risk Score: ${Number(prediction.risk_score).toFixed(1)} / 100
Risk Level: ${prediction.risk_level}
Predicted Issue: ${prediction.predicted_fault_type}

RECENT MAINTENANCE HISTORY:
${maintenanceContext}

RELEVANT MAINTENANCE KNOWLEDGE:
${ragContext}

Please provide a comprehensive diagnostic report including:
1. Detailed analysis of the fault
2. Root cause assessment
3. Severity and urgency rating
4. Step-by-step repair checklist
5. Estimated time sensitivity
6. Preventive measures for the future`;

    let explanationText = '';
    let finalModel = `${deepModelName} (deep mode)`;

    try {
      const result = await this.callGroqAPI({
        systemPrompt,
        userPrompt,
        model: deepModelName,
        maxTokens: 2000,
        temperature: 0.6
      });

      if (result && result.content) {
        explanationText = result.content;
        finalModel = `${result.model} (deep mode)`;
      } else {
        explanationText = this.generateFallbackDeepDiagnostic(prediction, vehicle, maintenanceContext);
      }
    } catch (err) {
      console.error('[AI] Deep diagnostic inference error:', err.message);
      explanationText = this.generateFallbackDeepDiagnostic(prediction, vehicle, maintenanceContext);
    }

    const latencyMs = Date.now() - start;

    // Save into ai_explanations
    const expInsert = await query(
      `INSERT INTO ai_explanations (model_name, prompt_summary, explanation_text, mode, prediction_id)
       VALUES (?, ?, ?, 'DEEP', ?)`,
      [
        finalModel,
        `Deep diagnostic: ${prediction.predicted_fault_type}`,
        explanationText,
        prediction.id
      ]
    );

    // Save into ai_request_log
    await query(
      `INSERT INTO ai_request_log (model_name, mode, latency_ms, vehicle_name, predicted_fault, risk_score, risk_level)
       VALUES (?, 'DEEP', ?, ?, ?, ?, ?)`,
      [
        finalModel,
        latencyMs,
        vehicle.name,
        prediction.predicted_fault_type,
        prediction.risk_score,
        prediction.risk_level
      ]
    );

    return {
      id: expInsert.insertId,
      modelName: finalModel,
      explanationText,
      mode: 'DEEP',
      latencyMs
    };
  }

  // --- Resilient Fallbacks ---

  static generateFallbackQuickExplanation(prediction, vehicle) {
    const risk = prediction.risk_level;
    const fault = prediction.predicted_fault_type;
    return `### Diagnostic Summary for ${vehicle.name}
**Predicted Condition**: ${fault} (Risk Score: ${Number(prediction.risk_score).toFixed(1)}/100 — **${risk}**)

Our telemetry diagnostics indicate telemetry deviations matching **${fault}**. 
${risk === 'HIGH' 
  ? '⚠️ **Urgent Action Required**: Operating under these conditions may cause severe drivetrain damage. Schedule an inspection immediately and avoid high-RPM highway driving.'
  : risk === 'MEDIUM' 
    ? '⚡ **Moderate Advisory**: Performance indicators show abnormal wear. Check fluid levels and schedule a service visit within 250 miles.' 
    : '✅ **Good Standing**: Your vehicle is performing within standard operating thresholds. Maintain routine servicing according to schedule.'}`;
  }

  static generateFallbackDeepDiagnostic(prediction, vehicle, maintenanceContext) {
    return `## Comprehensive Technical Diagnostic Report
**Vehicle**: ${vehicle.year} ${vehicle.make} ${vehicle.model} (VIN: ${vehicle.vin || 'N/A'})
**Calculated Risk**: ${Number(prediction.risk_score).toFixed(1)} / 100 (${prediction.risk_level} Severity)
**Primary Fault Signature**: ${prediction.predicted_fault_type}

---

### 1. Detailed Fault Analysis
Telemetry analysis detected sustained operational parameter variance. Real-time data streams indicate that sensor readings exceeded baseline operating envelopes.

### 2. Root Cause Assessment
- Thermal, mechanical, or electrical stress matching signature **${prediction.predicted_fault_type}**.
- Correlation with previous maintenance records:
${maintenanceContext}

### 3. Severity & Urgency Rating
- **Risk Category**: ${prediction.risk_level}
- **Safety Impact**: Elevated risk of component thermal throttling or mechanical fatigue.

### 4. Step-by-Step Repair Checklist
- [ ] Connect OBD-II diagnostic scanner to verify pending DTC freeze-frame data.
- [ ] Visually inspect fluid levels (coolant reservoir, engine oil dipstick, transmission lines).
- [ ] Check wiring harnesses and sensor connectors for corrosion or loose pins.
- [ ] Perform pressure test or electrical continuity check on relevant actuator circuits.
- [ ] Clear error codes after component replacement and execute 15-minute drive cycle.

### 5. Estimated Time Sensitivity
${prediction.risk_level === 'HIGH' ? '🚨 Immediate (Within 24 hours / < 50 miles)' : '⚠️ Standard Service Window (Within 7-14 days)'}

### 6. Preventive Measures
Ensure adherence to OEM lubrication and cooling service intervals. Replace filters and synthetic oil every 5,000–7,500 miles.`;
  }
}

export default AIDiagnosticService;
