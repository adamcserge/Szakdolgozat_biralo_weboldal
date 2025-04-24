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

axios.defaults.withCredentials = true;

dotenv.config();

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
    },
  })
);

app.use(
  cors({
    origin: "http://localhost:8080", // A frontend URL-je
    credentials: true, // Engedélyezi a cookie-k továbbítását
  })
);

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

// Regisztráció
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
});

// Bejelentkezés
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
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
