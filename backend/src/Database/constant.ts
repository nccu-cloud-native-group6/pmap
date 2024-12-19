export const hexGridConfig = {
  TAIPEI_BOX: [
    121.45703400595465, 24.960612141045967, 121.66498889301366,
    25.2095095097064,
  ],
  ROUNDING_DIGIT: 7, // lat, lng 的 rounding 小數位數
  CELL_SIZE: 0.5, // Cell size (六邊形大小)
  UNITS: 'kilometers', // cell size 單位
};

export const hexGrid = {
  bbox: hexGridConfig.TAIPEI_BOX,
  cellSide: hexGridConfig.CELL_SIZE,
  options: {
    units: hexGridConfig.UNITS,
  },
};
