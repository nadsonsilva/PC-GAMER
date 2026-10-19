FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build
RUN mkdir -p /app/prisma /app/data && chown -R node:node /app
USER node
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
