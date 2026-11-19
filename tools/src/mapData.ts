import { Tile } from "./types.js";
// import DATA from '../mapa.json';

export const Terrain: Record<string, string> = {
  WATER: 'w',
  DARK_WATER: 'W',

  GRASS: 'g',
  DARK_GRASS: 'G',

  FOREST: 'f',
  ROCKS: 'r',

  DIRT: 'd',
  DARK_DIRT: 'D'
};

const transitions = {
  [Terrain.WATER]: {
    [Terrain.DIRT]: 'wd',
  },

  [Terrain.DARK_WATER]: {
    [Terrain.WATER]: 'Ww',
  },

  [Terrain.ROCKS]: {
    [Terrain.DIRT]: 'rd',
  },

  [Terrain.DIRT]: {
    [Terrain.GRASS]: 'dg',
  },

  [Terrain.DARK_DIRT]: {
    [Terrain.DIRT]: 'dD',
  },

  [Terrain.DARK_GRASS]: {
    [Terrain.GRASS]: 'Gg',
  },

  [Terrain.FOREST]: {
    [Terrain.GRASS]: 'fg',
  },
};

interface MapDataJson {
    [terrain: string]: {
        [pattern: string]: {
            x: number;
            y: number;
        }[];
    }
}

function createTiles(): Tile[] {
    const result: Tile[] = [];
    for (const terrain in Terrain) {
        const v = Terrain[terrain];
        const t: Tile = {
            id: v,
            pattern: [v, v, v, v],
        }
        result.push(t);
    }
    for (const from in transitions) {
        for (const to in transitions[from]) {
            for (let i = 1; i < 15; i++) {
                const pattern = [
                    i & 1 ? from : to,
                    i & 2 ? from : to,
                    i & 4 ? from : to,
                    i & 8 ? from : to,
                ] as [string, string, string, string];
                const id = transitions[from][to] + i;
                const t: Tile = {
                    id,
                    pattern,
                }
                result.push(t);
            }
        }
    }
    return result;
}

export const tiles: Tile[] = createTiles();