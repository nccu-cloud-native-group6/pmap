'use client';

import L from 'leaflet';

// 動物列表
const animalList = [
  "alligator",
  "anteater",
  "armadillo",
  "auroch",
  "axolotl",
  "badger",
  "bat",
  "bear",
  "beaver",
  "blobfish",
  "buffalo",
  "camel",
  "chameleon",
  "cheetah",
  "chipmunk",
  "chinchilla",
  "chupacabra",
  "cormorant",
  "coyote",
  "crow",
  "dingo",
  "dinosaur",
  "dog",
  "dolphin",
  "dragon",
  "duck",
  "dumbooctopus",
  "elephant",
  "ferret",
  "fox",
  "frog",
  "giraffe",
  "goose",
  "gopher",
  "grizzly",
  "hamster",
  "hedgehog",
  "hippo",
  "hyena",
  "jackal",
  "jackalope",
  "ibex",
  "ifrit",
  "iguana",
  "kangaroo",
  "kiwi",
  "koala",
  "kraken",
  "lemur",
  "leopard",
  "liger",
  "lion",
  "llama",
  "manatee",
  "mink",
  "monkey",
  "moose",
  "narwhal",
  "nyancat",
  "orangutan",
  "otter",
  "panda",
  "penguin",
  "platypus",
  "python",
  "pumpkin",
  "quagga",
  "quokka",
  "rabbit",
  "raccoon",
  "rhino",
  "sheep",
  "shrew",
  "skunk",
  "slowloris",
  "squirrel",
  "tiger",
  "turtle",
  "unicorn",
  "walrus",
  "wolf",
  "wolverine",
  "wombat",
];

// 背景顏色列表
const backgroundColors = [
  "#AA47BC",
  "#7A20A2",
  "#78909C",
  "#465A65",
  "#EC407A",
  "#C2185B",
  "#5C6BC0",
  "#0288D1",
  "#005497",
  "#008A98",
  "#008679",
  "#004438",
  "#679E39",
  "#33691E",
  "#8C6E63",
  "#5D4038",
  "#7E57C2",
  "#512DA7",
  "#EF6C00",
  "#F5511E",
  "#BF360D",
];

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
  // 添加用戶 Avatar 到地圖
  const addUserAvatar = (
    map: L.Map,
    user: {
      lat: number;
      lng: number;
      photoUrl?: string;
      userName?: string;
    }
  ) => {
    // 獲取 Avatar 圖片 URL
    const avatarUrl = user.photoUrl
      ? user.photoUrl
      : `https://ssl.gstatic.com/docs/common/profile/${getRandomAnimal()}_lg.png`;

    // 隨機背景顏色
    const backgroundColor = user.userName === 'Guest' ? getRandomBackgroundColor() : 'transparent';

    // 自定義圖標樣式
    const avatarIcon = L.divIcon({
      className: "custom-user-icon",
      html: `
      <div style="
      position: relative; 
      text-align: center; 
      background: ${backgroundColor}; 
      padding: 5px; 
      border-radius: 50%; 
      border: 2px solid white;
      width: 50px; 
      height: 50px;
      box-sizing: border-box;
      ">
      <img 
      src="${user.userName === 'Guest' ? `https://ssl.gstatic.com/docs/common/profile/${getRandomAnimal()}_lg.png` : avatarUrl}" 
      alt="${user.userName}" 
      style="width: 40px; height: 40px; border-radius: 50%;" 
      />
      </div>
      `,
      iconSize: [50, 50],
      iconAnchor: [25, 50],
    });

    // 在地圖上添加標記
    const marker = L.marker([user.lat, user.lng], { icon: avatarIcon }).addTo(map);

    return marker;
  };

  return { addUserAvatar };
};
