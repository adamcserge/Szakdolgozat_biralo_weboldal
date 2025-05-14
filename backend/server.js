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
    res.json({ message: "Hallgató sikeresen feltöltve", result });
  });
});

app.post("/api/hallgato/ellenorzes", async (req, res) => {
  const { hallgatoNK } = req.body;

  if (!hallgatoNK) {
    return res.status(400).json({ error: "A Neptun kód megadása kötelező." });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT COUNT(*) AS count FROM hallgato WHERE hallgatoNK = ?`,
      [hallgatoNK]
    );

    if (rows[0].count > 0) {
      return res
        .status(409)
        .json({ error: "Ez a hallgató már létezik a rendszerben." });
    }

    res.json({ message: "A hallgató még nem létezik." });
  } catch (err) {
    console.error("Hiba a hallgató ellenőrzésekor:", err);
    res.status(500).json({ error: "Hiba történt a hallgató ellenőrzésekor." });
  }
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
  // Bejelentkezés sikeres, elindítja a session-t
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
    rvVegzettseg,
  } = req.body;

  // Adatbázis lekérdezés a regisztrációhoz
  const query = `
    INSERT INTO resztvevok (rvEmail, rvFelhasznalonev, rvNEV, rvSzervezetID, rvVegzetseg, rvJelszo)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  try {
    await pool.execute(query, [
      rvEmail,
      rvFelhasznalonev,
      rvNEV,
      rvSzervezetID,
      rvVegzettseg,
      rvJelszo,
    ]);
    res.json({ message: "Sikeres regisztráció!" });
  } catch (err) {
    console.error("Regisztrációs hiba:", err);
    console.log("Kapott adatok:", req.body);
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
  const user = req.session.user;
  if (!user) {
    return res.status(401).json({ error: "Nem vagy bejelentkezve" });
  }

  const { temaID, tipus } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "Nincs fájl feltöltve" });
  }

  try {
    // Fájlelérési útvonal és eredeti fájlnév mentése az adatbázisba
    const sql = `INSERT INTO dokumentumok (temaID, eleres, eredeti_nev, tipus, feltolto) VALUES (?, ?, ?, ?, ?)`;
    await pool.execute(sql, [
      temaID || null,
      file.filename,
      file.originalname,
      tipus || 0,
      user.rvID,
    ]);
    res.json({
      message: "Fájl sikeresen feltöltve!",
      fileName: file.originalname,
    });
  } catch (error) {
    console.error("Feltöltési hiba:", error);

    //Fájl törlése, ha DB mentés meghiúsult
    const filePath = path.join(__dirname, "uploads", file.filename);
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) {
        console.error("Nem sikerült törölni a fájlt:", unlinkErr);
      } else {
        console.log("Törölt fájl adatbázishiba miatt:", file.filename);
      }
    });

    res.status(500).json({ error: "Hiba történt a fájl mentésekor" });
  }
});

const UPLOADS_DIR = path.join(__dirname, "uploads"); //ez mondja meg hova tölti fel a fájlokat
//Fájlok letöltése
app.get("/api/letoltes/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(UPLOADS_DIR, filename);

  res.download(filePath, (err) => {
    if (err) {
      console.error("Letöltési hiba:", err);
      res.status(404).json({ error: "Fájl nem található" });
    }
  });
});

// Fájlok lekérdezése
app.get("/api/feltoltott-fajlok", async (req, res) => {
  const user = req.session.user;
  if (!user) {
    return res.status(401).json({ error: "Nem vagy bejelentkezve" });
  }

  try {
    const [rows] = await pool.execute(
      `
      SELECT d.dokID, d.eredeti_nev, d.eleres, d.tipus, t.temaCim, t.biralva
      FROM dokumentumok d
      LEFT JOIN tema t ON d.temaID = t.temaID
      WHERE d.feltolto = ?
      `,
      [user.rvID]
    );
    res.json(rows);
  } catch (err) {
    console.error("Hiba a dokumentumok lekérdezésekor:", err);
    res
      .status(500)
      .json({ error: "Hiba történt a dokumentumok lekérdezésekor." });
  }
});

//dokumentumok törlése
app.delete("/api/dokumentum/:id", async (req, res) => {
  const user = req.session.user;
  if (!user) {
    return res.status(401).json({ error: "Nem vagy bejelentkezve" });
  }

  const dokumentumID = req.params.id;

  try {
    // Lekérjük a fájl nevét az ID alapján
    const [rows] = await pool.execute(
      "SELECT eleres FROM dokumentumok WHERE dokID = ? AND feltolto = ?",
      [dokumentumID, user.rvID]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: "A dokumentum nem található vagy nem a tiéd" });
    }

    const fileName = rows[0].eleres;

    // Töröljük az adatbázisból
    await pool.execute("DELETE FROM dokumentumok WHERE dokID = ?", [
      dokumentumID,
    ]);

    // Töröljük a fájlt a fájlrendszerből
    const filePath = path.join(__dirname, "uploads", fileName);
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Fájl törlési hiba:", err);
      } else {
        console.log("Fájl törölve:", fileName);
      }
    });

    res.json({ message: "Dokumentum sikeresen törölve" });
  } catch (error) {
    console.error("Törlés hiba:", error);
    res.status(500).json({ error: "Hiba történt a dokumentum törlésekor" });
  }
});

// Témák lekérdezése
app.get("/api/temak", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT temaID, temaCim, biraloID, biralva FROM tema"
    );
    res.json(rows);
  } catch (err) {
    console.error("Hiba a témák lekérdezésekor:", err);
    res.status(500).json({ error: "Nem sikerült a témák lekérdezése." });
  }
});

//téma feltöltése
app.post("/api/tema", async (req, res) => {
  const user = req.session.user;
  if (!user) {
    return res.status(401).json({ error: "Nem vagy bejelentkezve" });
  }

  const { temaCim, temacsoport, hallgatoID, szervezetID, extraKonzulensID } =
    req.body;

  try {
    // Téma mentése
    const [result] = await pool.execute(
      `INSERT INTO tema (temaCim, temacsoport, hallgatoID, konzulensID, szervezetID, biralva)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [
        temaCim,
        temacsoport || null,
        hallgatoID || null,
        user.rvID, // A bejelentkezett felhasználó ID-ja mint konzulensID
        szervezetID || null,
      ]
    );

    const temaID = result.insertId;

    // Konzulens táblába beszúrás a bejelentkezett felhasználóval
    await pool.execute(
      `INSERT INTO konzulens (temaID, konzulensID) VALUES (?, ?)`,
      [temaID, user.rvID]
    );

    // Konzulens táblába beszúrás a további konzulenssel (ha van)
    if (extraKonzulensID) {
      await pool.execute(
        `INSERT INTO konzulens (temaID, konzulensID) VALUES (?, ?)`,
        [temaID, extraKonzulensID]
      );
    }

    res.json({ message: "Téma sikeresen feltöltve", temaID });
  } catch (error) {
    console.error("Téma feltöltési hiba:", error);
    res.status(500).json({ error: "Hiba történt a téma mentésekor" });
  }
});
/*//felhasználóval kapcsolatos téma lekérdezése
app.get("/api/kapcsolodoTema", (req, res) => {
  const konzulensID = req.session.userID; // A bejelentkezett felhasználó ID-ja

  const query = "SELECT * FROM tema WHERE konzulensID = ?";
  db.query(query, [konzulensID], (err, results) => {
    if (err) {
      return res.status(500).send({ error: "Database error" });
    }
    res.json(results);
  });
});*/

//bíráló felkérése
app.post("/felkeres-biralot", (req, res) => {
  const { temaID, biraloID } = req.body;

  // Ellenőrizzük, hogy létezik-e már a bíráló és téma kombináció
  const checkSql = `
    SELECT * FROM biralo WHERE BtemaID = ? AND BbiraloID = ?
  `;

  db.query(checkSql, [temaID, biraloID], (checkErr, results) => {
    if (checkErr) {
      console.error("Hiba az ellenőrzés során:", checkErr);
      return res.status(500).json({ error: "Hiba az ellenőrzés során." });
    }

    if (results.length > 0) {
      return res
        .status(400)
        .json({ error: "Ez a bíráló már fel van kérve ehhez a témához." });
    }

    // Ha nem létezik, beszúrjuk az új sort
    const insertSql = `
      INSERT INTO biralo (BtemaID, BbiraloID, allapot)
      VALUES (?, ?, 'felkeres')
    `;

    const updateSql = `
      UPDATE tema
      SET biralva = 1
      WHERE temaID = ?
    `;

    db.query(insertSql, [temaID, biraloID], (insertErr) => {
      if (insertErr) {
        console.error("Hiba a bíráló felkérésekor:", insertErr);
        return res.status(500).json({ error: "Hiba a felkérés során." });
      }

      db.query(updateSql, [temaID], (updateErr) => {
        if (updateErr) {
          console.error("Hiba a téma frissítésekor:", updateErr);
          return res
            .status(500)
            .json({ error: "Hiba a téma frissítése során." });
        }

        res.json({ message: "Bíráló sikeresen felkérve.", temaID });
      });
    });
  });
});

app.post("/api/elfogad-felkeres", async (req, res) => {
  const { temaID } = req.body;
  const biraloID = req.session.user?.rvID; // A bejelentkezett bíráló ID-ja

  if (!biraloID) {
    return res.status(401).json({ error: "Nem vagy bejelentkezve." });
  }

  try {
    // Frissítjük a `biralo` táblát
    const updateBiraloSql = `
      UPDATE biralo
      SET allapot = 'elfogadva'
      WHERE BtemaID = ? AND BbiraloID = ?
    `;
    await pool.execute(updateBiraloSql, [temaID, biraloID]);

    // Frissítjük a `tema` táblát
    const updateTemaSql = `
      UPDATE tema
      SET biraloID = ?, biralva = 2
      WHERE temaID = ?
    `;
    await pool.execute(updateTemaSql, [biraloID, temaID]);

    res.json({ message: "Felkérés sikeresen elfogadva!" });
  } catch (err) {
    console.error("Hiba a felkérés elfogadásakor:", err);
    res.status(500).json({ error: "Hiba történt a felkérés elfogadásakor." });
  }
});

app.post("/api/elutasit-felkeres", async (req, res) => {
  const { temaID } = req.body;
  const biraloID = req.session.user?.rvID; // A bejelentkezett bíráló ID-ja

  if (!biraloID) {
    return res.status(401).json({ error: "Nem vagy bejelentkezve." });
  }

  try {
    // Frissítjük a `biralo` táblát
    const updateBiraloSql = `
      UPDATE biralo
      SET allapot = 'elutasítva'
      WHERE BtemaID = ? AND BbiraloID = ?
    `;
    await pool.execute(updateBiraloSql, [temaID, biraloID]);

    // Frissítjük a `tema` táblát
    const updateTemaSql = `
      UPDATE tema
      SET biralva = 0
      WHERE temaID = ?
    `;
    await pool.execute(updateTemaSql, [temaID]);

    res.json({ message: "Felkérés sikeresen elutasítva!" });
  } catch (err) {
    console.error("Hiba a felkérés elutasításakor:", err);
    res.status(500).json({ error: "Hiba történt a felkérés elutasításakor." });
  }
});

app.get("/api/osszes-biralo", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Nem vagy bejelentkezve." });
  }

  const bejelentkezettID = req.session.user.rvID;

  const sql = `
    SELECT rvID, rvNEV AS nev FROM resztvevok
    WHERE rvID != ?
  `;

  db.query(sql, [bejelentkezettID], (err, results) => {
    if (err) {
      console.error("Hiba a bírálók lekérdezésekor:", err);
      res.status(500).json({ error: "Hiba a bírálók lekérésekor." });
    } else {
      res.json(results);
    }
  });
});

app.get("/api/osszes-biralo/:temaID", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Nem vagy bejelentkezve." });
  }

  const bejelentkezettID = req.session.user.rvID;
  const temaID = req.params.temaID;

  const sql = `
    SELECT rvID, rvNEV AS nev
    FROM resztvevok
    WHERE rvID != ?
      AND rvID NOT IN (
        SELECT konzulensID
        FROM konzulens
        WHERE temaID = ?
      )
  `;

  db.query(sql, [bejelentkezettID, temaID], (err, results) => {
    if (err) {
      console.error("Hiba a bírálók lekérdezésekor:", err);
      res.status(500).json({ error: "Hiba a bírálók lekérésekor." });
    } else {
      res.json(results);
    }
  });
});

/*
//bíráló elfogadja vagy sem
app.post("/biralo-valasz", (req, res) => {
  const { temaID, biraloID, valasz } = req.body;

  const sql = `UPDATE biralo SET allapot = ? WHERE BtemaID = ? AND BbiraloID = ?`;
  db.query(sql, [valasz, temaID, biraloID], (err) => {
    if (err) return res.status(500).send("Hiba a válasz feldolgozásakor");
    res.send("Válasz mentve");
  });
});

//bíralat feltöltése
app.post("/feltolt-biralat", upload.single("file"), (req, res) => {
  const { temaID, biraloID } = req.body;
  const eleres = req.file.path;

  const sql = `INSERT INTO biralat (temaID, biraloID, eleres) VALUES (?, ?, ?)`;
  db.query(sql, [temaID, biraloID, eleres], (err) => {
    if (err) return res.status(500).send("Hiba a bírálat mentésekor");
    res.send("Bírálat feltöltve");
  });
});*/

app.post("/api/feltolt-biralat", upload.single("file"), async (req, res) => {
  const user = req.session.user;
  if (!user) {
    return res.status(401).json({ error: "Nem vagy bejelentkezve" });
  }

  const { temaID } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "Nincs fájl feltöltve" });
  }

  try {
    // Fájlelérési útvonal és eredeti fájlnév mentése a `biralat` táblába
    const biralatSql = `INSERT INTO biralat (temaID, biraloID, eleres) VALUES (?, ?, ?)`;
    await pool.execute(biralatSql, [temaID, user.rvID, file.filename]);

    // Fájlelérési útvonal és eredeti fájlnév mentése a `dokumentumok` táblába
    const dokumentumSql = `INSERT INTO dokumentumok (temaID, eleres, eredeti_nev, tipus, feltolto) VALUES (?, ?, ?, ?, ?)`;
    await pool.execute(dokumentumSql, [
      temaID,
      file.filename,
      file.originalname,
      4, // 4 = Bírálat típus
      user.rvID,
    ]);

    // A `tema` tábla `biralva` mezőjének frissítése 3-ra
    const temaSql = `UPDATE tema SET biralva = 3 WHERE temaID = ?`;
    await pool.execute(temaSql, [temaID]);

    res.json({
      message: "Bírálat sikeresen feltöltve!",
      fileName: file.originalname,
    });
  } catch (error) {
    console.error("Hiba a bírálat feltöltésekor:", error);

    // Fájl törlése, ha DB mentés meghiúsult
    const filePath = path.join(__dirname, "uploads", file.filename);
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) {
        console.error("Nem sikerült törölni a fájlt:", unlinkErr);
      } else {
        console.log("Törölt fájl adatbázishiba miatt:", file.filename);
      }
    });

    res.status(500).json({ error: "Hiba történt a bírálat mentésekor" });
  }
});

app.post("/szabad-biralo", async (req, res) => {
  const { temaID } = req.body;

  if (!temaID) {
    return res.status(400).json({ error: "Hiányzó témaID." });
  }

  try {
    // Frissítjük a `szabadBiralat` mezőt 1-re
    await pool.execute(
      `UPDATE tema SET szabadBiralat = 1, biralva = 1  WHERE temaID = ?`,
      [temaID]
    );

    res.json({ message: "A téma sikeresen bírálatra bocsájtva!" });
  } catch (err) {
    console.error("Hiba a téma bírálatra bocsájtásakor:", err);
    res
      .status(500)
      .json({ error: "Hiba történt a téma bírálatra bocsájtásakor." });
  }
});

//bírálatra bocsájtott témák lekérdezése
app.get("/api/szabad-biralatok", async (req, res) => {
  const biraloID = req.session.user?.rvID; // A bejelentkezett bíráló ID-ja

  if (!biraloID) {
    return res.status(401).json({ error: "Nem vagy bejelentkezve." });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT t.temaID, t.temaCim 
       FROM tema t
       WHERE t.szabadBiralat = 1 
         AND t.biraloID IS NULL
         AND t.temaID NOT IN (
           SELECT temaID 
           FROM konzulens 
           WHERE konzulensID = ?
         )`,
      [biraloID]
    );
    res.json(rows);
  } catch (err) {
    console.error("Hiba a szabad bírálatok lekérésekor:", err);
    res
      .status(500)
      .json({ error: "Hiba történt a szabad bírálatok lekérésekor." });
  }
});

app.post("/api/vallal-biralat", async (req, res) => {
  const { temaID } = req.body;
  const biraloID = req.session.user?.rvID; // A bejelentkezett bíráló ID-ja

  if (!biraloID) {
    return res.status(401).json({ error: "Nem vagy bejelentkezve." });
  }

  try {
    // Frissítjük a `tema` táblát
    await pool.execute(
      `UPDATE tema SET biraloID = ?, biralva = 2 WHERE temaID = ?`,
      [biraloID, temaID]
    );

    // Hozzáadjuk a `konzulens` táblához a bírálót
    await pool.execute(
      `INSERT INTO biralo (BtemaID, BbiraloID, allapot) VALUES (?, ?, 'elfogadva')`,
      [temaID, biraloID]
    );

    res.json({ message: "A téma sikeresen elvállalva!" });
  } catch (err) {
    console.error("Hiba a téma elvállalásakor:", err);
    res.status(500).json({ error: "Hiba történt a téma elvállalásakor." });
  }
});
// Résztvevők lekérdezése
app.get("/api/resztvevok", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT rvID, rvNEV, rvEmail, isAdmin FROM resztvevok"
    );
    res.json(rows);
  } catch (err) {
    console.error("Hiba a résztvevők lekérésekor:", err);
    res.status(500).json({ error: "Nem sikerült a résztvevők lekérése." });
  }
});

// Résztvevők lekérdezése id alapján
app.get("/api/resztvevo/:kivalasztottID", async (req, res) => {
  const kivalasztottID = req.params.kivalasztottID;

  try {
    const [rows] = await pool.execute(
      "SELECT rvID, rvNEV, rvEmail, rvFelhasznalonev, rvVegzetseg FROM resztvevok WHERE rvID = ? LIMIT 1",
      [kivalasztottID]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Nincs ilyen résztvevő." });
    }
    /* const vegzetsegSzoveg = {
      1: "BSc",
      2: "MSc",
      3: "PhD",
    };

    // A végzettség számát szöveggé konvertáljuk
    rows[0].rvVegzetseg = vegzetsegSzoveg[rows[0].rvVegzetseg] || "Ismeretlen";*/

    res.json(rows[0]); // egyetlen résztvevő adata
  } catch (err) {
    console.error("Hiba a résztvevő lekérdezésekor:", err);
    res.status(500).json({ error: "Nem sikerült a résztvevő lekérése." });
  }
});

// Bíráló témák lekérdezése
/*app.get("/api/biralo-temak", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Nem vagy bejelentkezve." });
  }

  const biraloID = req.session.user.rvID;

  const sql = `
    SELECT t.temaID, t.temaCim, t.biralva
    FROM tema t
    INNER JOIN biralo b ON t.temaID = b.BtemaID
    WHERE b.BbiraloID = ?
  AND b.allapot IN ('felkeres', 'elfogadva');
  `;

  db.query(sql, [biraloID], (err, results) => {
    if (err) {
      console.error("Hiba a bíráló témák lekérdezésekor:", err);
      res.status(500).json({ error: "Hiba a bíráló témák lekérésekor." });
    } else {
      res.json(results);
    }
  });
});*/

// Bíráló témák lekérdezése
app.get("/api/biralo-temak", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Nem vagy bejelentkezve." });
  }

  const biraloID = req.session.user.rvID;

  const sql = `
    SELECT 
      t.temaID, 
      t.temaCim, 
      t.biralva,

      -- 1. Más által feltöltött 3-as típusú dokumentum
      EXISTS (
        SELECT 1 FROM dokumentumok d 
        WHERE d.temaID = t.temaID AND d.tipus = 3 AND CAST(d.feltolto AS UNSIGNED) != ?
      ) AS titoktartasMasTolt,

      -- 2. Saját feltöltés
      EXISTS (
        SELECT 1 FROM dokumentumok d 
        WHERE d.temaID = t.temaID AND d.tipus = 3 AND CAST(d.feltolto AS UNSIGNED) = ?
      ) AS titoktartasEnTolt

    FROM tema t
    INNER JOIN biralo b ON t.temaID = b.BtemaID
    WHERE b.BbiraloID = ?
      AND b.allapot IN ('felkeres', 'elfogadva');
  `;

  db.query(sql, [biraloID, biraloID, biraloID], (err, results) => {
    if (err) {
      console.error("Hiba a bíráló témák lekérdezésekor:", err);
      res.status(500).json({ error: "Hiba a bíráló témák lekérésekor." });
    } else {
      res.json(results);
    }
  });
});

// Konzulens témák lekérdezése
app.get("/api/konzulens-temak", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Nem vagy bejelentkezve." });
  }

  const konzulensID = req.session.user.rvID;

  const sql = `
    SELECT t.temaID, t.temaCim, t.biraloID, t.biralva, t.szabadBiralat,
      EXISTS (
        SELECT 1 FROM dokumentumok d WHERE d.temaID = t.temaID AND d.tipus = 1
      ) AS temakiiroLapFeltoltve,
      EXISTS (
        SELECT 1 FROM dokumentumok d WHERE d.temaID = t.temaID AND d.tipus = 2
      ) AS szakdolgozatFeltoltve
    FROM tema t
    INNER JOIN konzulens k ON t.temaID = k.temaID
    WHERE k.konzulensID = ?
  `;

  db.query(sql, [konzulensID], (err, results) => {
    if (err) {
      console.error("Hiba a konzulens témák lekérdezésekor:", err);
      res.status(500).json({ error: "Hiba a konzulens témák lekérésekor." });
    } else {
      res.json(results);
    }
  });
});

// Témakiirólap dokumentumok lekérdezése
app.get("/api/temakiirolap/:temaID", async (req, res) => {
  const temaID = req.params.temaID;

  try {
    const [rows] = await pool.execute(
      `SELECT dokID, eredeti_nev, eleres 
       FROM dokumentumok 
       WHERE temaID = ? AND tipus = 1 LIMIT 1`, // Csak a témakiíró dokumentumot kérjük le
      [temaID]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Nincs témakiíró dokumentum ehhez a témához." });
    }

    res.json(rows);
  } catch (err) {
    console.error("Hiba a dokumentumok lekérdezésekor:", err);
    res
      .status(500)
      .json({ error: "Hiba történt a dokumentumok lekérdezésekor." });
  }
});

// Bíralat dokumentumok lekérdezése
app.get("/api/titoktartas/:temaID", async (req, res) => {
  const temaID = req.params.temaID;

  try {
    const [rows] = await pool.execute(
      `SELECT dokID, eredeti_nev, eleres 
       FROM dokumentumok 
       WHERE temaID = ? AND tipus = 3 LIMIT 1`, // Csak a bíráló dokumentumot kérjük le
      [temaID]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Nincs témakiíró dokumentum ehhez a témához." });
    }

    res.json(rows);
  } catch (err) {
    console.error("Hiba a dokumentumok lekérdezésekor:", err);
    res
      .status(500)
      .json({ error: "Hiba történt a dokumentumok lekérdezésekor." });
  }
});

// Témával kapcsolatos dokumentumok lekérdezése
app.get("/api/tema-dokumentumok/:temaID", async (req, res) => {
  const temaID = req.params.temaID;

  try {
    const [rows] = await pool.execute(
      `SELECT dokID, eredeti_nev, tipus, eleres 
       FROM dokumentumok 
       WHERE temaID = ?`,
      [temaID]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Nincs dokumentum ehhez a témához." });
    }

    res.json(rows);
  } catch (err) {
    console.error("Hiba a dokumentumok lekérdezésekor:", err);
    res
      .status(500)
      .json({ error: "Hiba történt a dokumentumok lekérdezésekor." });
  }
});

//Téma cím lekérdezése ID alapján
app.get("/api/temacim/:temaID", async (req, res) => {
  const temaID = req.params.temaID;

  try {
    const [rows] = await pool.execute(
      `SELECT temaCim FROM tema WHERE temaID = ?`,
      [temaID]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "A téma nem található." });
    }

    res.json(rows[0]); // Visszaadjuk a téma címét
  } catch (err) {
    console.error("Hiba a téma címének lekérésekor:", err);
    res.status(500).json({ error: "Hiba történt a téma címének lekérésekor." });
  }
});

// Téma bírálat lekérdezése
app.get("/api/tema-biralat/:temaID", async (req, res) => {
  const temaID = req.params.temaID;

  try {
    const [rows] = await pool.execute(
      `SELECT eleres 
       FROM biralat 
       WHERE temaID = ?`,
      [temaID]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Ehhez a témához nincs bírálat." });
    }

    res.json(rows[0]); // Visszaadja az elérési útvonalat
  } catch (err) {
    console.error("Hiba a bírálat lekérdezésekor:", err);
    res.status(500).json({ error: "Hiba történt a bírálat lekérdezésekor." });
  }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Admin felület

app.get("/api/nemAdmin", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT r.rvID, r.rvNEV, r.rvEmail, s.szervezetNEV
       FROM resztvevok r
       LEFT JOIN szervezet s ON r.rvSzervezetID = s.szervezetID
       WHERE r.isAdmin = 0`
    );
    res.json(rows);
  } catch (err) {
    console.error("Hiba a nem admin résztvevők lekérésekor:", err);
    res
      .status(500)
      .json({ error: "Nem sikerült a nem admin résztvevők lekérése." });
  }
});

app.get("/api/adminok", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Nem vagy bejelentkezve." });
  }

  const bejelentkezettID = req.session.user.rvID;

  try {
    const [rows] = await pool.execute(
      `SELECT r.rvID, r.rvNEV, r.rvEmail, s.szervezetNEV
       FROM resztvevok r
       LEFT JOIN szervezet s ON r.rvSzervezetID = s.szervezetID
       WHERE r.isAdmin = 1 AND r.rvID != ?`,
      [bejelentkezettID]
    );
    res.json(rows);
  } catch (err) {
    console.error("Hiba az admin résztvevők lekérésekor:", err);
    res
      .status(500)
      .json({ error: "Nem sikerült az admin résztvevők lekérése." });
  }
});

app.post("/api/addAdmin", async (req, res) => {
  const { rvID } = req.body;

  if (!rvID) {
    return res.status(400).json({ error: "Hiányzó résztvevő ID" });
  }

  try {
    const [result] = await pool.execute(
      "UPDATE resztvevok SET isAdmin = 1 WHERE rvID = ?",
      [rvID]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Résztvevő nem található" });
    }

    res.json({ message: "Résztvevő admin jogosultságot kapott" });
  } catch (err) {
    console.error("Hiba az admin jogosultság hozzáadásakor:", err);
    res
      .status(500)
      .json({ error: "Hiba történt az admin jogosultság hozzáadásakor" });
  }
});

app.post("/api/deleteAdmin", async (req, res) => {
  const { rvID } = req.body;

  if (!rvID) {
    return res.status(400).json({ error: "Hiányzó résztvevő ID" });
  }

  try {
    const [result] = await pool.execute(
      "UPDATE resztvevok SET isAdmin = 0 WHERE rvID = ?",
      [rvID]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Résztvevő nem található" });
    }

    res.json({ message: "Admin jogosultság megszüntetve" });
  } catch (err) {
    console.error("Hiba az admin jogosultság megszüntetésekor:", err);
    res
      .status(500)
      .json({ error: "Hiba történt az admin jogosultság megszüntetésekor" });
  }
});

app.post("/api/uzenet", async (req, res) => {
  const { tipus, tartalom } = req.body;
  const rvID = req.session.user?.rvID;

  if (!rvID || !tipus || !tartalom) {
    return res.status(400).json({ error: "Hiányzó adatok." });
  }

  try {
    await pool.execute(
      `INSERT INTO uzenetek (rvID, tipus, tartalom) VALUES (?, ?, ?)`,
      [rvID, tipus, tartalom]
    );
    res.json({ message: "Üzenet sikeresen elküldve." });
  } catch (err) {
    console.error("Hiba üzenet mentésekor:", err);
    res.status(500).json({ error: "Hiba történt az üzenet mentésekor." });
  }
});

app.get("/api/uzenetek", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT u.uzenetID, u.tipus, u.tartalom, u.datum, u.allapot, r.rvNEV 
       FROM uzenetek u
       JOIN resztvevok r ON u.rvID = r.rvID
       ORDER BY u.datum DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Hiba az üzenetek lekérésekor:", err);
    res.status(500).json({ error: "Nem sikerült lekérni az üzeneteket." });
  }
});

app.post("/api/elolvasva", async (req, res) => {
  const { uzenetID } = req.body;

  if (!uzenetID) {
    return res.status(400).json({ error: "Hiányzó üzenetID." });
  }

  try {
    await pool.execute(
      `UPDATE uzenetek SET allapot = 'folyamatban' WHERE uzenetID = ?`,
      [uzenetID]
    );
    res.json({ message: "Üzenet állapota frissítve." });
  } catch (err) {
    console.error("Hiba az üzenet állapotának frissítésekor:", err);
    res
      .status(500)
      .json({ error: "Hiba történt az üzenet állapotának frissítésekor." });
  }
});
app.post("/api/feldolgozva", async (req, res) => {
  const { uzenetID } = req.body;

  if (!uzenetID) {
    return res.status(400).json({ error: "Hiányzó üzenetID." });
  }

  try {
    await pool.execute(
      `UPDATE uzenetek SET allapot = 'megoldva' WHERE uzenetID = ?`,
      [uzenetID]
    );
    res.json({ message: "Üzenet állapota frissítve." });
  } catch (err) {
    console.error("Hiba az üzenet állapotának frissítésekor:", err);
    res
      .status(500)
      .json({ error: "Hiba történt az üzenet állapotának frissítésekor." });
  }
});

// Válasz küldése egy üzenetre
app.post("/api/mentesValasz", async (req, res) => {
  const { uzenetID, valasz } = req.body;

  if (!uzenetID || !valasz) {
    return res.status(400).json({ error: "Hiányzó adatok." });
  }

  try {
    await pool.execute(
      `UPDATE uzenetek SET valasz = ?, allapot = 'megoldva' WHERE uzenetID = ?`,
      [valasz, uzenetID]
    );
    res.json({ message: "Visszajelzés sikeresen mentve." });
  } catch (err) {
    console.error("Hiba a visszajelzés mentésekor:", err);
    res.status(500).json({ error: "Hiba történt a visszajelzés mentésekor." });
  }
});

app.post("/api/torolUzenet", async (req, res) => {
  const { uzenetID } = req.body;

  if (!uzenetID) {
    return res.status(400).json({ error: "Hiányzó üzenetID." });
  }

  try {
    await pool.execute(`DELETE FROM uzenetek WHERE uzenetID = ?`, [uzenetID]);
    res.json({ message: "Üzenet törölve." });
  } catch (err) {
    console.error("Hiba az üzenet törlésekor:", err);
    res.status(500).json({ error: "Hiba történt az üzenet törlésekor." });
  }
});

app.get("/api/szervezetek", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT szervezetID, szervezetNEV, felettesID FROM szervezet`
    );
    res.json(rows);
  } catch (err) {
    console.error("Hiba a szervezetek lekérésekor:", err);
    res.status(500).json({ error: "Nem sikerült a szervezetek lekérése." });
  }
});

app.post("/api/addSzervezet", async (req, res) => {
  const { selectedSzervezet, szervezetNev } = req.body;

  if (!szervezetNev) {
    return res.status(400).json({ error: "Hiányzó szervezet név." });
  }

  try {
    await pool.execute(
      `INSERT INTO szervezet (szervezetNEV, felettesID) VALUES (?, ?)`,
      [szervezetNev, selectedSzervezet || null]
    );
    res.json({ message: "Szervezet sikeresen hozzáadva." });
  } catch (err) {
    console.error("Hiba a szervezet hozzáadásakor:", err);
    res.status(500).json({ error: "Hiba történt a szervezet hozzáadásakor." });
  }
});
app.get("/api/sajat-uzenetek", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Nem vagy bejelentkezve." });
  }

  const felhasznaloID = req.session.user.rvID;

  try {
    const [rows] = await pool.execute(
      `SELECT tartalom, allapot, valasz 
       FROM uzenetek 
       WHERE rvID = ?`,
      [felhasznaloID]
    );

    res.json(rows);
  } catch (err) {
    console.error("Hiba az üzenetek lekérésekor:", err);
    res.status(500).json({ error: "Hiba történt az üzenetek lekérésekor." });
  }
});

//Résztvevő adatainak frissítése
app.put("/api/updateResztvevo/:id", async (req, res) => {
  const id = req.params.id;
  const updates = req.body;

  if (!Object.keys(updates).length) {
    return res.status(400).json({ message: "Nincs adat a frissítéshez." });
  }

  const keys = Object.keys(updates);
  const values = Object.values(updates);
  const setClause = keys.map((key) => `${key} = ?`).join(", ");

  const sql = `UPDATE resztvevok SET ${setClause} WHERE rvID = ?`;

  try {
    await pool.query(sql, [...values, id]);
    res.json({ message: "Sikeres frissítés." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Hiba történt a frissítés során." });
  }
});

// Indítsuk el a szervert
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Backend fut a ${PORT} porton`));
