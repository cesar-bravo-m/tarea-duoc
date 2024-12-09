# Etapa de construcción
FROM maven:3.8.4-openjdk-17-slim AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Etapa de ejecución
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Crear usuario no-root por seguridad
RUN addgroup --system javauser && adduser --system --ingroup javauser javauser

# Copiar el artefacto construido desde la etapa de construcción
COPY --from=build /app/target/*.jar app.jar

# Establecer permisos para el usuario no-root
RUN chown -R javauser:javauser /app

# Cambiar al usuario no-root
USER javauser

# Exponer el puerto de la aplicación
EXPOSE 8080

# Comando para ejecutar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]