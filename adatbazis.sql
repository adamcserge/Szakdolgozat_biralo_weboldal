DROP DATABASE IF EXISTS  `szakdolgozat-biralo` ;
CREATE DATABASE  `szakdolgozat-biralo` ;
USE  `szakdolgozat-biralo` ;

CREATE TABLE  hallgato  (
hallgatoID  integer PRIMARY KEY,
hallgatoNEV  varchar(100),
hallgatoNK  varchar(6),
hallgatoEMAIL  varchar(100)
);

CREATE TABLE  tema  (
temaID  integer PRIMARY KEY,
hallgatoID  integer,
konzulensID  integer,
biraloID  integer,
egyetemID  integer,
biralva  bit
);

CREATE TABLE  egyetem  (
egyetemID  integer PRIMARY KEY,
egyetemNEV  varchar(200),
felettesID  integer
);

CREATE TABLE  resztvevok  (
rvID  integer PRIMARY KEY,
rvEgyetemID  integer,
rvNEV  varchar(100)
);

CREATE TABLE  konzulens  (
temaID  integer,
konzulensID  integer
);

CREATE INDEX idx_temaID ON tema(temaID);
ALTER TABLE  konzulens  ADD FOREIGN KEY ( temaID ) REFERENCES  tema  ( temaID );

CREATE INDEX idx_rvID ON resztvevok(rvID);
ALTER TABLE  konzulens  ADD FOREIGN KEY ( konzulensID ) REFERENCES  resztvevok  ( rvID );

CREATE INDEX idx_felettesID ON egyetem(felettesID);
ALTER TABLE egyetem  ADD FOREIGN KEY (egyetemID) REFERENCES egyetem(felettesID);

CREATE INDEX idx_hallgatoID ON tema(hallgatoID);
ALTER TABLE  hallgato  ADD FOREIGN KEY ( hallgatoID ) REFERENCES  tema  ( hallgatoID );

CREATE INDEX idx_egyetemID ON tema(egyetemID);
ALTER TABLE  egyetem  ADD FOREIGN KEY ( egyetemID ) REFERENCES  tema  ( egyetemID );

CREATE INDEX idx_rvEgyetemID ON resztvevok(rvEgyetemID);
ALTER TABLE  egyetem  ADD FOREIGN KEY ( egyetemID ) REFERENCES  resztvevok  ( rvEgyetemID );

CREATE INDEX idx_konzulensID ON tema(konzulensID);
ALTER TABLE  resztvevok  ADD FOREIGN KEY ( rvID ) REFERENCES  tema  ( konzulensID );

CREATE INDEX idx_biraloID ON tema(biraloID);
ALTER TABLE  resztvevok  ADD FOREIGN KEY ( rvID ) REFERENCES  tema  ( biraloID );
