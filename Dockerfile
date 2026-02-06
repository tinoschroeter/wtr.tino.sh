FROM node:24-alpine AS builder

WORKDIR /app
COPY app/package*.json ./
RUN npm ci --only=production

FROM node:24-alpine as app

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY app .

CMD ["node", "index.js"]
