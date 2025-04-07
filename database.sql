DROP DATABASE IF EXISTS `szakdolgozat_biralo`;
CREATE DATABASE `szakdolgozat_biralo`;
USE `szakdolgozat_biralo`;

CREATE TABLE `hallgato` (
  `hallgatoID` INT PRIMARY KEY,
  `hallgatoNEV` VARCHAR(255),
  `hallgatoNK` VARCHAR(255),
  `hallgatoEMAIL` VARCHAR(255)
);

CREATE TABLE `szervezet` (
  `szervezetID` INT PRIMARY KEY,
  `szervezetNEV` VARCHAR(255),
  `felettesID` INT,
  FOREIGN KEY (`felettesID`) REFERENCES `szervezet` (`szervezetID`)
);

CREATE TABLE `resztvevok` (
  `rvID` INT PRIMARY KEY,
  `rvSzervezetID` INT,
  `rvNEV` VARCHAR(255),
  `rvVegzetseg` INT,
  `rvEmail` VARCHAR(255),
  `rvFelhasznalonev` VARCHAR(255),
  `rvJelszo` VARCHAR(255),
  FOREIGN KEY (`rvSzervezetID`) REFERENCES `szervezet` (`szervezetID`)
);

CREATE TABLE `tema` (
  `temaID` INT PRIMARY KEY,
  `temaCim` VARCHAR(255),
  `temacsoport` INT,
  `hallgatoID` INT,
  `konzulensID` INT,
  `biraloID` INT,
  `szervezetID` INT,
  `biralva` INT,
  FOREIGN KEY (`hallgatoID`) REFERENCES `hallgato` (`hallgatoID`),
  FOREIGN KEY (`konzulensID`) REFERENCES `resztvevok` (`rvID`),
  FOREIGN KEY (`biraloID`) REFERENCES `resztvevok` (`rvID`),
  FOREIGN KEY (`szervezetID`) REFERENCES `szervezet` (`szervezetID`)
);

CREATE TABLE `konzulens` (
  `temaID` INT,
  `konzulensID` INT,
  PRIMARY KEY (`temaID`, `konzulensID`),
  FOREIGN KEY (`temaID`) REFERENCES `tema` (`temaID`),
  FOREIGN KEY (`konzulensID`) REFERENCES `resztvevok` (`rvID`)
);

CREATE TABLE `biralo` (
  `BtemaID` INT,
  `BbiraloID` INT,
  PRIMARY KEY (`BtemaID`, `BbiraloID`),
  FOREIGN KEY (`BtemaID`) REFERENCES `tema` (`temaID`),
  FOREIGN KEY (`BbiraloID`) REFERENCES `resztvevok` (`rvID`)
);

CREATE TABLE `dokumentumok` (
  `dokID` INT PRIMARY KEY,
  `temaID` INT,
  `eleres` VARCHAR(255),
  FOREIGN KEY (`temaID`) REFERENCES `tema` (`temaID`)
);

CREATE TABLE `biralat` (
  `temaID` INT,
  `biraloID` INT,
  `eleres` VARCHAR(255),
  FOREIGN KEY (`temaID`) REFERENCES `tema` (`temaID`),
  FOREIGN KEY (`biraloID`) REFERENCES `resztvevok` (`rvID`)
);
