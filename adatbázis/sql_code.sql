INSERT INTO szervezet (szervezetNEV, felettesID)
VALUES ('Széchenyi István Egyetem');

INSERT INTO szervezet (szervezetNEV, felettesID)
VALUES ('Informatika tanszék','1');

INSERT INTO szervezet (szervezetNEV, felettesID)
VALUES ('Járműgyártás és Technológia Tanszék','1');



INSERT INTO resztvevok (rvSzervezetID, rvNEV, rvVegzetseg, rvEmail, rvFelhasznalonev, rvJelszo)
VALUES ('2','Próba Sándor','1','proba.sandor@gmail.com','Proba Sándor','jelszo123');

INSERT INTO resztvevok (rvSzervezetID, rvNEV, rvVegzetseg, rvEmail, rvFelhasznalonev, rvJelszo)
VALUES ('3','Nagy Ágoston','2','nagy.agoston@gmail.com','Nagy Ágoston','0000');


select * from szervezet;

ALTER TABLE szervezet
MODIFY COLUMN szervezetID INT AUTO_INCREMENT;

SHOW CREATE TABLE szervezet;

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