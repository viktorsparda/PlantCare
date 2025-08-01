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
  
  // Crear tabla para fotos adicionales de plantas
  db.run(`
    CREATE TABLE IF NOT EXISTS plant_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plantId INTEGER NOT NULL,
      photoPath TEXT NOT NULL,
      description TEXT,
      uploadDate TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (plantId) REFERENCES plants(id) ON DELETE CASCADE
    )
  `);
  
  // Crear tabla de dispositivos IoT si no existe
  db.run(`
    CREATE TABLE IF NOT EXISTS iot_devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      udid TEXT NOT NULL,
      userId TEXT NOT NULL,
      plantId INTEGER,
      deviceName TEXT,
      associatedAt TEXT,
      isActive BOOLEAN DEFAULT 1,
      FOREIGN KEY (plantId) REFERENCES plants (id) ON DELETE SET NULL
    )
  `, (err) => {
    if (err) {
      console.error("Error creating iot_devices table:", err);
    } else {
      console.log("✅ IoT devices table ready");
    }
  });

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
  // En producción (Railway o cuando host contiene railway.app), siempre usar HTTPS
  const host = req.get('host');
  const isProduction = process.env.NODE_ENV === 'production' || host.includes('railway.app');
  const protocol = isProduction ? 'https' : req.protocol;
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

// ENDPOINTS DE FOTOS ADICIONALES

// POST /plants/:id/photos - Subir fotos adicionales para una planta
app.post("/plants/:id/photos", authenticateToken, upload.single("photo"), (req, res) => {
  const plantId = req.params.id;
  const userId = req.user.uid;
  const { description } = req.body;
  
  if (!req.file) {
    return res.status(400).json({ error: "No se subió ningún archivo" });
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

      // Guardar la foto adicional en la base de datos
      const photoPath = req.file.filename;
      const uploadDate = new Date().toISOString();
      
      db.run(
        "INSERT INTO plant_photos (plantId, photoPath, description, uploadDate) VALUES (?, ?, ?, ?)",
        [plantId, photoPath, description || "Foto adicional", uploadDate],
        function (err) {
          if (err) {
            console.error("Error saving additional photo:", err);
            // Eliminar archivo si no se pudo guardar en BD
            fs.unlink(req.file.path, () => {});
            return res.status(500).json({ error: "Error guardando la foto" });
          }
          
          res.json({
            id: this.lastID,
            plantId,
            photoPath,
            photoURL: photoPath,  // Solo devolver el path, el frontend construye la URL
            description: description || "Foto adicional",
            uploadDate,
            message: "Foto adicional subida exitosamente"
          });
        }
      );
    }
  );
});

// GET /plants/:id/photos - Obtener todas las fotos adicionales de una planta
app.get("/plants/:id/photos", authenticateToken, (req, res) => {
  const plantId = req.params.id;
  const userId = req.user.uid;

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

      // Obtener todas las fotos adicionales de la planta
      db.all(
        "SELECT * FROM plant_photos WHERE plantId = ? ORDER BY uploadDate DESC",
        [plantId],
        (err, photos) => {
          if (err) {
            console.error("Error fetching additional photos:", err);
            return res.status(500).json({ error: "Error obteniendo las fotos" });
          }
          
          // Agregar URLs completas a las fotos
          // Devolver solo el photoPath y que el frontend construya la URL completa
          const photosWithUrls = photos.map(photo => ({
            ...photo,
            photoURL: photo.photoPath  // Solo devolver el path, el frontend construye la URL
          }));
          
          res.json(photosWithUrls);
        }
      );
    }
  );
});

// DELETE /plants/:plantId/photos/:photoId - Eliminar una foto adicional específica
app.delete("/plants/:plantId/photos/:photoId", authenticateToken, (req, res) => {
  const { plantId, photoId } = req.params;
  const userId = req.user.uid;

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

      // Obtener la información de la foto para eliminar el archivo
      db.get(
        "SELECT * FROM plant_photos WHERE id = ? AND plantId = ?",
        [photoId, plantId],
        (err, photo) => {
          if (err) {
            console.error("Error fetching photo info:", err);
            return res.status(500).json({ error: "Error de base de datos" });
          }
          if (!photo) {
            return res.status(404).json({ error: "Foto no encontrada" });
          }

          // Eliminar archivo físico
          const photoPath = path.join(__dirname, "uploads", photo.photoPath);
          if (fs.existsSync(photoPath)) {
            fs.unlinkSync(photoPath);
          }

          // Eliminar registro de la base de datos
          db.run(
            "DELETE FROM plant_photos WHERE id = ? AND plantId = ?",
            [photoId, plantId],
            function (err) {
              if (err) {
                console.error("Error deleting photo record:", err);
                return res.status(500).json({ error: "Error eliminando la foto" });
              }
              
              res.json({ message: "Foto eliminada exitosamente" });
            }
          );
        }
      );
    }
  );
});

// PUT /plants/:id/set-main-photo - Intercambiar foto principal con una foto adicional
app.put("/plants/:id/set-main-photo", authenticateToken, (req, res) => {
  const plantId = req.params.id;
  const userId = req.user.uid;
  const { photoId } = req.body; // ID de la foto adicional que se convertirá en principal

  if (!photoId) {
    return res.status(400).json({ error: "Se requiere el ID de la foto" });
  }

  // Verificar que la planta pertenece al usuario
  db.get(
    "SELECT * FROM plants WHERE id = ? AND userId = ?",
    [plantId, userId],
    (err, plant) => {
      if (err) {
        console.error("Database error checking plant ownership:", err);
        return res.status(500).json({ error: "Error de base de datos" });
      }
      if (!plant) {
        return res.status(404).json({ error: "Planta no encontrada" });
      }

      // Obtener la información de la foto adicional que se convertirá en principal
      db.get(
        "SELECT * FROM plant_photos WHERE id = ? AND plantId = ?",
        [photoId, plantId],
        (err, photoToPromote) => {
          if (err) {
            console.error("Database error fetching photo to promote:", err);
            return res.status(500).json({ error: "Error de base de datos" });
          }
          if (!photoToPromote) {
            return res.status(404).json({ error: "Foto no encontrada" });
          }

          // Primero, guardar la foto principal actual como foto adicional (si existe)
          const saveCurrentMainPhoto = (callback) => {
            if (plant.photoPath) {
              // Agregar la foto principal actual a la tabla de fotos adicionales
              const description = `${plant.personalName}`;
              const uploadDate = plant.date || new Date().toISOString();
              
              db.run(
                "INSERT INTO plant_photos (plantId, photoPath, description, uploadDate) VALUES (?, ?, ?, ?)",
                [plantId, plant.photoPath, description, uploadDate],
                function(err) {
                  if (err) {
                    console.error("Error saving current main photo:", err);
                    return callback(err);
                  }
                  callback(null);
                }
              );
            } else {
              callback(null); // No hay foto principal actual, continuar
            }
          };

          // Ejecutar el intercambio
          saveCurrentMainPhoto((err) => {
            if (err) {
              return res.status(500).json({ error: "Error guardando la foto principal actual" });
            }

            // Actualizar la planta con la nueva foto principal (sin cambiar la fecha)
            db.run(
              "UPDATE plants SET photoPath = ? WHERE id = ? AND userId = ?",
              [photoToPromote.photoPath, plantId, userId],
              function(err) {
                if (err) {
                  console.error("Database error updating plant main photo:", err);
                  return res.status(500).json({ error: "Error actualizando la foto principal" });
                }

                // Eliminar la foto de la tabla de fotos adicionales
                db.run(
                  "DELETE FROM plant_photos WHERE id = ? AND plantId = ?",
                  [photoId, plantId],
                  function(err) {
                    if (err) {
                      console.error("Database error removing photo from additional photos:", err);
                      return res.status(500).json({ error: "Error removiendo la foto de fotos adicionales" });
                    }

                    res.json({ 
                      message: "Foto principal intercambiada exitosamente",
                      newMainPhoto: photoToPromote.photoPath
                    });
                  }
                );
              }
            );
          });
        }
      );
    }
  );
});

// GET /export/data - Exportar todos los datos del usuario
app.get("/export/data", authenticateToken, (req, res) => {
  const userId = req.user.uid;
  const timestamp = new Date().toISOString();
  
  // Obtener plantas del usuario
  db.all(
    "SELECT * FROM plants WHERE userId = ?",
    [userId],
    (err, plants) => {
      if (err) {
        console.error("Error al obtener plantas para exportación:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
      }

      // Obtener recordatorios del usuario
      db.all(
        "SELECT * FROM reminders WHERE userId = ?",
        [userId],
        (err, reminders) => {
          if (err) {
            console.error("Error al obtener recordatorios para exportación:", err);
            return res.status(500).json({ error: "Error interno del servidor" });
          }

          // Obtener fotos adicionales del usuario
          db.all(
            `SELECT pp.*, p.personalName as plantPersonalName 
             FROM plant_photos pp 
             INNER JOIN plants p ON pp.plantId = p.id 
             WHERE p.userId = ?`,
            [userId],
            (err, additionalPhotos) => {
              if (err) {
                console.error("Error al obtener fotos adicionales para exportación:", err);
                return res.status(500).json({ error: "Error interno del servidor" });
              }

              // Preparar datos para exportación
              const exportData = {
                export_info: {
                  app: "PlantCare",
                  version: "1.0.0",
                  exported_at: timestamp,
                  user_id: userId,
                  total_plants: plants.length,
                  total_reminders: reminders.length,
                  total_additional_photos: additionalPhotos.length
                },
                user_data: {
                  plants: plants.map(plant => ({
                    id: plant.id,
                    scientific_name: plant.sciName,
                    common_name: plant.commonName,
                    personal_name: plant.personalName,
                    location: plant.location,
                    watering_frequency: plant.watering,
                    light_requirements: plant.light,
                    drainage: plant.drainage,
                    personal_notes: plant.notes,
                    photo_path: plant.photoPath,
                    date_added: plant.date
                  })),
                  reminders: reminders.map(reminder => ({
                    id: reminder.id,
                    plant_id: reminder.plantId,
                    type: reminder.type,
                    title: reminder.title,
                    description: reminder.description,
                    date: reminder.date,
                    frequency_days: reminder.frequency,
                    completed: reminder.completed,
                    created_at: reminder.createdAt
                  })),
                  additional_photos: additionalPhotos.map(photo => ({
                    id: photo.id,
                    plant_id: photo.plantId,
                    plant_personal_name: photo.plantPersonalName,
                    photo_path: photo.photoPath,
                    description: photo.description,
                    upload_date: photo.uploadDate
                  }))
                },
                statistics: {
                  plants_by_watering: plants.reduce((acc, plant) => {
                    const watering = plant.watering || 'no_specified';
                    acc[watering] = (acc[watering] || 0) + 1;
                    return acc;
                  }, {}),
                  plants_by_light: plants.reduce((acc, plant) => {
                    const light = plant.light || 'no_specified';
                    acc[light] = (acc[light] || 0) + 1;
                    return acc;
                  }, {}),
                  reminders_by_type: reminders.reduce((acc, reminder) => {
                    const type = reminder.type || 'other';
                    acc[type] = (acc[type] || 0) + 1;
                    return acc;
                  }, {}),
                  photos_by_plant: additionalPhotos.reduce((acc, photo) => {
                    const plantName = photo.plantPersonalName || `Plant_${photo.plantId}`;
                    acc[plantName] = (acc[plantName] || 0) + 1;
                    return acc;
                  }, {}),
                  oldest_plant: plants.length > 0 ? 
                    plants.reduce((oldest, plant) => new Date(plant.date) < new Date(oldest.date) ? plant : oldest).date : null,
                  newest_plant: plants.length > 0 ?
                    plants.reduce((newest, plant) => new Date(plant.date) > new Date(newest.date) ? plant : newest).date : null
                }
              };

              // Configurar headers para descarga
              const filename = `plantcare_export_${userId.substring(0, 8)}_${timestamp.split('T')[0]}.json`;
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
              
              // Enviar datos
              res.json(exportData);
            }
          );
        }
      );
    }
  );
});

// DELETE /user/all-data - Eliminar todos los datos del usuario
app.delete("/user/all-data", authenticateToken, (req, res) => {
  const userId = req.user.uid;

  // Primero obtener todas las rutas de fotos del usuario para eliminarlas
  // Incluir tanto fotos principales como fotos adicionales
  const getMainPhotos = new Promise((resolve, reject) => {
    db.all(
      "SELECT photoPath FROM plants WHERE userId = ? AND photoPath IS NOT NULL",
      [userId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(row => row.photoPath));
      }
    );
  });

  const getAdditionalPhotos = new Promise((resolve, reject) => {
    db.all(
      `SELECT pp.photoPath 
       FROM plant_photos pp 
       INNER JOIN plants p ON pp.plantId = p.id 
       WHERE p.userId = ?`,
      [userId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(row => row.photoPath));
      }
    );
  });

  Promise.all([getMainPhotos, getAdditionalPhotos])
    .then(([mainPhotoPaths, additionalPhotoPaths]) => {
      // Combinar todas las rutas de fotos
      const allPhotoPaths = [...mainPhotoPaths, ...additionalPhotoPaths];
      console.log(`Eliminando ${allPhotoPaths.length} fotos (${mainPhotoPaths.length} principales + ${additionalPhotoPaths.length} adicionales)`);

      // Eliminar archivos de fotos
      const deletePromises = allPhotoPaths.map(photoPath => {
        return new Promise((resolve) => {
          if (photoPath) {
            // Extraer solo el nombre del archivo de la URL completa
            const filename = photoPath.split('/').pop();
            const filePath = path.join(__dirname, "uploads", filename);
            
            fs.unlink(filePath, (unlinkErr) => {
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

                // Eliminar fotos adicionales (esto también se eliminará por CASCADE, pero lo hacemos explícito)
                db.run(
                  `DELETE FROM plant_photos 
                   WHERE plantId IN (SELECT id FROM plants WHERE userId = ?)`,
                  [userId],
                  function(photoErr) {
                    if (photoErr) {
                      console.error("Error al eliminar fotos adicionales:", photoErr.message);
                      return db.run("ROLLBACK", () => {
                        res.status(500).json({ error: "Error al eliminar fotos adicionales" });
                      });
                    }

                    const deletedAdditionalPhotos = this.changes;

                    // Eliminar plantas (esto elimina automáticamente recordatorios y fotos por CASCADE)
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

                      console.log(`Datos eliminados para usuario ${userId}: ${deletedPlants} plantas, ${deletedReminders} recordatorios, ${allPhotoPaths.length} fotos`);
                      
                      res.json({
                        success: true,
                        message: "Todos los datos han sido eliminados permanentemente",
                        deletedPlants,
                        deletedReminders,
                        deletedPhotos: allPhotoPaths.length
                      });
                    });
                      }
                    );
                  }
                );
              }
            );
          });
        });
      });
    })
    .catch(err => {
      console.error("Error al obtener rutas de fotos:", err.message);
      res.status(500).json({ error: "Error interno del servidor" });
    });
});

// ENDPOINTS IoT - Integración con dispositivos ESP32

// GET /api/iot/devices/:udid - Obtener datos del dispositivo
app.get("/api/iot/devices/:udid", authenticateToken, async (req, res) => {
  const { udid } = req.params;
  const userId = req.user.uid;
  
  console.log(`🔍 [IoT] Solicitando datos para dispositivo: ${udid} por usuario: ${userId}`);
  
  try {
    // Verificar que el usuario tiene acceso a este dispositivo
    db.get(
      "SELECT * FROM iot_devices WHERE udid = ? AND userId = ?",
      [udid, userId],
      async (err, device) => {
        if (err) {
          console.error(`❌ [IoT] Error de BD consultando dispositivo ${udid}:`, err);
          return res.status(500).json({ error: "Error de base de datos" });
        }
        
        if (!device) {
          console.log(`⚠️ [IoT] Dispositivo ${udid} no encontrado o sin acceso para usuario ${userId}`);
          return res.status(404).json({ error: "Dispositivo no encontrado o sin acceso" });
        }

        console.log(`✅ [IoT] Dispositivo encontrado en BD:`, device);

        try {
          // Usar el endpoint correcto para obtener el último log del dispositivo
          const apiUrl = `https://api.drcvault.dev/api/logs/device/${udid}?latest=true`;
          console.log(`🌐 [IoT] Consultando API externa: ${apiUrl}`);
          
          // Obtener datos del dispositivo desde la API externa
          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'PlantCare-Backend/1.0'
            }
          });
          
          console.log(`📡 [IoT] Respuesta de API externa - Status: ${response.status}, Headers:`, Object.fromEntries(response.headers));
          
          if (response.ok) {
            const apiData = await response.json();
            console.log(`✅ [IoT] Datos recibidos de API externa:`, apiData);
            
            // Transformar los datos al formato esperado por el frontend
            const iotData = Array.isArray(apiData) && apiData.length > 0 ? {
              udid: udid,
              status: "connected",
              temperature: apiData[0].temp,
              humidity: apiData[0].moisture_air,
              soil_moisture: apiData[0].moisture_dirt,
              timestamp: apiData[0].timestamp,
              raw_data: apiData[0]
            } : {
              udid: udid,
              status: "no_data",
              temperature: null,
              humidity: null,
              soil_moisture: null,
              timestamp: new Date().toISOString(),
              error: "No hay datos disponibles"
            };
            
            res.json({
              device: device,
              data: iotData,
              lastUpdate: new Date().toISOString()
            });
          } else {
            const errorText = await response.text();
            console.error(`❌ [IoT] API externa respondió con error ${response.status}:`, errorText);
            
            // Sin datos mockup - solo mostrar error real
            res.status(503).json({ 
              error: "Dispositivo IoT no disponible",
              details: `Status ${response.status}: ${errorText}`,
              apiUrl: apiUrl
            });
          }
        } catch (fetchError) {
          console.error(`💥 [IoT] Error conectando con API externa para dispositivo ${udid}:`, fetchError);
          console.error(`💥 [IoT] Stack trace:`, fetchError.stack);
          
          res.status(503).json({ 
            error: "Error conectando con dispositivo IoT",
            details: fetchError.message,
            type: fetchError.name
          });
        }
      }
    );
  } catch (error) {
    console.error(`💥 [IoT] Error general en endpoint devices/${udid}:`, error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// POST /api/iot/associate - Asociar dispositivo IoT con usuario
app.post("/api/iot/associate", authenticateToken, (req, res) => {
  const { udid, plantId, deviceName } = req.body;
  const userId = req.user.uid;
  
  if (!udid) {
    return res.status(400).json({ error: "UDID del dispositivo requerido" });
  }

  // Verificar que la planta pertenece al usuario (si se especifica)
  if (plantId) {
    db.get(
      "SELECT id FROM plants WHERE id = ? AND userId = ?",
      [plantId, userId],
      (err, plant) => {
        if (err || !plant) {
          return res.status(404).json({ error: "Planta no encontrada" });
        }
        
        // Continuar con la asociación
        createDeviceAssociation();
      }
    );
  } else {
    createDeviceAssociation();
  }

  function createDeviceAssociation() {
    db.run(
      `INSERT OR REPLACE INTO iot_devices (udid, userId, plantId, deviceName, associatedAt) 
       VALUES (?, ?, ?, ?, ?)`,
      [udid, userId, plantId, deviceName || `Sensor-${udid.slice(-4)}`, new Date().toISOString()],
      function (err) {
        if (err) {
          console.error("Error associating device:", err);
          return res.status(500).json({ error: "Error asociando dispositivo" });
        }
        
        res.json({
          id: this.lastID,
          message: "Dispositivo asociado exitosamente",
          udid: udid
        });
      }
    );
  }
});

// GET /api/iot/plants/:plantId/sensors - Obtener datos de sensores para una planta
app.get("/api/iot/plants/:plantId/sensors", authenticateToken, async (req, res) => {
  const { plantId } = req.params;
  const userId = req.user.uid;
  
  console.log(`🌱 [IoT] Solicitando sensores para planta ${plantId} por usuario ${userId}`);
  
  try {
    // Obtener dispositivos asociados a la planta
    db.all(
      `SELECT * FROM iot_devices 
       WHERE plantId = ? AND userId = ? AND isActive = 1`,
      [plantId, userId],
      async (err, devices) => {
        if (err) {
          console.error(`❌ [IoT] Error de BD consultando dispositivos para planta ${plantId}:`, err);
          return res.status(500).json({ error: "Error de base de datos" });
        }

        console.log(`📋 [IoT] Dispositivos encontrados para planta ${plantId}:`, devices.length, devices);

        const sensorsData = [];
        
        for (const device of devices) {
          console.log(`🔄 [IoT] Procesando dispositivo ${device.udid} para planta ${plantId}`);
          
          try {
            const apiUrl = `https://api.drcvault.dev/api/logs/device/${device.udid}?latest=true`;
            console.log(`🌐 [IoT] Consultando: ${apiUrl}`);
            
            const response = await fetch(apiUrl, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'PlantCare-Backend/1.0'
              }
            });
            
            console.log(`📡 [IoT] Respuesta para ${device.udid} - Status: ${response.status}`);
            
            if (response.ok) {
              const apiData = await response.json();
              console.log(`✅ [IoT] Datos recibidos para ${device.udid}:`, apiData);
              
              // Transformar los datos al formato esperado
              const sensorData = Array.isArray(apiData) && apiData.length > 0 ? {
                udid: device.udid,
                status: "connected",
                temperature: apiData[0].temp,
                humidity: apiData[0].moisture_air,
                soil_moisture: apiData[0].moisture_dirt,
                timestamp: apiData[0].timestamp,
                raw_data: apiData[0]
              } : {
                udid: device.udid,
                status: "no_data",
                temperature: null,
                humidity: null,
                soil_moisture: null,
                timestamp: new Date().toISOString(),
                error: "No hay datos disponibles"
              };
              
              sensorsData.push({
                device: device,
                sensorData: sensorData,
                lastUpdate: new Date().toISOString()
              });
            } else {
              const errorText = await response.text();
              console.error(`❌ [IoT] Error ${response.status} para dispositivo ${device.udid}:`, errorText);
              
              // Sin datos mockup - solo mostrar error real
              sensorsData.push({
                device: device,
                sensorData: null,
                error: `Dispositivo no disponible (${response.status})`,
                errorDetails: errorText,
                lastUpdate: new Date().toISOString()
              });
            }
          } catch (error) {
            console.error(`💥 [IoT] Error conectando con dispositivo ${device.udid}:`, error);
            
            sensorsData.push({
              device: device,
              sensorData: null,
              error: "Error de conexión",
              errorDetails: error.message,
              lastUpdate: new Date().toISOString()
            });
          }
        }
        
        console.log(`📤 [IoT] Enviando respuesta para planta ${plantId}:`, sensorsData);
        res.json(sensorsData);
      }
    );
  } catch (error) {
    console.error(`💥 [IoT] Error general en sensors para planta ${plantId}:`, error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// GET /api/iot/devices - Listar todos los dispositivos del usuario
app.get("/api/iot/devices", authenticateToken, (req, res) => {
  const userId = req.user.uid;
  
  db.all(
    `SELECT d.*, p.personalName as plantName, p.commonName as plantCommonName 
     FROM iot_devices d 
     LEFT JOIN plants p ON d.plantId = p.id 
     WHERE d.userId = ? AND d.isActive = 1 
     ORDER BY d.associatedAt DESC`,
    [userId],
    (err, devices) => {
      if (err) {
        console.error("Error fetching devices:", err);
        return res.status(500).json({ error: "Error de base de datos" });
      }
      
      res.json(devices);
    }
  );
});

// DELETE /api/iot/devices/:id - Eliminar dispositivo IoT
app.delete("/api/iot/devices/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.uid;
  
  db.run(
    "UPDATE iot_devices SET isActive = 0 WHERE id = ? AND userId = ?",
    [id, userId],
    function (err) {
      if (err) {
        console.error("Error deleting device:", err);
        return res.status(500).json({ error: "Error eliminando dispositivo" });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: "Dispositivo no encontrado" });
      }
      
      res.json({ message: "Dispositivo eliminado exitosamente" });
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
