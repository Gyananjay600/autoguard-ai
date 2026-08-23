package com.autoguard.Service;

import com.autoguard.enums.DiagnosticMode;
import com.autoguard.Model.AIExplanation;
import com.autoguard.Model.FaultPrediction;
import com.autoguard.Model.MaintenanceRecord;
import com.autoguard.Model.Vehicle;
import com.autoguard.Repository.AIExplanationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIDiagnosticService {

    @Qualifier("deepChatClient")
    private final ChatClient deepChatClient;

    private final AIExplanationRepository aiExplanationRepository;

    private final KnowledgeService knowledgeService;

    @Value("${app.ai.deep-model:${spring.ai.openai.chat.options.model}}")
    private String deepModelName;

    public AIExplanation generateDeepDiagnostic(
            FaultPrediction prediction,
            String sensorSummary,
            Vehicle vehicle,
            List<MaintenanceRecord> maintenanceHistory) {

        long start = System.currentTimeMillis();

        String maintenanceContext = maintenanceHistory.isEmpty()
                ? "No maintenance records found."
                : maintenanceHistory.stream()
                .limit(5)
                .map(m -> String.format("- %s: %s (%s)",
                        m.getDate(), m.getAction(),
                        m.isRepairDone() ? "Completed" : "Pending"))
                .collect(Collectors.joining("\n"));

        String prompt = String.format("""
                VEHICLE INFORMATION:
                Make: %s | Model: %s | Year: %d | Mileage: %d km
                Engine Type: %s | VIN: %s

                SENSOR ANALYSIS:
                %s

                RISK ASSESSMENT:
                Risk Score: %.1f / 100
                Risk Level: %s
                Predicted Issue: %s

                RECENT MAINTENANCE HISTORY:
                %s

                RELEVANT MAINTENANCE KNOWLEDGE:
                %s

                Please provide a comprehensive diagnostic report including:
                1. Detailed analysis of the fault
                2. Root cause assessment
                3. Severity and urgency rating
                4. Step-by-step repair checklist
                5. Estimated time sensitivity
                6. Preventive measures for the future
                """,
                vehicle.getMake(), vehicle.getModel(),
                vehicle.getYear(), vehicle.getMileage(),
                vehicle.getEngineType(), vehicle.getVin(),
                sensorSummary,
                prediction.getRiskScore(),
                prediction.getRiskLevel(),
                prediction.getPredictedFaultType(),
                maintenanceContext,
                knowledgeService.findRelevantContext(
                        prediction.getPredictedFaultType() + " " + sensorSummary));

        // Deep diagnostic model is configurable; defaults to the global chat model.
        String explanation = deepChatClient.prompt()
                .user(prompt)
                .options(OpenAiChatOptions.builder()
                        .model(deepModelName)
                        .maxTokens(2000)
                        .build())
                .call()
                .content();

        long latency = System.currentTimeMillis() - start;
        log.info("Deep diagnostic generated in {}ms using Groq {}",
                latency, deepModelName);

        AIExplanation aiExplanation = AIExplanation.builder()
                .prediction(prediction)
                .modelName(deepModelName + " (deep mode)")
                .promptSummary("Deep diagnostic: "
                        + prediction.getPredictedFaultType())
                .explanationText(explanation)
                .mode(DiagnosticMode.DEEP)
                .build();

        return aiExplanationRepository.save(aiExplanation);
    }
}
