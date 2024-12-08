FROM maven:3.8.4-openjdk-17-slim AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
RUN addgroup --system javauser && adduser --system --ingroup javauser javauser
COPY --from=build /app/target/*.jar app.jar
RUN chown -R javauser:javauser /app
USER javauser
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]