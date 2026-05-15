package com.autoguard.Service;

import com.autoguard.enums.DiagnosticMode;
import com.autoguard.Model.AIExplanation;
import com.autoguard.Model.FaultPrediction;
import com.autoguard.Repository.AIExplanationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIExplainerService {

    @Qualifier("quickChatClient")
    private final ChatClient quickChatClient;

    private final AIExplanationRepository aiExplanationRepository;

    @Value("${spring.ai.openai.chat.options.model}")
    private String aiModelName;

    public AIExplanation generateQuickExplanation(
            FaultPrediction prediction,
            String sensorSummary) {

        long start = System.currentTimeMillis();

        String prompt = String.format("""
                Vehicle sensor analysis results:
                %s

                Risk Score: %.1f / 100
                Risk Level: %s
                Predicted Issue: %s

                Please explain this to the vehicle owner in simple terms.
                What does this mean and what should they do?
                """,
                sensorSummary,
                prediction.getRiskScore(),
                prediction.getRiskLevel(),
                prediction.getPredictedFaultType());

        String explanation = quickChatClient.prompt()
                .user(prompt)
                .call()
                .content();

        long latency = System.currentTimeMillis() - start;
        log.info("Quick AI explanation generated in {}ms using Groq {}",
                latency, aiModelName);

        AIExplanation aiExplanation = AIExplanation.builder()
                .prediction(prediction)
                .modelName(aiModelName)
                .promptSummary("Quick analysis: "
                        + prediction.getPredictedFaultType())
                .explanationText(explanation)
                .mode(DiagnosticMode.QUICK)
                .build();

        return aiExplanationRepository.save(aiExplanation);
    }
}
