FROM node:20 AS app

WORKDIR /app
COPY app .

RUN npm install --production

CMD ["node", "index.js"]
