FROM node:20-slim

RUN apt-get update && apt-get install -y \
  libreoffice \
  ghostscript \
  ocrmypdf \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

RUN mkdir -p /app/../uploads /app/../converted

EXPOSE 4000
CMD ["node", "src/index.js"]
