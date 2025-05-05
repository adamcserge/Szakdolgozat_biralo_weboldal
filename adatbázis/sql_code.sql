/*INSERT INTO szervezet (szervezetNEV)
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



show create table dokumentumok;
show create table resztvevok;
select * from dokumentumok;


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
show create table resztvevok;
ALTER TABLE tema
ADD COLUMN kulsoKonzulens VARCHAR(255) DEFAULT NULL;

CREATE TABLE kulso_konzulens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nev VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL
);

show create table konzulens;
ALTER TABLE tema
ADD COLUMN kulso  DEFAULT NULL;

select * from konzulens;
select *from tema;
select * from resztvevok;
select temaCim from tema where konzulensID=1;

show create table tema;

SELECT rvID, rvNEV AS nev FROM resztvevok WHERE rvID != 1;
select * from konzulens;
select *from biralo;
select * from tema;
update tema set biralva=0 where temaID=3;


UPDATE tema SET biraloID = NULL where temaID =1;
DELETE FROM biralo
WHERE BtemaID = 5;

select * from biralo;

INSERT INTO `biralo` (
  `temaCim`, 
  `temacsoport`, 
  `hallgatoID`, 
  `konzulensID`, 
  `biraloID`, 
  `szervezetID`, 
  `biralva`
) VALUES (
  'Próba', 1, 1, 1, 2, 2, 0);
  
select * from biralo;
INSERT INTO resztvevok (rvEmail, rvFelhasznalonev, rvNEV, rvSzervezetID, rvVegzetseg, rvJelszo)
VALUES ('teszt@example.com', 'tesztfelhasznalo', 'Teszt Név', 1, 1 , 'jelszo123');

show create table biralo;

SELECT t.temaID, t.temaCim
FROM tema t
INNER JOIN biralo b ON t.temaID = b.BtemaID
WHERE b.BbiraloID = 13
  AND b.allapot IN ('felkeres', 'elfogadva');
  


UPDATE tema
SET biralva = 0
WHERE temaID = 11;

select * from biralo;
show create table biralo;


SELECT table_name, constraint_name
FROM information_schema.key_column_usage
WHERE referenced_table_name = 'biralo';

ALTER TABLE biralo DROP FOREIGN KEY biralo_ibfk_1;
ALTER TABLE biralo DROP FOREIGN KEY biralo_ibfk_2;

ALTER TABLE biralo DROP PRIMARY KEY;*/