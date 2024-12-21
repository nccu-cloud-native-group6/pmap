/**
 * Returns a color based on the input value and theme.
 * The value is classified into 10 classes (0-5).
 * @param value - The input value (assumed to be between 0 and 5).
 * @param isDark - Boolean to determine if the theme is dark.
 * @returns The corresponding color as a string.
 */
const getColor = (value: number, isDark: boolean): string => {
  if (value < 0 || value > 5) {
    console.warn(`Value ${value} is out of bounds (0-5).`);
    return isDark ? "#505050" : "#808080"; // Default gray color for out-of-bound values
  }

  // Define color scales for light and dark themes
  const lightColors = [
    "#f7fbff", // Lightest blue
    "#deebf7", // Very light blue
    "#c6dbef", // Light sky blue
    "#9ecae1", // Light blue
    "#6baed6", // Medium blue
    "#4292c6", // Medium-dark blue
    "#2171b5", // Dark blue
    "#08519c", // Deeper blue
    "#08306b", // Navy blue
    "#041f4a", // Deepest blue
  ];

  const darkColors = [
    "#1a1a1a", // Darkest gray
    "#2e2e2e", // Very dark gray
    "#424242", // Dark gray
    "#5e5e5e", // Medium dark gray
    "#7a7a7a", // Neutral gray
    "#949494", // Light gray
    "#afafaf", // Lighter gray
    "#c9c9c9", // Near white
    "#e3e3e3", // Very light gray
    "#ffffff", // Pure white
  ];

  // Calculate the index based on the value (0-5 mapped to 0-9)
  const index = Math.min(Math.floor(value * 2), 9);

  // Return the corresponding color based on the theme
  return isDark ? darkColors[index] : lightColors[index];
};

export default getColor;
