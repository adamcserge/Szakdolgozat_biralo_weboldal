INSERT INTO szervezet (szervezetNEV)
VALUES ('Soproni Egyetem');



INSERT INTO szervezet (szervezetNEV, felettesID)
VALUES ('Környezet és természettudományi intézet','5');

INSERT INTO szervezet (szervezetNEV, felettesID)
VALUES ('Járműgyártás és Technológia Tanszék','1');



INSERT INTO resztvevok (rvSzervezetID, rvNEV, rvVegzetseg, rvEmail, rvFelhasznalonev, rvJelszo)
VALUES ('2','Próba Sándor','1','proba.sandor@gmail.com','Proba Sándor','jelszo123');

INSERT INTO resztvevok (rvSzervezetID, rvNEV, rvVegzetseg, rvEmail, rvFelhasznalonev, rvJelszo)
VALUES ('3','Nagy Ágoston','2','nagy.agoston@gmail.com','Nagy Ágoston','0000');


select * from szervezet;
select * from resztvevok;


ALTER TABLE szervezet
MODIFY COLUMN szervezetID INT AUTO_INCREMENT;

show create table dokumentumok;
SHOW CREATE TABLE szervezet;
show create table resztvevok;

ALTER TABLE tema DROP FOREIGN KEY _ibfk_1;
ALTER TABLE tema
ADD CONSTRAINT tema_ibfk_1 FOREIGN KEY (hallgatoID) REFERENCES hallgato(hallgatoID);

select * from hallgato;
select * from hallgato where hallgatoID=1;
SELECT * FROM hallgato;

ALTER TABLE szervezet DROP FOREIGN KEY szervezet_ibfk_1;
ALTER TABLE szervezet DROP FOREIGN KEY resztvevok_ibfk_1;

-- Ezután módosítsd a szervezetID-t
ALTER TABLE szervezet
MODIFY COLUMN szervezetID INT AUTO_INCREMENT;

-- Majd add vissza az idegen kulcs kapcsolatot
ALTER TABLE szervezet
ADD CONSTRAINT szervezet_ibfk_1 FOREIGN KEY (szervezetID) REFERENCES szervezet(szervezetID);

-- 1. Típus oszlop hozzáadása INT típusban, alapértelmezett értékkel 0 (nincs meghatározva)
ALTER TABLE dokumentumok
ADD COLUMN tipus INT NOT NULL DEFAULT 0;  -- Alapértelmezett 0

-- 2. Feltöltés dátuma mező hozzáadása
ALTER TABLE dokumentumok
ADD COLUMN feltoltesDatuma TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

show create table dokumentumok;
show create table resztvevok;
select * from dokumentumok;

ALTER TABLE dokumentumok ADD COLUMN eredeti_nev VARCHAR(255);
ALTER TABLE dokumentumok ADD COLUMN feltolto VARCHAR(255);

INSERT INTO `tema` (
  `temaCim`, 
  `temacsoport`, 
  `hallgatoID`, 
  `konzulensID`, 
  `biraloID`, 
  `szervezetID`, 
  `biralva`
) VALUES (
  'Próba', 1, 1, 1, 2, 2, 0);
  
  select * from dokumentumok;
  show create table tema;
  select * from tema;
  
  show create table biralat;
  ALTER TABLE biralo ADD COLUMN allapot ENUM('felkeres', 'elfogadva', 'elutasitva') DEFAULT 'felkeres';

CREATE TABLE ertesites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  felhasznaloID INT,
  szoveg TEXT,
  olvasott BOOLEAN DEFAULT FALSE,
  datum TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
show tables;
show create table resztvevok