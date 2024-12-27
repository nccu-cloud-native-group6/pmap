FROM node:20.4-alpine

WORKDIR /app

COPY . /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
    && npm ci 

COPY --chown=appuser:appgroup . .

USER appuser

ENTRYPOINT ["npm", "start"]
