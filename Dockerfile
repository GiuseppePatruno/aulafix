FROM node:22-alpine
WORKDIR /app

COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci
COPY frontend ./frontend
RUN cd frontend && npm run build

COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev
COPY backend ./backend

WORKDIR /app/backend
ENV NODE_ENV=production
EXPOSE 5000

CMD ["npm", "start"]
