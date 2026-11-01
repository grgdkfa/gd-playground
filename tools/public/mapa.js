
const Terrain = Object.freeze({
  WATER: 'water',
  DARK_WATER: 'dark_water',

  GRASS: 'grass',
  DARK_GRASS: 'dark_grass',

  FOREST: 'forest',
  ROCKS: 'rocks',

  DIRT: 'dirt',
  DARK_DIRT: 'dark_dirt',

  // WALL_HUMAN: 'wall_human',
  // WALL_ORC: 'wall_orc',
});

const transitions = {
  [Terrain.WATER]: {
    [Terrain.DIRT]: 'water_dirt',
  },

  [Terrain.DARK_WATER]: {
    [Terrain.WATER]: 'dark_water_water',
  },

  [Terrain.ROCKS]: {
    [Terrain.DIRT]: 'rocks_dirt',
  },

  [Terrain.DIRT]: {
    [Terrain.GRASS]: 'dirt_grass',
  },

  [Terrain.DARK_DIRT]: {
    [Terrain.DIRT]: 'dark_dirt_dirt',
  },

  [Terrain.DARK_GRASS]: {
    [Terrain.GRASS]: 'dark_grass_grass',
  },

  [Terrain.FOREST]: {
    [Terrain.GRASS]: 'forest_grass',
  },
};

// edge_n - WATER is in the north
// outer_ne - WATER is in the north east
// straight_ne - WATER is in the north-east
const TileTypes = Object.freeze({
  edge_n: 'edge_n',
  edge_e: 'edge_e',
  edge_s: 'edge_s',
  edge_w: 'edge_w',

  outer_ne: 'outer_ne',
  outer_se: 'outer_se',
  outer_sw: 'outer_sw',
  outer_nw: 'outer_nw',

  straight_ne: 'straight_ne',
  straight_nw: 'straight_nw',

  corner_ne: 'corner_ne',
  corner_se: 'corner_se',
  corner_sw: 'corner_sw',
  corner_nw: 'corner_nw',

  full: 'full'
})

const DIRS = [
  { x: 0, y: -1 }, // N
  { x: 1, y: -1 }, // NE
  { x: 1, y: 0 }, // E
  { x: 1, y: 1 }, // SE
  { x: 0, y: 1 }, // S
  { x: -1, y: 1 }, // SW
  { x: -1, y: 0 }, // W
  { x: -1, y: -1 }, // NW 
]

function transition(y) {
  return {
    [TileTypes.edge_n]: `0-2,${y + 2}`,
    [TileTypes.edge_e]: `0-2,${y + 9}`,
    [TileTypes.edge_s]: `0-2,${y + 11}`,
    [TileTypes.edge_w]: `0-2,${y + 4}`,

    [TileTypes.outer_ne]: `0-1,${y + 10}`,
    [TileTypes.outer_se]: `0-1,${y + 13}`,
    [TileTypes.outer_sw]: `0-1,${y + 12}`,
    [TileTypes.outer_nw]: `0-1,${y + 6}`,

    [TileTypes.straight_ne]: `0-1,${y + 5}`,
    [TileTypes.straight_nw]: `0-1,${y + 8}`,

    [TileTypes.corner_ne]: `0-1,${y + 1}`,
    [TileTypes.corner_se]: `0-1,${y + 7}`,
    [TileTypes.corner_sw]: `0-1,${y + 3}`,
    [TileTypes.corner_nw]: `0-1,${y + 0}`,
  }
}

function parseCoords(str) {
  return str.split(';').flatMap(part => {
    const [range, y] = part.split(',');
    const [from, to = from] = range.split('-').map(Number);

    return Array.from(
      { length: to - from + 1 },
      (_, i) => ({
        x: from + i,
        y: Number(y)
      })
    );
  });
}

function parseData(o) {
  const result = {};
  for (const [terrain, types] of Object.entries(o)) {
    result[terrain] = {};
    for (const [type, str] of Object.entries(types)) {
      result[terrain][type] = parseCoords(str);
    }
  }
  return result;
}

const TILES = parseData({
  [Terrain.WATER]: {
    [TileTypes.full]: '0-3,126'
  },
  [Terrain.DARK_WATER]: {
    [TileTypes.full]: '0-3,127'
  },
  [Terrain.DIRT]: {
    [TileTypes.full]: '0-2,128;4-11,128'
  },
  [Terrain.DARK_DIRT]: {
    [TileTypes.full]: '0-2,129;4-11,129'
  },
  [Terrain.GRASS]: {
    [TileTypes.full]: '0-2,130;4-11,130'
  },
  [Terrain.DARK_GRASS]: {
    [TileTypes.full]: '0-2,131;4-11,131'
  },
  [Terrain.FOREST]: {
    [TileTypes.full]: '0-2,132'
  },
  [Terrain.ROCKS]: {
    [TileTypes.full]: '0-3,133'
  },
  [Terrain.DARK_WATER + '|' + Terrain.WATER]: transition(0),
  [Terrain.WATER + '|' + Terrain.DIRT]: transition(14),
  [Terrain.DARK_DIRT + '|' + Terrain.DIRT]: transition(28),
  [Terrain.ROCKS + '|' + Terrain.DIRT]: transition(42),
  [Terrain.DIRT + '|' + Terrain.GRASS]: transition(56),
  [Terrain.DARK_GRASS + '|' + Terrain.GRASS]: transition(70),
  [Terrain.FOREST + '|' + Terrain.GRASS]: transition(84),
})

