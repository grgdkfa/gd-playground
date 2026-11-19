import { Direction, DIRECTIONS, EDGE_INDICES, MapData, OPPOSITE, Position, Tile, TilePattern } from "./types.js";
import { tiles } from "./mapData.js";

const catalog = new Map<string, Tile>();

const patternKey = (pattern: TilePattern) =>
  pattern.join("");

for (const tile of tiles) {
  catalog.set(patternKey(tile.pattern), tile);
}

export function createMap(
  width: number,
  height: number,
  defaultTile: string
): MapData {
  return {
    width,
    height,
    cells: Array.from(
      { length: height },
      () => Array(width).fill(defaultTile)
    ),
  };
}

export function getTile(
  map: MapData,
  tiles: Tile[],
  x: number,
  y: number
): Tile | null {
  if (
    x < 0 ||
    y < 0 ||
    x >= map.width ||
    y >= map.height
  ) {
    return null;
  }

  const id = map.cells[y][x];

  if (id === null) return null;

  return tiles.find(tile => tile.id === id) ?? null;
}

function positionKey(x: number, y: number): string {
  return `${x},${y}`;
}

function canTransition(
  from: TilePattern,
  to: TilePattern,
  allowed: number[]
): boolean {
  let pair: string | null = null;
  let changed = false;

  for (let i = 0; i < 4; i++) {
    if (from[i] === to[i]) continue;

    if (!allowed.includes(i)) return false;

    changed = true;

    const currentPair = [from[i], to[i]]
      .sort()
      .join("");

    if (pair === null) {
      pair = currentPair;
    } else if (pair !== currentPair) {
      return false;
    }
  }

  return changed;
}

function findTransitionPath(
  from: TilePattern,
  to: TilePattern,
  allowed: number[],
  tiles: Tile[]
): Tile[] | null {
  const start = patternKey(from);
  const target = patternKey(to);

  if (start === target) return [];

  if (!catalog.has(target)) return null;

  const queue: TilePattern[] = [from];

  const visited = new Set<string>([start]);

  const parent = new Map<
    string,
    { previous: string; tile: Tile }
  >();

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentKey = patternKey(current);

    for (const candidate of tiles) {
      const next = candidate.pattern;
      const nextKey = patternKey(next);

      if (visited.has(nextKey)) continue;

      if (!canTransition(current, next, allowed)) {
        continue;
      }

      visited.add(nextKey);

      parent.set(nextKey, {
        previous: currentKey,
        tile: candidate,
      });

      if (nextKey === target) {
        const path: Tile[] = [];
        let key = target;

        while (key !== start) {
          const step = parent.get(key)!;

          path.unshift(step.tile);
          key = step.previous;
        }

        return path;
      }

      queue.push(next);
    }
  }

  return null;
}

function resolveNeighbor(
  source: Tile,
  neighbor: Tile,
  direction: Direction,
  tiles: Tile[]
): Tile | null {
  const sourceEdge = EDGE_INDICES[direction];

  const neighborEdge = EDGE_INDICES[
    OPPOSITE[direction]
  ];

  const target: TilePattern = [...neighbor.pattern];

  for (let i = 0; i < 2; i++) {
    target[neighborEdge[i]] =
      source.pattern[sourceEdge[i]];
  }

  const path = findTransitionPath(
    neighbor.pattern,
    target,
    neighborEdge,
    tiles
  );

  if (path === null) {
    return null;
  }

  return path.length > 0
    ? path[path.length - 1]
    : neighbor;
}

export function placeTile(
  map: MapData,
  tiles: Tile[],
  x: number,
  y: number,
  tileId: string
): void {
  const initialTile = tiles.find(t => t.id === tileId);

  if (!initialTile) {
    throw new Error(`Unknown tile: ${tileId}`);
  }

  if (
    x < 0 || y < 0 ||
    x >= map.width || y >= map.height
  ) {
    throw new Error("Out of bounds");
  }

  // Устанавливаем исходный тайл.
  map.cells[y][x] = tileId;

  // Защищаем его от любых изменений.
  const locked = new Set<string>([
    positionKey(x, y),
  ]);

  const queue: Position[] = [{ x, y }];
  const queued = new Set<string>([
    positionKey(x, y),
  ]);

  let iterations = 0;
  const maxIterations = map.width * map.height * 100;

  while (queue.length > 0) {
    if (++iterations > maxIterations) {
      throw new Error("Resolution did not converge");
    }

    const current = queue.shift()!;
    queued.delete(positionKey(current.x, current.y));

    const source = getTile(
      map, tiles, current.x, current.y
    );

    if (!source) continue;

    for (const { direction, dx, dy } of DIRECTIONS) {
      const nx = current.x + dx;
      const ny = current.y + dy;

      if (
        nx < 0 || ny < 0 ||
        nx >= map.width || ny >= map.height
      ) {
        continue;
      }

      const key = positionKey(nx, ny);

      // Никогда не изменяем зафиксированные тайлы.
      if (locked.has(key)) continue;

      const neighbor = getTile(map, tiles, nx, ny);
      if (!neighbor) continue;

      const resolved = resolveNeighbor(
        source,
        neighbor,
        direction,
        tiles
      );

      if (!resolved) {
        throw new Error(
          `No transition at (${nx}, ${ny})`
        );
      }

      if (resolved.id === neighbor.id) continue;

      map.cells[ny][nx] = resolved.id;

      // Добавляем изменившийся тайл в очередь.
      if (!queued.has(key)) {
        queue.push({ x: nx, y: ny });
        queued.add(key);
      }
    }
  }
}