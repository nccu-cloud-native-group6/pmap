import React from "react";

interface RainRatingSelectorProps {
  rainRating: number;
  onSelect: (rating: number) => void;
}

const RainRatingSelector: React.FC<RainRatingSelectorProps> = ({
  rainRating,
  onSelect,
}) => {
  return (
    <div className="mt-4">
      <p className="mb-2">Rainfall Rating (1~5)：</p>
      <div className="flex space-x-2">
        {Array.from({ length: 5 }, (_, index) => {
          const ratingValue = index + 1;
          const selected = ratingValue <= rainRating;
          return (
            <span
              key={index}
              onClick={() => onSelect(ratingValue)}
              style={{
                cursor: "pointer",
                fontSize: "1.5rem",
                color: selected ? "#1E90FF" : "black",
                filter: selected ? "none" : "grayscale(100%)",
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
