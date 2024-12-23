import React from "react";

interface RainRatingSelectorProps {
  rainRating: number;
  onSelect: (rating: number) => void;
}

const RainRatingSelector: React.FC<RainRatingSelectorProps> = ({
  rainRating,
  onSelect,
}) => {
  const handleRainSelect = (rating: number) => {
    onSelect(rating);
  };

  const handleSunClick = () => {
    onSelect(0); // Reset rain rating to 0
  };

  return (
    <div className="mt-4">
      <p className="mb-2">Rainfall Rating</p>
      <div className="flex space-x-2 items-center">
        {/* Sun Icon */}
        <span
          onClick={handleSunClick}
          style={{
            cursor: "pointer",
            fontSize: "1.5rem",
            color: rainRating === 0 ? "#FFD700" : "black", // Highlight sun when rating is 0
            filter: rainRating === 0 ? "none" : "grayscale(100%)",
          }}
        >
          ☀️
        </span>
        {/* Raindrop Icons */}
        {Array.from({ length: 5 }, (_, index) => {
          const ratingValue = index + 1;
          const selected = ratingValue <= rainRating;
          return (
            <span
              key={index}
              onClick={() => handleRainSelect(ratingValue)}
              style={{
                cursor: "pointer",
                fontSize: "1.5rem",
                color: selected ? "#1E90FF" : "black",
                filter: rainRating === 0 ? "grayscale(100%)" : selected ? "none" : "grayscale(100%)",
              }}
            >
              💧
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default RainRatingSelector;
