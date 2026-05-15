package com.autoguard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AutoguardAiApplication {

	public static void main(String[] args) {
		SpringApplication.run(AutoguardAiApplication.class, args);
	}
}