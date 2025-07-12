const express = require("express");
const cors = require("cors");
const multer = require("multer");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");
const admin = require("firebase-admin");
const config = require("./config");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Inicializar Google Gemini
const genAI = new GoogleGenerativeAI(config.geminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

// Inicializar Firebase Admin SDK
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Middleware de autenticación
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send("Unauthorized: No token provided");
  }

  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Añade la info del usuario (incluyendo uid) a la request
    next();
  } catch (error) {
    console.error("Error verifying Firebase ID token:", error);
    res
      .status(403)
      .json({
        error: "Forbidden: Invalid or expired token.",
        code: error.code,
      });
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
  },
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
    date,
  } = req.body;
  const userId = req.user.uid; // <-- Usar el UID del token verificado
  const photoPath = req.file ? req.file.filename : null;
  if (!userId || !sciName || !photoPath)
    return res.status(400).json({ error: "Faltan datos" });

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
      date,
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
      console.error("Database error fetching plants:", err);
      return res
        .status(500)
        .json({ error: "Database error", details: err.message });
    }
    res.json(rows);
  });
});

// GET /plants/:id - Obtener una planta específica
app.get("/plants/:id", authenticateToken, (req, res) => {
  const plantId = req.params.id;
  const userId = req.user.uid;

  db.get(
    "SELECT * FROM plants WHERE id = ? AND userId = ?",
    [plantId, userId],
    (err, row) => {
      if (err) {
        console.error("Database error fetching plant:", err);
        return res
          .status(500)
          .json({ error: "Database error", details: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: "Planta no encontrada" });
      }
      res.json(row);
    }
  );
});

// GET /api/species-info/:sciName/:commonName - Solo Gemini
app.get("/api/species-info/:sciName/:commonName", authenticateToken, async (req, res) => {
  const { sciName, commonName } = req.params;
  const plantName = sciName || commonName;
  if (!plantName) {
    return res.status(400).json({ error: "Falta nombre científico o común" });
  }
  try {
    const prompt = `
      Por favor, proporciona información detallada sobre la planta "${plantName}".
      Necesito que la respuesta sea exclusivamente un objeto JSON, sin texto adicional antes o después, ni saltos de línea o markdown.
      El JSON debe tener la siguiente estructura exacta:
      {
        "common_name": "Nombre Común",
        "scientific_name": ["Nombre Científico"],
        "family": "Familia",
        "genus": "Género",
        "cycle": "Ciclo de vida (Anual, Perenne, etc.)",
        "image_url": "URL de una imagen representativa y de uso libre",
        "growth": {
          "watering": "Descripción de las necesidades de riego.",
          "sunlight": ["Descripción de las necesidades de luz solar."]
        }
      }
      Si no encuentras información para la planta, devuelve un JSON con un campo "error".
      Ejemplo de error: { "error": "Planta no encontrada" }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    // Limpiar la respuesta para asegurarse de que es solo JSON
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const aiResponse = JSON.parse(cleanedText);

    if (aiResponse && !aiResponse.error) {
      console.log(`Google Gemini encontró datos para: ${plantName}`);
      return res.json({ source: "Gemini", data: aiResponse });
    } else {
      return res.status(404).json({ error: "Especie no encontrada" });
    }
  } catch (aiError) {
    console.error(`Error con la API de Google Gemini:`, aiError.message);
    if (aiError.response) {
      console.error('Cuerpo del error de Gemini:', await aiError.response.text());
    }
    return res.status(500).json({ error: "Error consultando Gemini" });
  }
});


// PUT /plants/:id - Actualizar planta
app.put("/plants/:id", authenticateToken, upload.single("photo"), (req, res) => {
  const plantId = req.params.id;
  const userId = req.user.uid;
  const {
    sciName,
    commonName,
    personalName,
    location,
    watering,
    light,
    drainage,
    notes,
    date,
  } = req.body;
  let photoPath = null;
  if (req.file) {
    photoPath = req.file.filename;
  }
  // Primero, obtener la planta para verificar propiedad y foto anterior
  db.get(
    "SELECT * FROM plants WHERE id = ? AND userId = ?",
    [plantId, userId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: "Planta no encontrada" });
      // Si hay nueva foto, eliminar la anterior
      if (photoPath && row.photoPath) {
        const oldPath = path.join(__dirname, "uploads", row.photoPath);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      const updateFields = [
        sciName || row.sciName,
        commonName || row.commonName,
        personalName || row.personalName,
        location || row.location,
        watering || row.watering,
        light || row.light,
        drainage || row.drainage,
        notes || row.notes,
        photoPath ? photoPath : row.photoPath,
        date || row.date,
        plantId,
        userId,
      ];
      db.run(
        `UPDATE plants SET sciName=?, commonName=?, personalName=?, location=?, watering=?, light=?, drainage=?, notes=?, photoPath=?, date=? WHERE id=? AND userId=?`,
        updateFields,
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ updated: this.changes });
        }
      );
    }
  );
});

// DELETE /plants/:id - Eliminar planta
app.delete("/plants/:id", authenticateToken, (req, res) => {
  const plantId = req.params.id;
  const userId = req.user.uid;
  // Obtener la planta para eliminar la foto
  db.get(
    "SELECT * FROM plants WHERE id = ? AND userId = ?",
    [plantId, userId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: "Planta no encontrada" });
      // Eliminar la foto asociada
      if (row.photoPath) {
        const photoPath = path.join(__dirname, "uploads", row.photoPath);
        if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
      }
      db.run(
        "DELETE FROM plants WHERE id = ? AND userId = ?",
        [plantId, userId],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ deleted: this.changes });
        }
      );
    }
  );
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
