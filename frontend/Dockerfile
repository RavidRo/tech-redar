# syntax=docker/dockerfile:1.7

FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

CMD ["sh", "-lc", "npm run dev -- --host 0.0.0.0"]


