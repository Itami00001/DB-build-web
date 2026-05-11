FROM node:18.18-alpine

WORKDIR /app

# Устанавливаем nodemon глобально для hot reload и шрифты с поддержкой кириллицы
RUN npm install -g nodemon && \
    apk add --no-cache ttf-dejavu && \
    fc-cache -fv

COPY package*.json ./

RUN npm install

COPY ./app ./app
COPY ./public ./public
COPY ./server.js ./
COPY ./nodemon.json ./

EXPOSE 3000

# Используем nodemon для hot reload в разработке
CMD ["npm", "run", "dev"]
