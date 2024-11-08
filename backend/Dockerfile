FROM node:20.4-alpine

WORKDIR /app

COPY . /app


ARG CUSTOM_ENV
ENV CUSTOM_ENV=${CUSTOM_ENV}

RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
    && npm ci \
    && npx tsc \
    && npm ci --omit=dev --omit=optional \
    && npm cache clean --force

COPY --chown=appuser:appgroup . .

USER appuser

CMD node /app/dist/src/app.js