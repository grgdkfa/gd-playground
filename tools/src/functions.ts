import { Direction, DIRECTIONS, EDGE_INDICES, EDGE_SUBTILES, MapData, OPPOSITE, Position, Tile, TilePattern } from "./types.js";
import { tiles, transitions } from "./mapData.js";

const catalog = new Map<string, Tile>();

const patternKey = (pattern: TilePattern) =>
  pattern.join("");

for (const tile of tiles) {
  catalog.set(patternKey(tile.pattern), tile);
}

const tileLookup = new Map<string, Tile>();

for (const tile of tiles) {
  tileLookup.set(tile.id, tile);
}

type TerrainCode = string;
type Transitions = Record<TerrainCode, Record<TerrainCode, string>>;

const pathCache = new Map<string, TerrainCode[] | null>();

function buildGraph(transitions: Transitions): Map<TerrainCode, Set<TerrainCode>> {
  const graph = new Map<TerrainCode, Set<TerrainCode>>();

  const addEdge = (from: TerrainCode, to: TerrainCode) => {
    if (!graph.has(from)) graph.set(from, new Set());
    graph.get(from)!.add(to);
  };

  for (const [from, targets] of Object.entries(transitions)) {
    for (const to of Object.keys(targets)) {
      addEdge(from, to);
      addEdge(to, from);
    }
  }

  return graph;
}

function findPath(
  graph: Map<TerrainCode, Set<TerrainCode>>,
  from: TerrainCode,
  to: TerrainCode
): TerrainCode[] | null {
  if (from === to) return [from];

  const queue: TerrainCode[][] = [[from]];
  const visited = new Set<TerrainCode>([from]);

  while (queue.length) {
    const path = queue.shift()!;
    const current = path[path.length - 1];

    for (const next of graph.get(current) ?? []) {
      if (visited.has(next)) continue;

      const newPath = [...path, next];

      if (next === to) return newPath;

      visited.add(next);
      queue.push(newPath);
    }
  }

  return null;
}

// Глобальный граф
const terrainGraph = buildGraph(transitions);

// Публичная функция
export function getTerrainPath(
  from: TerrainCode,
  to: TerrainCode
): TerrainCode[] | null {
  const cacheKey = `${from}:${to}`;

  if (pathCache.has(cacheKey)) {
    return pathCache.get(cacheKey)!;
  }

  const path = findPath(terrainGraph, from, to);

  pathCache.set(cacheKey, path);

  return path;
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

  return tileLookup.get(id) ?? null;
}

function getSubTile(map: MapData, x: number, y: number): string | null {
  const tx = Math.floor(x / 2);
  const ty = Math.floor(y / 2);
  
  const tile = getTile(map, tx, ty);
  if (!tile) return null;

  const subX = x % 2;
  const subY = y % 2;

  const index = subY * 2 + subX;

  return tile.pattern[index];
}

function positionKey(x: number, y: number): string {
  return `${x},${y}`;
}

export function placeTile2(map: MapData, x: number, y: number, tileId: string): void {
  if (x < 0 || y < 0 || x >= map.width || y >= map.height) {
    return;
  }

  const tile = tileLookup.get(tileId);
  if (!tile) return;

  // Указанный тайл не подлежит обсуждению
  map.cells[y][x] = tileId;

  // Те, которые не меняем
  const locked = new Set<string>([positionKey(x, y)]);

  // 4 направления
  for (let d = 0; d < 4; d++) {
    const { direction, dx, dy } = DIRECTIONS[d];

    const nx = x + dx;
    const ny = y + dy;

    const neighbor = getTile(map, nx, ny);
    if (!neighbor) continue;

    const stDirs = EDGE_SUBTILES[direction];

    const sourceEdge = stDirs.map(d => getSubTile(map, x * 2 + d.x, y * 2 + d.y));
    const neighborEdge = stDirs.map(d => getSubTile(map, x * 2 + d.x + dx, y * 2 + d.y + dy));

    if (sourceEdge.includes(null) || neighborEdge.includes(null)) {
      continue;
    }

    if (sourceEdge.join('') === neighborEdge.join('')) {
      continue;
    }

    const path0 = getTerrainPath(sourceEdge[0]!, neighborEdge[0]!);
    const path1 = getTerrainPath(sourceEdge[1]!, neighborEdge[1]!);

    if (!path0 || !path1) {
      throw new Error(`No transition from ${sourceEdge.join('')} to ${neighborEdge.join('')}`);
    }

    
  }
}

/**
 * @deprecated
 */
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

/**
 * @deprecated
 */
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

/**
 * @deprecated
 */
function resolveNeighbor(
  source: Tile,
  neighbor: Tile,
  direction: Direction,
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

/**
 * @deprecated
 */
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
      map, current.x, current.y
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

      const neighbor = getTile(map, nx, ny);
      if (!neighbor) continue;

      const resolved = resolveNeighbor(
        source,
        neighbor,
        direction,
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