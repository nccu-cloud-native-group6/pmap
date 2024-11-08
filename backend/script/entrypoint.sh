#!/bin/sh

echo "初始化資料庫..."
npm run migrate

echo "Starting Node.js application"
npm run dev:start