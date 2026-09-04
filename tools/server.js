const express = require('express');
const path = require('path');
const fs = require('fs/promises');

const app = express();
const PORT = 5555;

const publicDir = path.resolve(__dirname, 'public');

app.use(express.json());

// Раздаём все файлы из public
app.use(express.static(publicDir));

// POST /save
app.post('/save', async (req, res) => {
    try {
        const { filename, data } = req.body;

        if (typeof filename !== 'string' || typeof data !== 'string') {
            return res.status(400).json({
                error: 'filename и data должны быть строками'
            });
        }

        // Защита от ../ и записи за пределы public
        const filePath = path.resolve(publicDir, filename);

        if (
            filePath !== publicDir &&
            !filePath.startsWith(publicDir + path.sep)
        ) {
            return res.status(400).json({
                error: 'Недопустимое имя файла'
            });
        }

        // Создаём вложенные директории, если их нет
        await fs.mkdir(path.dirname(filePath), { recursive: true });

        // Перезаписываем файл
        await fs.writeFile(filePath, data, 'utf8');

        res.json({
            success: true,
            filename
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: 'Не удалось сохранить файл'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server started: http://localhost:${PORT}`);
});
