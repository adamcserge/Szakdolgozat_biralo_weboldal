/*require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");*/
import dotenv from "dotenv";
import express from "express";
import mysql from "mysql2";
import cors from "cors";
import axios from "axios";
import session from "express-session";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

axios.defaults.withCredentials = true;

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
//app.use(cors());

// MySQL kapcsolat beállítása
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
});

// MySQL kapcsolat pool létrehozása
const pool = mysql
  .createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  })
  .promise();

//sessien kezelése
app.use(
  session({
    /*secret: "titkoskulcs", // Titkos kulcs a session titkosításához
    resave: false, // Ne mentse újra a session-t minden kérésnél
    saveUninitialized: true, // Mentse el az üres session-öket is
    cookie: { secure: false }, // HTTPS esetén állítsd `true`-ra*/

    secret: "titkoskulcs", // Titkos kulcs a session titkosításához
    resave: false, // Ne mentse újra a session-t minden kérésnél
    saveUninitialized: true, // Mentse el az üres session-öket is
    cookie: {
      secure: false, // HTTPS esetén állítsd `true`-ra
      httpOnly: true, // Csak a szerver férhet hozzá a cookie-hoz
      maxAge: 60 * 60 * 1000, // Cookie érvényességi ideje (1 óra)
    },
  })
);

app.use(
  cors({
    origin: "http://localhost:8080", // A frontend URL-je
    credentials: true, // Engedélyezi a cookie-k továbbítását
  })
);

//app.use(cors());

app.use("/uploads", express.static("uploads"));

db.connect((err) => {
  if (err) {
    console.error("MySQL kapcsolat sikertelen:", err);
    return;
  }
  console.log("✅ MySQL kapcsolat sikeres");
});

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

// Bejelentkezés
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  // Ellenőrizzük, hogy van-e már bejelentkezett felhasználó
  if (req.session.user) {
    return res
      .status(400)
      .send("Először jelentkezz ki, mielőtt újra bejelentkezel.");
  }

  const [users] = await pool.execute(
    "SELECT * FROM resztvevok WHERE rvEmail = ? AND rvJelszo = ?",
    [email, password]
  );

  if (users.length === 0) {
    return res.status(401).send("Hibás e-mail vagy jelszó");
  }
  // Bejelentkezés sikeres
  req.session.user = users[0]; // Felhasználó mentése a session-be
  console.log("Bejelentkezett felhasználó:", req.session.user); // Naplózás
  res.json({ message: "Sikeres bejelentkezés!" });
});

//Felhasználó adatok
app.get("/api/user", (req, res) => {
  console.log("Session tartalom:", req.session); // Naplózás
  if (!req.session.user) {
    return res.status(401).send("Nem vagy bejelentkezve");
  }

  res.json(req.session.user);
});

//Kijelentkezés
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.send("Sikeresen kiléptél");
  });
});

/*// Regisztráció
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;
  const [existing] = await pool.execute(
    "SELECT * FROM resztvevok WHERE rvEmail = ?",
    [email]
  );

  if (existing.length > 0) {
    return res.status(400).send("Ez az e-mail már regisztrált.");
  }

  await pool.execute(
    "INSERT INTO resztvevok (rvEmail, rvJelszo) VALUES (?, ?)",
    [email, password]
  );
  res.send("Sikeres regisztráció!");
});*/

app.post("/api/register", async (req, res) => {
  const {
    rvEmail,
    rvFelhasznalonev,
    rvJelszo,
    rvNEV,
    rvSzervezetID,
    rvVegzetseg,
  } = req.body;

  // Adatbázis lekérdezés a regisztrációhoz
  const query = `
    INSERT INTO resztvevok (rvEmail, rvFelhasznalonev, rvNEV, rvSzervezetID, rvVegzetseg, rvJelszo)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  try {
    await db.execute(query, [
      rvEmail,
      rvFelhasznalonev,
      rvNEV,
      rvSzervezetID,
      rvVegzetseg,
      rvJelszo,
    ]);
    res.json({ message: "Sikeres regisztráció!" });
  } catch (err) {
    res.status(500).json({ error: "Hiba történt a regisztráció során!" });
  }
});

/*app.get("/api/szervezetek", (req, res) => {
  db.query(
    "SELECT szervezetID, szervezetNEV FROM szervezet",
    (err, results) => {
      if (err) {
        console.error("Hiba a szervezetek lekérésekor:", err);
        res
          .status(500)
          .json({ error: "Hiba történt a szervezetek lekérésekor" });
        return;
      }
      res.json(results);
    }
  );
});*/

app.get("/api/szervezetek", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      WITH RECURSIVE szervezeti_hierarchia AS (
        SELECT szervezetID, szervezetNEV, felettesID, 0 AS szint
        FROM szervezet
        WHERE felettesID IS NULL
        UNION ALL
        SELECT s.szervezetID, s.szervezetNEV, s.felettesID, sh.szint + 1
        FROM szervezet s
        INNER JOIN szervezeti_hierarchia sh ON s.felettesID = sh.szervezetID
      )
      SELECT * FROM szervezeti_hierarchia
      ORDER BY szint, szervezetNEV;
    `);
    res.json(rows);
  } catch (err) {
    console.error("Hiba a szervezetek lekérésekor:", err);
    res.status(500).json({ error: "Hiba történt a szervezetek lekérésekor" });
  }
});

async function fetchSzervezetek() {
  try {
    const response = await axios.get("http://localhost:3000/api/szervezetek");
    const flatData = response.data;

    // Hierarchikus struktúra létrehozása
    const map = {};
    flatData.forEach((item) => {
      map[item.szervezetID] = { ...item, children: [] };
    });

    const tree = [];
    flatData.forEach((item) => {
      if (item.felettesID) {
        map[item.felettesID].children.push(map[item.szervezetID]);
      } else {
        tree.push(map[item.szervezetID]);
      }
    });

    this.szervezetek = tree;
  } catch (error) {
    console.error("Hiba a szervezetek lekérésekor", error);
  }
}

// Fájlok tárolása az uploads mappában
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Feltöltési hely
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Egyedi fájlnév
  },
});

const upload = multer({ storage: storage });

// Dokumentum feltöltése
app.post("/api/feltoltes", upload.single("file"), async (req, res) => {
  const { temaID, tipus } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "Nincs fájl feltöltve" });
  }

  try {
    // Fájlelérési útvonal és eredeti fájlnév mentése az adatbázisba
    const sql = `INSERT INTO dokumentumok (temaID, eleres, eredeti_nev, tipus) VALUES (?, ?, ?, ?)`;
    await pool.execute(sql, [
      temaID || null,
      file.filename,
      file.originalname,
      tipus || 0,
    ]);
    res.json({
      message: "Fájl sikeresen feltöltve!",
      fileName: file.originalname,
    });
  } catch (error) {
    console.error("Feltöltési hiba:", error);
    res.status(500).json({ error: "Hiba történt a fájl mentésekor" });
  }
});

const UPLOADS_DIR = path.join(__dirname, "uploads");

// Fájlok lekérdezése
app.get("/api/feltoltott-fajlok", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT dokID, eredeti_nev, eleres FROM dokumentumok"
    );
    res.json(rows);
  } catch (err) {
    console.error("Hiba a fájlok lekérdezésekor:", err);
    res.status(500).json({ error: "Nem sikerült a fájlok listázása." });
  }
});

// Témák lekérdezése
app.get("/api/temak", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT temaID, temaCim FROM tema");
    res.json(rows);
  } catch (err) {
    console.error("Hiba a témák lekérdezésekor:", err);
    res.status(500).json({ error: "Nem sikerült a témák lekérdezése." });
  }
});

// Indítsuk el a szervert
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Backend fut a ${PORT} porton`));
