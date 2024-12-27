local key = KEYS[1]
local now = tonumber(ARGV[1])
local windowSize = tonumber(ARGV[2])
local maxRequests = tonumber(ARGV[3])

-- 計算當前窗口和上一個窗口的開始時間
local currentWindow = math.floor(now / windowSize) * windowSize
local previousWindow = currentWindow - windowSize

-- 生成當前和上一個窗口的鍵
local currentKey = key .. ':' .. currentWindow
local previousKey = key .. ':' .. previousWindow

-- 獲取當前和上一個窗口的請求計數
local currentCount = tonumber(redis.call('GET', currentKey) or '0')
local previousCount = tonumber(redis.call('GET', previousKey) or '0')

-- 計算時間權重
local elapsedTime = now - currentWindow
local weight = (windowSize - elapsedTime) / windowSize

-- 計算加權的總請求數
local totalCount = previousCount * weight + currentCount + 1

if totalCount > maxRequests then
  return 0
else
  -- 增加當前窗口的計數
  redis.call('INCR', currentKey)
  -- 設置鍵的過期時間，防止無限增長
  redis.call('EXPIRE', currentKey, windowSize * 2)
  return 1
end
