FROM python:3.11-slim
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN npm install -g mongodb-mcp-server
COPY . .
EXPOSE 8080
CMD  ["adk", "api_server", "--host", "0.0.0.0", "--port", "8080", "--allow_origins=*", "."]
