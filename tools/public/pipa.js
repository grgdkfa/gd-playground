
function findTiles() {
    function getCtx(image) {
        const canvas = document.createElement('canvas')
        const w = image.width
        const h = image.height
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(image, 0, 0)
        const imageData = ctx.getImageData(0, 0, w, h)

        return {
            w,
            h,
            canvas,
            ctx,
            data: imageData.data
        }
    }

    const tiles = getCtx(tilesImage)
    const sample = getCtx(sampleImage)
    const START = 102
    const END = 141

    function getTilePixel(tx, ty, x, y) {
        const sx = tx * 33 + x
        const sy = ty * 33 + y
        const index = (sy * tiles.w + sx) * 4
        return [
            tiles.data[index],
            tiles.data[index + 1],
            tiles.data[index + 2],
            tiles.data[index + 3]
        ]
    }

    function getSamplePixel(tx, ty, x, y) {
        const sx = tx * 32 + x
        const sy = ty * 32 + y
        const index = (sy * sample.w + sx) * 4
        return [
            sample.data[index],
            sample.data[index + 1],
            sample.data[index + 2],
            sample.data[index + 3]
        ]
    }

    const gg = []

    /**
     * find tile (tx, ty) from sample image in tiles image
     * @param {number} tx 
     * @param {number} ty 
     */
    function findTile(tx, ty) {
        for (let tileIndex = START; tileIndex <= END; tileIndex++) {
            const tileX = tileIndex % 19
            const tileY = Math.floor(tileIndex / 19)
            let w = 0
            for (let x = 0; x < 32; x += 2) {
                for (let y = 0; y < 32; y += 2) {
                    const tilePixel = getTilePixel(tileX, tileY, x, y)
                    const samplePixel = getSamplePixel(tx, ty, x, y)
                    w += Math.sqrt(Math.pow(tilePixel[0] - samplePixel[0], 2) + Math.pow(tilePixel[1] - samplePixel[1], 2) + Math.pow(tilePixel[2] - samplePixel[2], 2))
                }
            }
            gg[tileIndex - START] = w
        }

        let minIndex = 0
        for (let i = 1; i < gg.length; i++) {
            if (gg[i] < gg[minIndex]) {
                minIndex = i
            }
        }

        if (gg[minIndex] > 1000) {
            return null
        }

        console.log(gg[minIndex])
        return minIndex + START
    }

    const sampleTileW = Math.floor(sample.w / 32)
    const sampleTileH = Math.floor(sample.h / 32)

    const coverage = []

    for (tx = 0; tx < sampleTileW; tx++) {
        for (ty = 0; ty < sampleTileH; ty++) {
            const r = findTile(tx, ty)
            if (r !== null) {
                coverage[r] = true
                // console.log(`Found tile at (${tx}, ${ty}) => ${r}`)
                const dot = document.createElement('div')
                dot.className = 'dot hidden'
                dot.style.left = `${tx * 32}px`
                dot.style.top = `${ty * 32}px`
                dot.textContent = r
                dot.dataset.tile = r
                dot.addEventListener('mouseenter', showTile)
                dot.addEventListener('mouseleave', hideTile)
                sampleContainer.appendChild(dot)
            }
        }
    }

    for (let i = START; i <= END; i++) {
        if (!coverage[i]) {
            console.log(`Tile ${i} is not found`)
        }
    }

    function showTile(event) {
        event.target.classList.remove('hidden')
        const tileIndex = parseInt(event.target.dataset.tile)
        const tileX = tileIndex % 19
        const tileY = Math.floor(tileIndex / 19)
        tileDot.style.left = `${tileX * 33}px`
        tileDot.style.top = `${tileY * 33}px`
        tileDot.classList.remove('hidden')
    }

    function hideTile(event) {
        event.target.classList.add('hidden')
        tileDot.classList.add('hidden')
        tileDot.style.left = `0px`
        tileDot.style.top = `0px`
    }
}

Promise.all([
    new Promise(resolve => {
        tilesImage.onload = () => { resolve() }
    }), 
    new Promise(resolve => {
        sampleImage.onload = () => { resolve() }
    }),
]).then(() => {
    console.log('All images are loaded')
    findTiles()
})
