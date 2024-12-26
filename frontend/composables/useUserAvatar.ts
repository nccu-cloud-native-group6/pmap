"use client";

import { animalList,backgroundColors } from "./lists";

// 隨機選擇動物名稱
const getRandomAnimal = (): string => {
  return animalList[Math.floor(Math.random() * animalList.length)];
};

// 隨機選擇背景顏色
const getRandomBackgroundColor = (): string => {
  return backgroundColors[Math.floor(Math.random() * backgroundColors.length)];
};

// Composable 函數
export const useUserAvatar = () => {
  const getUserAvatarHTML = (user: {
    photoUrl?: string;
    userName?: string;
  }): string => {
    const avatarUrl =
      user.userName === "Guest"
        ? `https://ssl.gstatic.com/docs/common/profile/${getRandomAnimal()}_lg.png`
        : user.photoUrl;

    const backgroundColor =
      user.userName === "Guest" ? getRandomBackgroundColor() : "transparent";

    return `
      <div style="
        position: relative; 
        text-align: center; 
        background: ${backgroundColor}; 
        padding: ${user.userName === "Guest" ? "5px" : "0"}; 
        border-radius: 50%; 
        border: ${user.userName === "Guest" ? "2px solid white" : "none"};
        width: 50px; 
        height: 50px;
        display: flex; 
        align-items: center; 
        justify-content: center;
      ">
        <img 
          src="${user.userName === "Guest" ? avatarUrl : avatarUrl}" 
          alt="${user.userName}" 
          style="
            width: 40px; 
            height: 40px; 
            border-radius: 50%; 
            border: ${user.userName !== "Guest" ? "2px solid white" : "none"};
            box-sizing: border-box;
          "
        />
      </div>
    `;
  };

  const getAvatarImageUrl = async (user: {
    photoUrl?: string;
    userName?: string;
  }): Promise<string> => {
    const avatarUrl =
      user.userName === "Guest"
        ? `https://ssl.gstatic.com/docs/common/profile/${getRandomAnimal()}_lg.png`
        : user.photoUrl;

    const backgroundColor =
      user.userName === "Guest" ? getRandomBackgroundColor() : "transparent";

    // 創建 canvas
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) throw new Error("Canvas rendering context not available");

    // 設置 canvas 大小
    canvas.width = 100; // 根據需求調整尺寸
    canvas.height = 100;

    // 繪製背景顏色
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 獲取圖片並繪製到 canvas
    const img = new Image();
    img.crossOrigin = "anonymous"; // 避免跨域問題
    img.src = avatarUrl || "";

    return new Promise((resolve, reject) => {
      img.onload = () => {
        const imageSize = 80; // 圖片大小
        const offset = (canvas.width - imageSize) / 2;

        ctx.beginPath();
        ctx.arc(
          canvas.width / 2,
          canvas.height / 2,
          imageSize / 2,
          0,
          Math.PI * 2
        );
        ctx.clip();

        ctx.drawImage(img, offset, offset, imageSize, imageSize);

        // 導出為 Base64 URL
        const imageUrl = canvas.toDataURL("image/jpeg", 0.8); // 80% 壓縮
        resolve(imageUrl);
      };

      img.onerror = (err) => {
        reject(new Error("Failed to load avatar image"));
      };
    });
  };

  return { getUserAvatarHTML, getAvatarImageUrl };
};
