FROM openjdk:17-jdk-slim

# Set Metabase version (you can update this)
ENV MB_VERSION v0.49.4

# Create app folder and move into it
WORKDIR /app

# Download the Metabase JAR file
RUN apt-get update && apt-get install -y curl \
  && curl -L -o metabase.jar https://downloads.metabase.com/${MB_VERSION}/metabase.jar

# Expose default Metabase port
EXPOSE 3000

# Run Metabase
CMD ["java", "-jar", "metabase.jar"]
