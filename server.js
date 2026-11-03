const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
// Jika ada persistent disk, pakai /data. Jika tidak, pakai folder proyek.
const DB_FILE = fs.existsSync('/data')
  ? path.join('/data', 'data.json')
  : path.join(__dirname, 'data.json');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Health check untuk Render
app.get('/health', (req, res) => res.status(200).send('OK'));

function readDB() {
  if (!fs.existsSync(DB_FILE)) return null;
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
  catch { return null; }
}
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

app.get('/api/state', (req, res) => {
  const data = readDB();
  if (!data) return res.json({ empty: true });
  res.json(data);
});

app.post('/api/state', (req, res) => {
  const data = req.body;
  if (!data || typeof data !== 'object' || Array.isArray(data))
    return res.status(400).json({ error: 'Format data tidak valid' });
  writeDB(data);
  res.json({ ok: true, savedAt: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Bimbel Ceria jalan di port ${PORT}`);
  console.log(`📂 Data file: ${DB_FILE}`);
});
