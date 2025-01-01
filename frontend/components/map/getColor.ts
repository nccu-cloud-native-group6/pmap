/**
 * Returns a color based on the input value and theme.
 * The value is (原本) classified into 10 classes (0-5),
 * but now uses a continuous gradient from 0 to 5.
 * @param value - The input value (assumed to be between 0 and 5).
 * @param isDark - Boolean to determine if the theme is dark.
 * @returns The corresponding color as a string.
 */
const getColor = (value: number, isDark: boolean): string => {
  // 異常值，給一個預設灰色
  if (value < 0 || value > 5) {
    console.warn(`Value ${value} is out of bounds (0-5).`);
    return isDark ? "#505050" : "#808080"; // Default gray color for out-of-bound values
  }

  // 0 代表無雨或晴天，可回傳 transparent
  if (value === 0) {
    return "transparent";
  }

  // lightColors: 兩個端點的漸層 (起始 / 結束)
  const lightColors = [
    "#ebf5ff", // Light Start
    "#0051cc", // Light End
  ];

  // darkColors: 兩個端點的漸層 (起始 / 結束)
  const darkColors = [
    "#66ccff", // Dark Start
    "#003366", // Dark End
  ];

  // 計算連續漸層的「比例」(0 ~ 1)
  // 原程式使用 `Math.floor(value * 2)` 來索引陣列，現在把它改成線性比例
  const index = value / 5; 

  // 依照是否為 dark 決定要用哪一組漸層端點
  const startColor = isDark ? darkColors[0] : lightColors[0];
  const endColor = isDark ? darkColors[1] : lightColors[1];

  // 執行顏色線性插值
  return interpolateHex(startColor, endColor, index);
};

export default getColor;

/**
 * 將兩個 hex 顏色依照參數 t (0~1) 做線性插值，回傳插值後的 hex 顏色
 * @param startHex - 開始顏色 (Hex)
 * @param endHex - 結束顏色 (Hex)
 * @param t - 線性插值參數 (0~1)
 * @returns 線性插值後的 Hex 顏色
 */
function interpolateHex(startHex: string, endHex: string, t: number): string {
  const startRGB = hexToRgb(startHex);
  const endRGB = hexToRgb(endHex);

  if (!startRGB || !endRGB) {
    return "#000000"; // fallback
  }

  // 線性插值 (lerp)
  const r = Math.round(startRGB.r + (endRGB.r - startRGB.r) * t);
  const g = Math.round(startRGB.g + (endRGB.g - startRGB.g) * t);
  const b = Math.round(startRGB.b + (endRGB.b - startRGB.b) * t);

  return rgbToHex(r, g, b);
}

/**
 * Hex 轉 RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.replace("#", "");
  if (cleaned.length !== 6) {
    return null;
  }
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);

  if ([r, g, b].some((channel) => Number.isNaN(channel))) {
    return null;
  }
  return { r, g, b };
}

/**
 * RGB 轉 Hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = n.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return "#" + toHex(r) + toHex(g) + toHex(b);
}
