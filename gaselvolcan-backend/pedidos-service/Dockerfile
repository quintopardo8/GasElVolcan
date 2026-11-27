# ---------- Etapa 1: compilar con Maven ----------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
# Primero solo el pom: las dependencias quedan en caché mientras no cambie.
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src ./src
RUN mvn -B -q package -DskipTests

# ---------- Etapa 2: imagen liviana solo con el JRE ----------
FROM eclipse-temurin:21-jre
WORKDIR /app
RUN groupadd --system app && useradd --system --gid app app
COPY --from=build /app/target/pedidos-service.jar app.jar
USER app
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
