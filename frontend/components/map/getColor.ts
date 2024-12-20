/**
 * Returns a color based on the input value.
 * The value is classified into 10 classes (0-10).
 * @param value - The input value (assumed to be between 0 and 10).
 * @returns The corresponding color as a string.
 */
const getColor = (value: number): string => {
  if (value < 0 || value > 10) {
    console.warn(`Value ${value} is out of bounds (0-10).`);
    return "#808080"; // Default gray color for out-of-bound values
  }

  if (value <= 1) return "#f7fbff"; // Lightest blue
  if (value <= 2) return "#deebf7"; // Very light blue
  if (value <= 3) return "#c6dbef"; // Light sky blue
  if (value <= 4) return "#9ecae1"; // Light blue
  if (value <= 5) return "#6baed6"; // Medium blue
  if (value <= 6) return "#4292c6"; // Medium-dark blue
  if (value <= 7) return "#2171b5"; // Dark blue
  if (value <= 8) return "#08519c"; // Deeper blue
  if (value <= 9) return "#08306b"; // Navy blue
  return "#041f4a"; // Deepest blue
};

export default getColor;