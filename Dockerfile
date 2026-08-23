# Multi-stage Dockerfile for AutoGuard AI
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY . .
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
RUN apk add --no-cache libstdc++ gcompat libc6-compat
WORKDIR /app
COPY --from=builder /app/target/autoguard-ai-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 7070
ENTRYPOINT ["java", "-jar", "app.jar"]
