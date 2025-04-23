require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// MySQL kapcsolat beállítása
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
});

db.connect((err) => {
  if (err) {
    console.error("MySQL kapcsolat sikertelen:", err);
    return;
  }
  console.log("✅ MySQL kapcsolat sikeres");
});

// Indítsuk el a szervert
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Backend fut a ${PORT} porton`));

// Összes hallgató lekérdezése
app.get("/api/hallgatok", (req, res) => {
  db.query("SELECT * FROM hallgato", (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    // Visszaküldi az adatokat a frontendnek JSON formátumban
    res.json(results);
    // Kiírja a lekért adatokat a terminálba
    console.log("Hallgatók adatainak lekérdezése:", results);
  });
});
// Egy adott hallgató lekérdezése ID alapján
app.get("/api/hallgatok/:id", (req, res) => {
  const { id } = req.params;
  console.log("Lekérdezett ID:", id);
  db.query(
    "SELECT * FROM hallgato WHERE hallgatoID = ?",
    [id],
    (err, results) => {
      if (err) {
        res.status(500).send(err);
        return;
      }
      res.json(results);
      console.log("Hallgató adatainak lekérdezése:", results);
    }
  );
});

// Új hallgató hozzáadása
app.post("/api/hallgato", (req, res) => {
  const { hallgatoNEV, hallgatoNK, hallgatoEMAIL } = req.body;

  if (!hallgatoNEV || !hallgatoNK || !hallgatoEMAIL) {
    return res.status(400).json({ error: "Hiányzó adatok" });
  }

  const sql = `INSERT INTO hallgato (hallgatoNEV, hallgatoNK, hallgatoEMAIL) VALUES (?, ?, ?)`;
  db.query(sql, [hallgatoNEV, hallgatoNK, hallgatoEMAIL], (err, result) => {
    if (err) {
      console.error("Hiba:", err);
      return res.status(500).json({ error: "Adatbevitel sikertelen" });
    }
    res.json({ message: "Sikeres adatbevitel", result });
  });
});
