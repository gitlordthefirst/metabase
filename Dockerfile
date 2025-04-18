FROM openjdk:17-jdk-slim

ENV MB_VERSION v0.49.4

WORKDIR /app

RUN apt-get update && apt-get install -y curl && \
    curl -L -o metabase.jar https://downloads.metabase.com/${MB_VERSION}/metabase.jar

EXPOSE 3000

CMD ["java", "-Xmx384m", "-XX:+IgnoreUnrecognizedVMOptions", "--add-opens=java.base/jdk.internal.platform=ALL-UNNAMED", "-jar", "metabase.jar"]
