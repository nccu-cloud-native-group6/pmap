import React, { useState } from "react";

interface BookmarkIconProps {
    initialClicked?: boolean;
}

const BookmarkIcon: React.FC<BookmarkIconProps> = ({ initialClicked = false }) => {
    const [isClicked, setIsClicked] = useState(initialClicked);

    const handleClick = () => {
        setIsClicked(!isClicked);
    };

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={isClicked ? "blue" : "currentColor"}
            className="w-6 h-6"
            onClick={handleClick}
            style={{ cursor: "pointer" }}
        >
            <path
                fillRule="evenodd"
                d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z"
                clipRule="evenodd"
            />
        </svg>
    );
};

export default BookmarkIcon;
