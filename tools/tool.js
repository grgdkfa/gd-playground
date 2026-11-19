const fs = require('fs/promises');
const path = require('path');

const mapa = require('./public/mapa.js');

function ee() {
    fs.writeFile('./mapa.json', JSON.stringify(mapa.TILES, null, 2), 'utf8');
}

ee()