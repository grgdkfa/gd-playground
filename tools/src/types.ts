export type Direction = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";

export const DIRECTIONS: {
  direction: Direction;
  dx: number;
  dy: number;
}[] = [
  { direction: "n", dx: 0, dy: -1 },
  { direction: "s", dx: 0, dy: 1 },
  { direction: "w", dx: -1, dy: 0 },
  { direction: "e", dx: 1, dy: 0 },

  { direction: "nw", dx: -1, dy: -1 },
  { direction: "ne", dx: 1, dy: -1 },
  { direction: "sw", dx: -1, dy: 1 },
  { direction: "se", dx: 1, dy: 1 },
];

export const EDGE_INDICES: Record<Direction, number[]> = {
  n: [0, 1],
  s: [2, 3],
  w: [0, 2],
  e: [1, 3],

  nw: [0],
  ne: [1],
  sw: [2],
  se: [3],
};

export const OPPOSITE: Record<Direction, Direction> = {
  n: "s",
  s: "n",
  w: "e",
  e: "w",
  nw: "se",
  ne: "sw",
  sw: "ne",
  se: "nw",
};

export interface Position {
  x: number;
  y: number;
}

export interface MapData {
  width: number;
  height: number;
  cells: (string | null)[][];
}

export type Terrain = string;

export type TilePattern = [
  Terrain, Terrain,
  Terrain, Terrain
];

export interface Tile {
  id: string;
  pattern: TilePattern;
}