/**
 * Returns a color based on the input value.
 * The value is classified into 10 classes (0-10).
 * @param value - The input value (assumed to be between 0 and 10).
 * @returns The corresponding color as a string.
 */
const getColor = (value: number): string => {
  if (value < 0 || value > 5) {
    console.warn(`Value ${value} is out of bounds (0-5).`);
    return "#808080"; // Default gray color for out-of-bound values
  }

  if (value <= 0.5) return "#f7fbff"; // Lightest blue
  if (value <= 1) return "#deebf7"; // Very light blue
  if (value <= 1.5) return "#c6dbef"; // Light sky blue
  if (value <= 2) return "#9ecae1"; // Light blue
  if (value <= 2.5) return "#6baed6"; // Medium blue
  if (value <= 3) return "#4292c6"; // Medium-dark blue
  if (value <= 3.5) return "#2171b5"; // Dark blue
  if (value <= 4) return "#08519c"; // Deeper blue
  if (value <= 4.5) return "#08306b"; // Navy blue
  if (value <= 5) return "#041f4a"; // Deepest blue
  return "#000033"; // Darkest blue for values between 5 and 5.5
};

export default getColor;