const express = require("express");
const cors = require("cors");
const multer = require("multer");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");
const admin = require("firebase-admin");

// Inicializar Firebase Admin SDK
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Middleware de autenticación
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send('Unauthorized: No token provided');
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Añade la info del usuario (incluyendo uid) a la request
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    res.status(403).json({ error: 'Forbidden: Invalid or expired token.', code: error.code });
  }
};

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
app.post("/plants", authenticateToken, upload.single("photo"), (req, res) => {
  const {
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
  const userId = req.user.uid; // <-- Usar el UID del token verificado
  const photoPath = req.file ? req.file.filename : null;
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
app.get("/plants", authenticateToken, (req, res) => {
  const userId = req.user.uid; // <-- Usar el UID del token verificado
  if (!userId) return res.status(400).json({ error: "Falta userId" });
  db.all("SELECT * FROM plants WHERE userId = ?", [userId], (err, rows) => {
    if (err) {
      console.error('Database error fetching plants:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});