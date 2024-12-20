/**
 * Returns a color based on the input value.
 * The value is classified into 6 classes (0-5).
 * @param value - The input value (assumed to be between 0 and 5).
 * @returns The corresponding color as a string.
 */
const getColor = (value: number): string => {
    if (value < 0 || value > 5) {
      console.warn(`Value ${value} is out of bounds (0-5).`);
      return "#808080"; // Default gray color for out-of-bound values
    }
  
    if (value <= 1) return "#f7fbff"; // Light blue
    if (value <= 2) return "#c6dbef"; // Light sky blue
    if (value <= 3) return "#6baed6"; // Medium blue
    if (value <= 4) return "#2171b5"; // Dark blue
    return "#08306b"; // Navy blue
  };
  
  export default getColor;
  