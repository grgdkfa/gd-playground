
const WATER = 0
const DARK_WATER = 1
const GRASS = 2
const DARK_GRASS = 3
const FOREST = 4
const ROCKS = 5
const DIRT = 6
const DARK_DIRT = 7
const WALL_HUMAN = 8
const WALL_ORC = 9
// transitional
const WATER_DARK_WATER = 10
const DIRT_WATER = 11
const DIRT_DARK_DIRT = 12
const DIRT_ROCKS = 13
const DIRT_GRASS = 14
const GRASS_DARK_GRASS = 15
const GRASS_FOREST = 16

const Terrain = Object.freeze({
  WATER: 'water',
  DARK_WATER: 'dark_water',

  GRASS: 'grass',
  DARK_GRASS: 'dark_grass',

  FOREST: 'forest',
  ROCKS: 'rocks',

  DIRT: 'dirt',
  DARK_DIRT: 'dark_dirt',

  WALL_HUMAN: 'wall_human',
  WALL_ORC: 'wall_orc',
});

const transitions = {
  [Terrain.WATER]: {
    [Terrain.DARK_WATER]: 'water_dark_water',
    [Terrain.DIRT]: 'water_dirt',
  },

  [Terrain.DIRT]: {
    [Terrain.DARK_DIRT]: 'dirt_dark_dirt',
    [Terrain.GRASS]: 'dirt_grass',
    [Terrain.ROCKS]: 'dirt_rocks',
  },

  [Terrain.GRASS]: {
    [Terrain.DARK_GRASS]: 'grass_dark_grass',
    [Terrain.FOREST]: 'grass_forest',
  },
};

const TileTypes = Object.freeze({
  edge_n: 'edge_n',
  edge_e: 'edge_e',
  edge_s: 'edge_s',
  edge_w: 'edge_w',

  outer_ne: 'outer_ne',
  outer_se: 'outer_se',
  outer_sw: 'outer_sw',
  outer_nw: 'outer_nw',

  straight_ns: 'straight_ns',
  straight_ew: 'straight_ew',

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

const TILES = {
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
  [Terrain.WATER + '|' + Terrain.DARK_WATER]: {
    [TileTypes.]
  }
}