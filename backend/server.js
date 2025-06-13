const express = require("express");
const cors = require("cors");
const multer = require("multer");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// SQLite setup
const dbPath = path.join(__dirname, "plants.db");
const db = new sqlite3.Database(dbPath);
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS plants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      sciName TEXT NOT NULL,
      commonName TEXT,
      personalName TEXT,
      location TEXT,
      watering TEXT,
      light TEXT,
      drainage TEXT,
      notes TEXT,
      photoPath TEXT NOT NULL,
      date TEXT
    )
  `);
});

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// POST /plants actualizado
app.post("/plants", upload.single("photo"), (req, res) => {
  const {
    userId, // <-- nuevo campo
    sciName,
    commonName,
    personalName,
    location,
    watering,
    light,
    drainage,
    notes,
    date
  } = req.body;
  const photoPath = req.file ? `/uploads/${req.file.filename}` : null;
  if (!userId || !sciName || !photoPath) return res.status(400).json({ error: "Faltan datos" });

  db.run(
    `INSERT INTO plants 
      (userId, sciName, commonName, personalName, location, watering, light, drainage, notes, photoPath, date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      sciName,
      commonName,
      personalName,
      location,
      watering,
      light,
      drainage,
      notes,
      photoPath,
      date
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// GET /plants actualizado para filtrar por usuario
app.get("/plants", (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "Falta userId" });
  db.all("SELECT * FROM plants WHERE userId = ?", [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});