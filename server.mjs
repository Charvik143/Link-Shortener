import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const DB_FILE = path.join(__dirname, 'urls.json');

let urlDatabase = {};
if (fs.existsSync(DB_FILE)) {
  urlDatabase = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

app.post('/shorten', (req, res) => {
  const { originalUrl } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ error: 'Original URL is required.' });
  }

  const shortId = nanoid(6);
  urlDatabase[shortId] = originalUrl;

  fs.writeFileSync(DB_FILE, JSON.stringify(urlDatabase, null, 2));

  res.json({ shortUrl: `http://localhost:${PORT}/${shortId}` });
});

app.get('/:shortId', (req, res) => {
  const { shortId } = req.params;
  const originalUrl = urlDatabase[shortId];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.status(404).send('Short URL not found.');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
