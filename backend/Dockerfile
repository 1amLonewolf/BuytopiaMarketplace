FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./
COPY backend/node_modules ./node_modules

COPY backend/ ./

EXPOSE $PORT

CMD ["npm", "start"]