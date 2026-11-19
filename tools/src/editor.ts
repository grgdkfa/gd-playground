
import { placeTile } from "./functions.js";
import { Terrain, tiles } from "./mapData.js";
import { MapData } from "./types.js";

const COLORS = {
    w: '#2779F5',
    W: '#132DBF',
    d: '#A37321',
    D: '#8A5D15',
    g: '#33AB20',
    G: '#1D9121',
    f: '#2B7026',
    r: '#7D7D7D'
}

const TILE_SIZE = 32;
const MAP_WIDTH = 20;
const MAP_HEIGHT = 15;

const map: MapData = {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    cells: Array.from({ length: MAP_HEIGHT }, () => Array(MAP_WIDTH).fill(Terrain.GRASS))
}

const lookup = new Map<string, string[]>();

tiles.forEach(tile => {
    lookup.set(tile.id, tile.pattern);
})

let canvas: HTMLCanvasElement;
let currentTileId: string = Terrain.WATER;

function draw() {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const h = TILE_SIZE / 2;

    for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
            const tileId = map.cells[y][x];
            if (tileId === null) continue;
            const pattern = lookup.get(tileId);
            if (!pattern) continue;

            ctx.fillStyle = (COLORS as any)[pattern[0]];
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, h, h);

            ctx.fillStyle = (COLORS as any)[pattern[1]];
            ctx.fillRect(x * TILE_SIZE + h, y * TILE_SIZE, h, h);

            ctx.fillStyle = (COLORS as any)[pattern[2]];
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE + h, h, h);

            ctx.fillStyle = (COLORS as any)[pattern[3]];
            ctx.fillRect(x * TILE_SIZE + h, y * TILE_SIZE + h, h, h);
        }
    }

    for (let i = 0; i <= map.width; i++) {
        ctx.beginPath();
        ctx.moveTo(i * TILE_SIZE, 0);
        ctx.lineTo(i * TILE_SIZE, map.height * TILE_SIZE);
        ctx.strokeStyle = "#000000";
        ctx.stroke();
    }

    for (let i = 0; i <= map.height; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * TILE_SIZE);
        ctx.lineTo(map.width * TILE_SIZE, i * TILE_SIZE);
        ctx.strokeStyle = "#000000";
        ctx.stroke();
    }
}


document.addEventListener("DOMContentLoaded", () => {
    canvas = document.getElementById("canvas") as HTMLCanvasElement;
    draw();

    canvas.addEventListener("click", (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / TILE_SIZE);
        const y = Math.floor((event.clientY - rect.top) / TILE_SIZE);

        debugger
        placeTile(map, tiles, x, y, currentTileId);
        draw();
    })
});