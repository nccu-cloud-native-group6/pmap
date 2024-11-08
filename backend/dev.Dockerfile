FROM node:20.4-alpine

WORKDIR /app

COPY . /app

RUN npm install \
    && chmod +x /app/script/entrypoint.sh

ENTRYPOINT ["/app/script/entrypoint.sh"]
