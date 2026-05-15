package com.autoguard.Config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class SpringAiConfig {

    // Model A — quick explainer (configured via spring.ai.openai.chat.options.model)
    @Bean
    @Primary
    @Qualifier("quickChatClient")
    public ChatClient quickChatClient(OpenAiChatModel chatModel) {
        return ChatClient.builder(chatModel)
                .defaultSystem("""
                        You are AutoGuard AI, a vehicle maintenance assistant.
                        Explain vehicle faults in simple, clear language for
                        non-technical car owners. Keep responses under 100 words.
                        Be helpful and reassuring.
                        """)
                .build();
    }

    // Model B — deep diagnostic (same model, richer context)
    @Bean
    @Qualifier("deepChatClient")
    public ChatClient deepChatClient(OpenAiChatModel chatModel) {
        return ChatClient.builder(chatModel)
                .defaultSystem("""
                        You are AutoGuard AI, an expert automotive diagnostic system.
                        Provide detailed technical analysis of vehicle faults.
                        Include: root cause analysis, severity assessment,
                        recommended repairs with priority, estimated urgency,
                        and a step-by-step maintenance checklist.
                        Be thorough and precise.
                        """)
                .build();
    }
}
