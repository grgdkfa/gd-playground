import { tiles } from "./mapData.js";
import { CardinalDirection, MapData, Tile } from "./types.js";

export type CompatibilityMatrix = Map<
  string,
  Record<CardinalDirection, Set<string>>
>;

function createCompatibilityMatrix(
  tiles: Tile[]
): CompatibilityMatrix {
  const matrix: CompatibilityMatrix = new Map();

  for (const tile of tiles) {
    matrix.set(tile.id, {
      w: new Set(),
      e: new Set(),
      n: new Set(),
      s: new Set(),
    });
  }

  for (const a of tiles) {
    for (const b of tiles) {
      const aPattern = a.pattern;
      const bPattern = b.pattern;

      const compatibility = matrix.get(a.id)!;

      // B находится справа от A
      if (
        aPattern[1] === bPattern[0] &&
        aPattern[3] === bPattern[2]
      ) {
        compatibility.e.add(b.id);
      }

      // B находится слева от A
      if (
        aPattern[0] === bPattern[1] &&
        aPattern[2] === bPattern[3]
      ) {
        compatibility.w.add(b.id);
      }

      // B находится снизу от A
      if (
        aPattern[2] === bPattern[0] &&
        aPattern[3] === bPattern[1]
      ) {
        compatibility.s.add(b.id);
      }

      // B находится сверху от A
      if (
        aPattern[0] === bPattern[2] &&
        aPattern[1] === bPattern[3]
      ) {
        compatibility.n.add(b.id);
      }
    }
  }

  return matrix;
}

export const compatibilityMatrix =
  createCompatibilityMatrix(tiles)

function canAdjacent(
  a: Tile,
  b: Tile,
  direction: CardinalDirection
): boolean {
  return compatibilityMatrix
    .get(a.id)!
    [direction]
    .has(b.id);
}

export type Wave = Set<string>[];

export interface WaveConfig {
  width: number;
  height: number;
  tiles: Tile[];
  compatibility: CompatibilityMatrix;
}

export function createWave(
  width: number,
  height: number,
  tiles: Tile[]
): Wave {
  const allTileIds = tiles.map(tile => tile.id);

  return Array.from(
    { length: width * height },
    () => new Set(allTileIds)
  );
}

interface Neighbor {
  index: number;
  direction: CardinalDirection;
}

const directions: Record<
  CardinalDirection,
  { dx: number; dy: number; opposite: CardinalDirection }
> = {
  w: {
    dx: -1,
    dy: 0,
    opposite: 'e',
  },
  e: {
    dx: 1,
    dy: 0,
    opposite: 'w',
  },
  n: {
    dx: 0,
    dy: -1,
    opposite: 's',
  },
  s: {
    dx: 0,
    dy: 1,
    opposite: 'n',
  },
};

function getNeighbors(
  index: number,
  width: number,
  height: number
): Neighbor[] {
  const x = index % width;
  const y = Math.floor(index / width);

  const result: Neighbor[] = [];

  for (const [direction, { dx, dy }] of Object.entries(directions) as [
    CardinalDirection,
    typeof directions[CardinalDirection]
  ][]) {
    const nx = x + dx;
    const ny = y + dy;

    if (nx < 0 || nx >= width || ny < 0 || ny >= height) {
      continue;
    }

    result.push({
      index: ny * width + nx,
      direction,
    });
  }

  return result;
}

export function propagate(
  wave: Wave,
  compatibility: CompatibilityMatrix,
  width: number,
  height: number,
  startIndices: number[]
): boolean {
  const queue = [...startIndices];
  const queued = new Set(startIndices);

  while (queue.length > 0) {
    const index = queue.shift()!;
    queued.delete(index);

    const currentCandidates = wave[index];

    if (currentCandidates.size === 0) {
      return false;
    }

    const neighbors = getNeighbors(index, width, height);

    for (const neighbor of neighbors) {
      const neighborCandidates = wave[neighbor.index];

      const supported = new Set<string>();

      // Собираем все варианты соседней клетки,
      // которые совместимы хотя бы с одним текущим кандидатом.
      for (const currentId of currentCandidates) {
        const compatible = compatibility
          .get(currentId)?.[neighbor.direction];

        if (!compatible) continue;

        for (const neighborId of compatible) {
          if (neighborCandidates.has(neighborId)) {
            supported.add(neighborId);
          }
        }
      }

      // Удаляем варианты, для которых больше нет поддержки.
      let changed = false;

      for (const neighborId of neighborCandidates) {
        if (!supported.has(neighborId)) {
          neighborCandidates.delete(neighborId);
          changed = true;
        }
      }

      if (neighborCandidates.size === 0) {
        return false;
      }

      // Если домен соседа изменился, нужно проверить его соседей.
      if (changed && !queued.has(neighbor.index)) {
        queue.push(neighbor.index);
        queued.add(neighbor.index);
      }
    }
  }

  return true;
}

export interface ObserveResult {
  index: number;
  tileId: string;
}

type TileCostMap = (index: number) => Map<string, number> | undefined;

export interface ObserveOptions {
  wave: Wave;
  width: number;
  height: number;
  costs?: TileCostMap;
  temperature?: number;
}

function randomWeighted(
  candidates: string[],
  costs: Map<string, number>,
  temperature: number
): string {
  if (temperature <= 0) {
    return candidates.reduce((best, current) =>
      (costs.get(current) ?? 0) < (costs.get(best) ?? 0)
        ? current
        : best
    );
  }

  const weights = candidates.map(id => {
    const cost = costs.get(id) ?? 0;
    return Math.exp(-cost / temperature);
  });

  const total = weights.reduce((sum, weight) => sum + weight, 0);

  let random = Math.random() * total;

  for (let i = 0; i < candidates.length; i++) {
    random -= weights[i];

    if (random <= 0) {
      return candidates[i];
    }
  }

  return candidates[candidates.length - 1];
}

export function observe({
  wave,
  costs,
  temperature = 1,
}: ObserveOptions): ObserveResult | null {
  let minCount = Infinity;
  const candidates: number[] = [];

  // MRV: выбираем клетку с минимальным количеством вариантов.
  for (let i = 0; i < wave.length; i++) {
    const count = wave[i].size;

    if (count === 0) {
      throw new Error(`Contradiction at cell ${i}`);
    }

    if (count <= 1) continue;

    if (count < minCount) {
      minCount = count;
      candidates.length = 0;
      candidates.push(i);
    } else if (count === minCount) {
      candidates.push(i);
    }
  }

  // Все клетки определены.
  if (candidates.length === 0) {
    return null;
  }

  // Случайно выбираем клетку среди равных по MRV.
  const index = candidates[
    Math.floor(Math.random() * candidates.length)
  ];

  const tileIds = [...wave[index]];

  const cellCosts = costs ? costs(index) ?? new Map() : new Map();

  const tileId = randomWeighted(
    tileIds,
    cellCosts,
    temperature
  );

  return {
    index,
    tileId,
  };
}

interface ResolveOptions {
  width: number;
  height: number;
  tiles: Tile[];
  compatibility: CompatibilityMatrix;
  costs?: TileCostMap;
  temperature?: number;
}

export function resolve({
  width,
  height,
  tiles,
  compatibility,
  costs,
  temperature = 1,
}: ResolveOptions): string[] | null {
  const wave = createWave(width, height, tiles);

  while (true) {
    const result = observe({
      wave,
      width,
      height,
      costs,
      temperature,
    });

    if (!result) {
      return wave.map(cell => [...cell][0]);
    }

    wave[result.index] = new Set([result.tileId]);

    const success = propagate(
      wave,
      compatibility,
      width,
      height,
      [result.index]
    );

    if (!success) {
      return null;
    }
  }
}

export function processMap(
  map: MapData,
  temperature: number = 1
) {
  const result = resolve({
    width: map.width,
    height: map.height,
    tiles,
    compatibility: compatibilityMatrix,
    temperature,
  });

  if (!result) {
    throw new Error("Failed to resolve the map.");
  }

  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const index = y * map.width + x;
      const tileId = result[index];
      map.cells[y][x] = tileId;
    }
  }
}
  