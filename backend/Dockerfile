FROM node:20.4-alpine

WORKDIR /app

COPY . /app

ENV CUSTOM_ENV=prod

RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
    && npm ci \
    && npx tsc \
    && cp src/utils/ratelimit.lua dist/utils/ratelimit.lua \
    && npm ci --omit=dev --omit=optional \
    && npm cache clean --force

COPY --chown=appuser:appgroup . .

USER appuser

CMD node /app/dist/app.js