const express = require("express");
const cors = require("cors");
const multer = require("multer");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");
const admin = require("firebase-admin");
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { GoogleGenerativeAI } = require("@google/generative-ai");

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Inicializar Google Gemini
if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY environment variable is required');
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
console.log('Google Gemini initialized successfully');

// Cache para respuestas de la API
const responseCache = new Map();

// Datos de respaldo para plantas comunes
const plantDatabase = {
  "rosa": {
    common_name: "Rosa",
    scientific_name: ["Rosa spp."],
    family: "Rosaceae",
    genus: "Rosa",
    cycle: "Perenne",
    growth: {
      watering: "Riego moderado, mantener suelo húmedo pero no encharcado. Regar 2-3 veces por semana.",
      sunlight: ["Pleno sol", "Sol parcial - mínimo 6 horas de luz directa"]
    },
    care_tips: [
      "Poda regularmente para mantener la forma y promover nueva floración",
      "Aplica fertilizante específico para rosas cada 4-6 semanas durante la temporada de crecimiento",
      "Mantén buena circulación de aire alrededor de la planta para prevenir enfermedades"
    ],
    common_problems: [
      "Manchas negras en hojas - mejorar ventilación y evitar riego por encima",
      "Pulgones - usar jabón insecticida o introducir mariquitas",
      "Oidio - aplicar fungicida preventivo en clima húmedo"
    ],
    personalized_recommendations: ["Revisa las hojas semanalmente para detectar signos tempranos de enfermedades"]
  },
  "pothos": {
    common_name: "Pothos",
    scientific_name: ["Epipremnum aureum"],
    family: "Araceae",
    genus: "Epipremnum",
    cycle: "Perenne",
    growth: {
      watering: "Riego cuando la capa superior del suelo esté seca. Aproximadamente cada 7-10 días.",
      sunlight: ["Luz brillante indirecta", "Tolera luz baja"]
    },
    care_tips: [
      "Permite que el suelo se seque entre riegos para evitar pudrición de raíces",
      "Poda las vides largas para mantener la forma compacta",
      "Limpia las hojas regularmente para mantener su brillo"
    ],
    common_problems: [
      "Hojas amarillas - generalmente por exceso de riego",
      "Hojas marrones - puede ser por agua con cloro o aire seco",
      "Crecimiento lento - necesita más luz"
    ],
    personalized_recommendations: ["Es perfecta para principiantes, muy resistente y fácil de cuidar"]
  },
  "cactus": {
    common_name: "Cactus",
    scientific_name: ["Cactaceae"],
    family: "Cactaceae",
    genus: "Varios",
    cycle: "Perenne",
    growth: {
      watering: "Riego muy escaso, solo cuando el suelo esté completamente seco. En invierno, casi nada.",
      sunlight: ["Pleno sol", "Luz brillante directa"]
    },
    care_tips: [
      "Usa sustrato específico para cactus con buen drenaje",
      "Riega profundamente pero con poca frecuencia",
      "Proporciona un período de descanso invernal con menos agua y temperaturas frescas"
    ],
    common_problems: [
      "Pudrición de raíces - reducir riego y mejorar drenaje",
      "Etiolación (estiramiento) - necesita más luz solar",
      "Cochinillas - limpiar con alcohol isopropílico"
    ],
    personalized_recommendations: ["Los cactus son ideales para personas ocupadas que viajan frecuentemente"]
  },
  "ficus": {
    common_name: "Ficus",
    scientific_name: ["Ficus benjamina"],
    family: "Moraceae",
    genus: "Ficus",
    cycle: "Perenne",
    growth: {
      watering: "Riego regular, manteniendo el suelo ligeramente húmedo pero no empapado.",
      sunlight: ["Luz brillante indirecta", "Tolera algo de sol directo"]
    },
    care_tips: [
      "Evita cambios bruscos de ubicación para prevenir caída de hojas",
      "Pulveriza las hojas regularmente para mantener humedad",
      "Poda para mantener la forma deseada"
    ],
    common_problems: [
      "Caída de hojas - cambios de ubicación o riego irregular",
      "Hojas pegajosas - presencia de cochinillas o pulgones",
      "Hojas amarillas - exceso de riego o falta de luz"
    ],
    personalized_recommendations: ["Mantén una rutina de riego consistente para mejores resultados"]
  }
};

// Inicializar Firebase Admin SDK
try {
  let serviceAccount;
  
  // Intentar usar variable de entorno primero, luego archivo local
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.log('Using Firebase config from environment variable');
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    console.log('Using Firebase config from serviceAccountKey.json file');
    const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
    if (fs.existsSync(serviceAccountPath)) {
      serviceAccount = require('./serviceAccountKey.json');
    } else {
      throw new Error('No Firebase configuration found');
    }
  }
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json()); // Para procesar JSON
app.use(express.urlencoded({ extended: true })); // Para procesar form data
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check endpoint (sin autenticación)
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'PlantCare Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

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
  
  db.run(`
    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      plantId INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      frequency INTEGER DEFAULT 7,
      completed BOOLEAN DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (plantId) REFERENCES plants(id) ON DELETE CASCADE
    )
  `);
  
  // Agregar columna frequency si no existe (para bases de datos existentes)
  db.run(`
    ALTER TABLE reminders ADD COLUMN frequency INTEGER DEFAULT 7
  `, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding frequency column:', err);
    }
  });
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

// POST /upload-profile-photo - Subir foto de perfil
app.post("/upload-profile-photo", authenticateToken, upload.single("profilePhoto"), (req, res) => {
  const userId = req.user.uid;
  
  if (!req.file) {
    return res.status(400).json({ error: "No se subió ningún archivo" });
  }

  // Validar tipo de archivo
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(req.file.mimetype)) {
    // Eliminar archivo no válido
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error eliminando archivo no válido:', err);
    });
    return res.status(415).json({ error: "Tipo de archivo no soportado. Usa JPG, PNG, GIF o WebP." });
  }

  // Validar tamaño (máximo 5MB)
  if (req.file.size > 5 * 1024 * 1024) {
    // Eliminar archivo muy grande
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error eliminando archivo muy grande:', err);
    });
    return res.status(413).json({ error: "El archivo es muy grande. Máximo 5MB." });
  }

  // Construir la URL completa de la foto
  const protocol = req.protocol;
  const host = req.get('host');
  const photoURL = `${protocol}://${host}/uploads/${req.file.filename}`;

  res.json({ 
    message: "Foto de perfil subida exitosamente",
    photoURL: photoURL,
    filename: req.file.filename
  });
});

// GET /api/species-info/:sciName/:commonName - Con cache y datos de respaldo
app.get("/api/species-info/:sciName/:commonName", authenticateToken, async (req, res) => {
  const { sciName, commonName } = req.params;
  const plantName = sciName || commonName;
  const userId = req.user.uid;
  
  if (!plantName) {
    return res.status(400).json({ error: "Falta nombre científico o común" });
  }

  // Crear clave para cache
  const cacheKey = `${plantName.toLowerCase()}-${userId}`;
  
  // Verificar cache primero
  if (responseCache.has(cacheKey)) {
    console.log(`Datos encontrados en cache para: ${plantName}`);
    return res.json(responseCache.get(cacheKey));
  }

  try {
    // Buscar si el usuario tiene una planta con ese nombre científico o común
    db.get(
      "SELECT * FROM plants WHERE userId = ? AND (sciName = ? OR commonName = ?)",
      [userId, sciName, commonName],
      async (err, plantRow) => {
        if (err) {
          console.error("Error de base de datos:", err);
          return res.status(500).json({ error: "Error de base de datos" });
        }

        // Primero intentar encontrar en la base de datos local
        const plantKey = plantName.toLowerCase();
        const localPlantData = Object.keys(plantDatabase).find(key => 
          plantKey.includes(key) || key.includes(plantKey)
        );

        if (localPlantData) {
          let plantData = { ...plantDatabase[localPlantData] };
          
          // Personalizar recomendaciones si hay datos del usuario
          if (plantRow) {
            const personalizedTips = [];
            if (plantRow.location) {
              personalizedTips.push(`Ubicación actual: ${plantRow.location}. Considera las condiciones específicas de este lugar.`);
            }
            if (plantRow.watering) {
              personalizedTips.push(`Tu rutina de riego actual: ${plantRow.watering}. Ajusta según las recomendaciones.`);
            }
            if (plantRow.light) {
              personalizedTips.push(`Condiciones de luz actuales: ${plantRow.light}. Verifica si coinciden con las necesidades.`);
            }
            if (plantRow.notes) {
              personalizedTips.push(`Notas personales: ${plantRow.notes}`);
            }
            
            if (personalizedTips.length > 0) {
              plantData.personalized_recommendations = personalizedTips;
            }
          }

          const response = { source: "Base de datos local", data: plantData };
          responseCache.set(cacheKey, response);
          console.log(`Datos encontrados en base de datos local para: ${plantName}`);
          return res.json(response);
        }

        // Si no está en la base de datos local, intentar Gemini
        try {
          let userDetails = '';
          if (plantRow) {
            userDetails = `\nDetalles de la planta del usuario:\n` +
              `- Apodo: ${plantRow.personalName || ''}\n` +
              `- Ubicación: ${plantRow.location || ''}\n` +
              `- Riego: ${plantRow.watering || ''}\n` +
              `- Luz: ${plantRow.light || ''}\n` +
              `- Drenaje: ${plantRow.drainage || ''}\n` +
              `- Notas: ${plantRow.notes || ''}`;
          }

          const prompt = `Por favor, proporciona información detallada sobre la planta "${plantName}".${userDetails}
Necesito que la respuesta sea exclusivamente un objeto JSON, sin texto adicional antes o después, ni saltos de línea o markdown.
El JSON debe tener la siguiente estructura exacta:
{
  "common_name": "Nombre Común",
  "scientific_name": ["Nombre Científico"],
  "family": "Familia",
  "genus": "Género",
  "cycle": "Ciclo de vida (Anual, Perenne, etc.)",
  "growth": {
    "watering": "Descripción de las necesidades de riego.",
    "sunlight": ["Descripción de las necesidades de luz solar."]
  },
  "care_tips": ["Consejo 1", "Consejo 2", "..."],
  "common_problems": ["Problema 1 y cómo prevenirlo o tratarlo", "..."],
  "personalized_recommendations": ["Recomendación basada en los datos del usuario, si aplica"]
}
Incluye consejos prácticos, problemas comunes y recomendaciones personalizadas según los datos del usuario si están disponibles.
Si no encuentras información para la planta, devuelve un JSON con un campo "error".`;

          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();
          const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
          const aiResponse = JSON.parse(cleanedText);

          if (aiResponse && !aiResponse.error) {
            const response = { source: "Gemini", data: aiResponse };
            responseCache.set(cacheKey, response);
            console.log(`Google Gemini encontró datos para: ${plantName}`);
            return res.json(response);
          } else {
            throw new Error("No se encontró información específica");
          }
        } catch (aiError) {
          console.error(`Error con la API de Google Gemini:`, aiError.message);
          
          // Si es error de cuota, devolver datos genéricos útiles
          if (aiError.status === 429) {
            const genericPlantData = {
              common_name: plantName,
              scientific_name: [sciName || plantName],
              family: "No disponible",
              genus: "No disponible", 
              cycle: "No disponible",
              growth: {
                watering: "Riego moderado - verifica que el suelo esté ligeramente húmedo pero no encharcado. La frecuencia depende de la temporada y las condiciones ambientales.",
                sunlight: ["Luz brillante indirecta", "Evita luz solar directa intensa"]
              },
              care_tips: [
                "Observa las hojas de tu planta regularmente - te dirán mucho sobre su salud",
                "Mantén un horario de riego consistente pero ajusta según la temporada",
                "Asegúrate de que la maceta tenga buen drenaje para evitar encharcamiento",
                "Limpia las hojas ocasionalmente para mantener una buena fotosíntesis"
              ],
              common_problems: [
                "Hojas amarillas - generalmente indica exceso de riego o falta de nutrientes",
                "Hojas marrones o secas - puede ser falta de humedad o exceso de luz directa",
                "Crecimiento lento - considera si necesita más luz o fertilizante",
                "Plagas comunes - revisa regularmente bajo las hojas"
              ],
              personalized_recommendations: [
                "Como no pudimos obtener información específica de esta planta, te recomendamos observar cómo responde a los cuidados básicos",
                "Considera consultar con un vivero local o buscar información específica en línea",
                "Documenta los cuidados que funcionan mejor para tu planta específica"
              ]
            };

            // Personalizar con datos del usuario si están disponibles
            if (plantRow) {
              const personalizedTips = [];
              if (plantRow.location) {
                personalizedTips.push(`Tu planta está en: ${plantRow.location}. Considera las condiciones específicas de este lugar.`);
              }
              if (plantRow.notes) {
                personalizedTips.push(`Tus notas: ${plantRow.notes}`);
              }
              if (personalizedTips.length > 0) {
                genericPlantData.personalized_recommendations = [...genericPlantData.personalized_recommendations, ...personalizedTips];
              }
            }

            const response = { 
              source: "Datos genéricos (cuota API excedida)", 
              data: genericPlantData,
              message: "La cuota de la API se ha agotado. Estos son consejos generales de cuidado de plantas."
            };
            responseCache.set(cacheKey, response);
            return res.json(response);
          }
          
          return res.status(500).json({ 
            error: "Error consultando información de la planta",
            details: "Servicio temporalmente no disponible"
          });
        }
      }
    );
  } catch (error) {
    console.error(`Error general en species-info:`, error);
    return res.status(500).json({ error: "Error interno del servidor" });
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

// ENDPOINTS DE RECORDATORIOS

// GET /reminders/:plantId - Obtener recordatorios de una planta específica
app.get("/reminders/:plantId", authenticateToken, (req, res) => {
  const plantId = req.params.plantId;
  const userId = req.user.uid;

  db.all(
    "SELECT * FROM reminders WHERE plantId = ? AND userId = ? ORDER BY date ASC",
    [plantId, userId],
    (err, rows) => {
      if (err) {
        console.error("Error fetching reminders:", err);
        return res.status(500).json({ error: "Error de base de datos" });
      }
      res.json(rows);
    }
  );
});

// POST /reminders - Crear un nuevo recordatorio
app.post("/reminders", authenticateToken, (req, res) => {
  const { plantId, type, title, description, date, frequency } = req.body;
  const userId = req.user.uid;

  if (!plantId || !type || !title || !date) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  // Verificar que la planta pertenece al usuario
  db.get(
    "SELECT id FROM plants WHERE id = ? AND userId = ?",
    [plantId, userId],
    (err, row) => {
      if (err) {
        console.error("Error verifying plant ownership:", err);
        return res.status(500).json({ error: "Error de base de datos" });
      }
      if (!row) {
        return res.status(404).json({ error: "Planta no encontrada" });
      }

      // Crear el recordatorio
      db.run(
        `INSERT INTO reminders (userId, plantId, type, title, description, date, frequency) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, plantId, type, title, description, date, frequency || 7],
        function (err) {
          if (err) {
            console.error("Error creating reminder:", err);
            return res.status(500).json({ error: "Error creando recordatorio" });
          }
          res.json({ 
            id: this.lastID, 
            message: "Recordatorio creado exitosamente" 
          });
        }
      );
    }
  );
});

// DELETE /reminders/:id - Eliminar un recordatorio
app.delete("/reminders/:id", authenticateToken, (req, res) => {
  const reminderId = req.params.id;
  const userId = req.user.uid;

  db.run(
    "DELETE FROM reminders WHERE id = ? AND userId = ?",
    [reminderId, userId],
    function (err) {
      if (err) {
        console.error("Error deleting reminder:", err);
        return res.status(500).json({ error: "Error eliminando recordatorio" });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Recordatorio no encontrado" });
      }
      res.json({ message: "Recordatorio eliminado exitosamente" });
    }
  );
});

// PUT /reminders/:id - Actualizar un recordatorio (marcar como completado)
app.put("/reminders/:id", authenticateToken, (req, res) => {
  const reminderId = req.params.id;
  const userId = req.user.uid;
  const { completed } = req.body;

  db.run(
    "UPDATE reminders SET completed = ? WHERE id = ? AND userId = ?",
    [completed, reminderId, userId],
    function (err) {
      if (err) {
        console.error("Error updating reminder:", err);
        return res.status(500).json({ error: "Error actualizando recordatorio" });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Recordatorio no encontrado" });
      }
      res.json({ message: "Recordatorio actualizado exitosamente" });
    }
  );
});

// DELETE /user/all-data - Eliminar todos los datos del usuario
app.delete("/user/all-data", authenticateToken, (req, res) => {
  const userId = req.user.uid;

  // Primero obtener todas las rutas de fotos del usuario para eliminarlas
  db.all(
    "SELECT photoPath FROM plants WHERE userId = ?",
    [userId],
    (err, rows) => {
      if (err) {
        console.error("Error al obtener rutas de fotos:", err.message);
        return res.status(500).json({ error: "Error interno del servidor" });
      }

      // Eliminar archivos de fotos
      const deletePromises = rows.map(row => {
        return new Promise((resolve) => {
          if (row.photoPath) {
            // Extraer solo el nombre del archivo de la URL completa
            const filename = row.photoPath.split('/').pop();
            const photoPath = path.join(__dirname, "uploads", filename);
            
            fs.unlink(photoPath, (unlinkErr) => {
              if (unlinkErr && unlinkErr.code !== 'ENOENT') {
                console.warn(`Error al eliminar foto ${filename}:`, unlinkErr.message);
              }
              resolve();
            });
          } else {
            resolve();
          }
        });
      });

      // Esperar a que se eliminen todas las fotos antes de continuar
      Promise.all(deletePromises).then(() => {
        // Iniciar transacción para eliminar datos de la base de datos
        db.serialize(() => {
          db.run("BEGIN TRANSACTION", (beginErr) => {
            if (beginErr) {
              console.error("Error al iniciar transacción:", beginErr.message);
              return res.status(500).json({ error: "Error interno del servidor" });
            }

            // Eliminar recordatorios (se eliminan automáticamente por CASCADE, pero lo hacemos explícito)
            db.run(
              "DELETE FROM reminders WHERE userId = ?",
              [userId],
              function(reminderErr) {
                if (reminderErr) {
                  console.error("Error al eliminar recordatorios:", reminderErr.message);
                  return db.run("ROLLBACK", () => {
                    res.status(500).json({ error: "Error al eliminar recordatorios" });
                  });
                }

                const deletedReminders = this.changes;

                // Eliminar plantas
                db.run(
                  "DELETE FROM plants WHERE userId = ?",
                  [userId],
                  function(plantErr) {
                    if (plantErr) {
                      console.error("Error al eliminar plantas:", plantErr.message);
                      return db.run("ROLLBACK", () => {
                        res.status(500).json({ error: "Error al eliminar plantas" });
                      });
                    }

                    const deletedPlants = this.changes;

                    // Confirmar transacción
                    db.run("COMMIT", (commitErr) => {
                      if (commitErr) {
                        console.error("Error al confirmar transacción:", commitErr.message);
                        return res.status(500).json({ error: "Error al confirmar eliminación" });
                      }

                      console.log(`Datos eliminados para usuario ${userId}: ${deletedPlants} plantas, ${deletedReminders} recordatorios`);
                      
                      res.json({
                        success: true,
                        message: "Todos los datos han sido eliminados permanentemente",
                        deletedPlants,
                        deletedReminders,
                        deletedPhotos: rows.length
                      });
                    });
                  }
                );
              }
            );
          });
        });
      });
    }
  );
});

// Limpiar cache cada 24 horas
setInterval(() => {
  responseCache.clear();
  console.log('Cache de respuestas limpiado');
}, 24 * 60 * 60 * 1000);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend listening on http://0.0.0.0:${PORT}`);
  console.log(`Cache inicializado, base de datos de plantas con ${Object.keys(plantDatabase).length} especies`);
});
