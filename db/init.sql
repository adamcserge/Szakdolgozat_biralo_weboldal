-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: szakdolgozat_biralo
-- ------------------------------------------------------
-- Server version	8.0.37

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `biralat`
--

DROP TABLE IF EXISTS `biralat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `biralat` (
  `temaID` int DEFAULT NULL,
  `biraloID` int DEFAULT NULL,
  `eleres` varchar(255) DEFAULT NULL,
  KEY `temaID` (`temaID`),
  KEY `biraloID` (`biraloID`),
  CONSTRAINT `biralat_ibfk_1` FOREIGN KEY (`temaID`) REFERENCES `tema` (`temaID`),
  CONSTRAINT `biralat_ibfk_2` FOREIGN KEY (`biraloID`) REFERENCES `resztvevok` (`rvID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `biralat`
--

LOCK TABLES `biralat` WRITE;
/*!40000 ALTER TABLE `biralat` DISABLE KEYS */;
INSERT INTO `biralat` VALUES (11,13,'1746435375482-91708545.docx'),(9,13,'1746444153591-627973888.docx'),(9,13,'1746473223241-869923550.docx'),(12,13,'1747128006850-364920321.docx'),(13,13,'1747138617849-846685734.docx');
/*!40000 ALTER TABLE `biralat` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `biralo`
--

DROP TABLE IF EXISTS `biralo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `biralo` (
  `BtemaID` int NOT NULL,
  `BbiraloID` int NOT NULL,
  `allapot` enum('felkeres','elfogadva','elutasitva') DEFAULT 'felkeres',
  `felkeresID` int NOT NULL AUTO_INCREMENT,
  UNIQUE KEY `felkeresID` (`felkeresID`),
  KEY `biralo_ibfk_1` (`BtemaID`),
  KEY `biralo_ibfk_2` (`BbiraloID`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `biralo`
--

LOCK TABLES `biralo` WRITE;
/*!40000 ALTER TABLE `biralo` DISABLE KEYS */;
INSERT INTO `biralo` VALUES (11,13,'elfogadva',1),(10,13,'elutasitva',2),(9,13,'elfogadva',4),(12,13,'elfogadva',5),(13,13,'elfogadva',6),(14,13,'felkeres',7),(16,13,'elfogadva',8),(17,13,'elfogadva',9),(18,13,'elfogadva',10);
/*!40000 ALTER TABLE `biralo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dokumentumok`
--

DROP TABLE IF EXISTS `dokumentumok`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dokumentumok` (
  `dokID` int NOT NULL AUTO_INCREMENT,
  `temaID` int DEFAULT NULL,
  `eleres` varchar(255) DEFAULT NULL,
  `tipus` int NOT NULL DEFAULT '0',
  `feltoltesDatuma` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `eredeti_nev` varchar(255) DEFAULT NULL,
  `feltolto` varchar(255) DEFAULT NULL,
  `elfogadva` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`dokID`),
  KEY `temaID` (`temaID`),
  CONSTRAINT `dokumentumok_ibfk_1` FOREIGN KEY (`temaID`) REFERENCES `tema` (`temaID`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dokumentumok`
--

LOCK TABLES `dokumentumok` WRITE;
/*!40000 ALTER TABLE `dokumentumok` DISABLE KEYS */;
INSERT INTO `dokumentumok` VALUES (11,11,'1746180930592-950599449.docx',1,'2025-05-02 10:15:30','temakiirolap.docx','13',0),(13,11,'1746435375482-91708545.docx',4,'2025-05-05 08:56:15','biralat.docx','13',0),(15,9,'1746444071018-463677256.docx',1,'2025-05-05 11:21:11','temakiirolap.docx','1',0),(16,9,'1746444153591-627973888.docx',4,'2025-05-05 11:22:33','biralat.docx','13',0),(17,9,'1746472787619-194380734.docx',2,'2025-05-05 19:19:47','Szakdolgozat.docx','1',0),(18,9,'1746473223241-869923550.docx',4,'2025-05-05 19:27:03','biralat.docx','13',0),(19,11,'1746476315071-820038436.docx',2,'2025-05-05 20:18:35','Szakdolgozat.docx','1',0),(22,12,'1746631189808-843844050.docx',1,'2025-05-07 15:19:49','temakiirolap.docx','1',0),(23,12,'1746631206558-165470347.docx',2,'2025-05-07 15:20:06','Szakdolgozat.docx','1',0),(24,12,'1746692470627-930804329.docx',3,'2025-05-08 08:21:10','titoktartÃ¡si nyilatkozat.docx','1',0),(27,12,'1746705458844-373286973.docx',3,'2025-05-08 11:57:38','titoktartÃ¡si nyilatkozat.docx','13',0),(28,13,'1747127077514-55434326.docx',1,'2025-05-13 09:04:37','temakiirolap.docx','1',0),(29,13,'1747127300380-155891826.docx',2,'2025-05-13 09:08:20','Szakdolgozat.docx','1',0),(30,14,'1747127334023-899718143.docx',1,'2025-05-13 09:08:54','temakiirolap.docx','1',0),(31,14,'1747127344431-245713472.docx',2,'2025-05-13 09:09:04','Szakdolgozat.docx','1',0),(32,12,'1747128006850-364920321.docx',4,'2025-05-13 09:20:06','biralat.docx','13',0),(33,16,'1747132703711-496441616.docx',3,'2025-05-13 10:38:23','titoktartasi nyilatkozat.docx','1',0),(34,16,'1747132734565-546796282.docx',1,'2025-05-13 10:38:54','temakiirolap.docx','1',0),(35,16,'1747132744769-933365834.docx',2,'2025-05-13 10:39:04','Szakdolgozat.docx','1',0),(36,13,'1747138617849-846685734.docx',4,'2025-05-13 12:16:57','biralat.docx','13',0),(38,17,'1747149582899-38483543.docx',2,'2025-05-13 15:19:42','Szakdolgozat.docx','1',0),(39,17,'1747149642645-808918864.docx',1,'2025-05-13 15:20:42','temakiirolap.docx','1',0),(40,18,'1747219627475-749338922.docx',2,'2025-05-14 10:47:07','Szakdolgozat.docx','1',0),(41,18,'1747219638990-98225404.docx',1,'2025-05-14 10:47:18','temakiirolap.docx','1',0),(42,19,'1747237503062-265710115.docx',1,'2025-05-14 15:45:03','temakiirolap.docx','1',0),(43,19,'1747237515479-64836730.docx',2,'2025-05-14 15:45:15','Szakdolgozat.docx','1',0);
/*!40000 ALTER TABLE `dokumentumok` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ertesites`
--

DROP TABLE IF EXISTS `ertesites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ertesites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `felhasznaloID` int DEFAULT NULL,
  `szoveg` text,
  `olvasott` tinyint(1) DEFAULT '0',
  `datum` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ertesites`
--

LOCK TABLES `ertesites` WRITE;
/*!40000 ALTER TABLE `ertesites` DISABLE KEYS */;
/*!40000 ALTER TABLE `ertesites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hallgato`
--

DROP TABLE IF EXISTS `hallgato`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hallgato` (
  `hallgatoID` int NOT NULL AUTO_INCREMENT,
  `hallgatoNEV` varchar(255) DEFAULT NULL,
  `hallgatoNK` varchar(255) DEFAULT NULL,
  `hallgatoEMAIL` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`hallgatoID`),
  UNIQUE KEY `hallgatoNK` (`hallgatoNK`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hallgato`
--

LOCK TABLES `hallgato` WRITE;
/*!40000 ALTER TABLE `hallgato` DISABLE KEYS */;
INSERT INTO `hallgato` VALUES (1,'Teszt Elek','C3D5QR','teszt.elek@gmail.com'),(2,'Kis Ágota','QR3MNP','kis.agota@gmail.com'),(3,'Nagy Lajos','GT32BQ','nagy.lajos@gmail.com');
/*!40000 ALTER TABLE `hallgato` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `konzulens`
--

DROP TABLE IF EXISTS `konzulens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `konzulens` (
  `temaID` int NOT NULL,
  `konzulensID` int NOT NULL,
  PRIMARY KEY (`temaID`,`konzulensID`),
  KEY `konzulensID` (`konzulensID`),
  CONSTRAINT `konzulens_ibfk_1` FOREIGN KEY (`temaID`) REFERENCES `tema` (`temaID`),
  CONSTRAINT `konzulens_ibfk_2` FOREIGN KEY (`konzulensID`) REFERENCES `resztvevok` (`rvID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `konzulens`
--

LOCK TABLES `konzulens` WRITE;
/*!40000 ALTER TABLE `konzulens` DISABLE KEYS */;
INSERT INTO `konzulens` VALUES (9,1),(10,1),(11,1),(12,1),(13,1),(14,1),(15,1),(16,1),(17,1),(18,1),(19,1),(10,2),(11,2),(13,2),(12,17);
/*!40000 ALTER TABLE `konzulens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resztvevok`
--

DROP TABLE IF EXISTS `resztvevok`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resztvevok` (
  `rvID` int NOT NULL AUTO_INCREMENT,
  `rvSzervezetID` int DEFAULT NULL,
  `rvNEV` varchar(255) DEFAULT NULL,
  `rvVegzetseg` int DEFAULT NULL,
  `rvEmail` varchar(255) DEFAULT NULL,
  `rvFelhasznalonev` varchar(255) DEFAULT NULL,
  `rvJelszo` varchar(255) DEFAULT NULL,
  `isAdmin` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`rvID`),
  KEY `rvSzervezetID` (`rvSzervezetID`),
  CONSTRAINT `resztvevok_ibfk_1` FOREIGN KEY (`rvSzervezetID`) REFERENCES `szervezet` (`szervezetID`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resztvevok`
--

LOCK TABLES `resztvevok` WRITE;
/*!40000 ALTER TABLE `resztvevok` DISABLE KEYS */;
INSERT INTO `resztvevok` VALUES (1,2,'Próba Sándor',1,'proba.sandor@gmail.com','Proba Sándor','jelszo123',1),(2,3,'Nagy Ágoston',2,'nagy.agoston@gmail.com','Nagy Ágoston','0000',0),(10,2,'Próba Elek',1,'proba.elek@gamil.com','Próba Elek','12345',0),(11,2,'Kovács Gyula',2,'kovacs.gyula@gmail.com','Kovi','12345',0),(13,3,'Benedek Elek',3,'benedek.elek@gmail.com','Beni','12345',0),(17,11,'Kis György',1,'kis.gyorgy@gmail.com','Gyurika','0000',0);
/*!40000 ALTER TABLE `resztvevok` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `szervezet`
--

DROP TABLE IF EXISTS `szervezet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `szervezet` (
  `szervezetID` int NOT NULL AUTO_INCREMENT,
  `szervezetNEV` varchar(255) DEFAULT NULL,
  `felettesID` int DEFAULT NULL,
  PRIMARY KEY (`szervezetID`),
  KEY `felettesID` (`felettesID`),
  CONSTRAINT `szervezet_ibfk_1` FOREIGN KEY (`felettesID`) REFERENCES `szervezet` (`szervezetID`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `szervezet`
--

LOCK TABLES `szervezet` WRITE;
/*!40000 ALTER TABLE `szervezet` DISABLE KEYS */;
INSERT INTO `szervezet` VALUES (1,'Széchenyi Istán Egyetem',NULL),(2,'Informatika tanszék',1),(3,'Járműgyártás és Technológia Tanszék',1),(4,'Soproni Egyetem',NULL),(5,'Erdőmérnöki Kar',4),(7,'Környezet és természettudományi intézet',5),(11,'Járműgyártási Labor',3);
/*!40000 ALTER TABLE `szervezet` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tema`
--

DROP TABLE IF EXISTS `tema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tema` (
  `temaID` int NOT NULL AUTO_INCREMENT,
  `temaCim` varchar(255) DEFAULT NULL,
  `temacsoport` int DEFAULT NULL,
  `hallgatoID` int DEFAULT NULL,
  `konzulensID` int DEFAULT NULL,
  `biraloID` int DEFAULT NULL,
  `szervezetID` int DEFAULT NULL,
  `biralva` int DEFAULT NULL,
  `szabadBiralat` int DEFAULT '0',
  PRIMARY KEY (`temaID`),
  KEY `hallgatoID` (`hallgatoID`),
  KEY `konzulensID` (`konzulensID`),
  KEY `biraloID` (`biraloID`),
  KEY `szervezetID` (`szervezetID`),
  CONSTRAINT `tema_ibfk_1` FOREIGN KEY (`hallgatoID`) REFERENCES `hallgato` (`hallgatoID`),
  CONSTRAINT `tema_ibfk_2` FOREIGN KEY (`konzulensID`) REFERENCES `resztvevok` (`rvID`),
  CONSTRAINT `tema_ibfk_3` FOREIGN KEY (`biraloID`) REFERENCES `resztvevok` (`rvID`),
  CONSTRAINT `tema_ibfk_4` FOREIGN KEY (`szervezetID`) REFERENCES `szervezet` (`szervezetID`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tema`
--

LOCK TABLES `tema` WRITE;
/*!40000 ALTER TABLE `tema` DISABLE KEYS */;
INSERT INTO `tema` VALUES (1,'Próba',1,1,1,NULL,2,0,0),(2,'valami',NULL,2,1,NULL,2,0,0),(3,'ezaz',1,1,1,NULL,2,0,0),(4,'jolesz',2,1,1,NULL,2,0,0),(5,'ez',NULL,2,1,NULL,1,0,0),(6,'Joféle',NULL,1,1,NULL,2,0,0),(8,'asdaf',NULL,1,1,NULL,5,0,0),(9,'asdas',NULL,1,1,13,3,3,0),(10,'1234',NULL,1,1,NULL,2,0,0),(11,'ö98765432',NULL,1,2,13,3,3,0),(12,'A virágok virágzása',NULL,2,1,13,7,3,0),(13,'Természetvédelmi tájak',NULL,3,1,13,7,3,0),(14,'Raktárrendszer fejlesztése',NULL,1,1,NULL,2,1,0),(15,'Elektromos autók ',NULL,2,1,NULL,11,0,0),(16,'Managment rendszer tervezése',NULL,2,1,13,2,2,0),(17,'Kódgenerátor használata szabadságnyilvántartó rendszer készítéshez',NULL,3,1,13,3,2,0),(18,'Informatikai rendszerek fejlesztése',NULL,3,1,13,2,2,1),(19,'Környezetvédelmi tájak jelentősége',NULL,1,1,NULL,7,0,0);
/*!40000 ALTER TABLE `tema` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `uzenetek`
--

DROP TABLE IF EXISTS `uzenetek`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uzenetek` (
  `uzenetID` int NOT NULL AUTO_INCREMENT,
  `rvID` int NOT NULL,
  `tipus` enum('Hibás adat','Új adat felvétel','Hibaelhárítás','Változtatás','Egyéb') NOT NULL,
  `tartalom` text NOT NULL,
  `datum` datetime DEFAULT CURRENT_TIMESTAMP,
  `allapot` enum('uj','folyamatban','megoldva') DEFAULT 'uj',
  `allapot_modosito_id` int DEFAULT NULL,
  `valasz` text,
  PRIMARY KEY (`uzenetID`),
  KEY `rvID` (`rvID`),
  CONSTRAINT `uzenetek_ibfk_1` FOREIGN KEY (`rvID`) REFERENCES `resztvevok` (`rvID`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `uzenetek`
--

LOCK TABLES `uzenetek` WRITE;
/*!40000 ALTER TABLE `uzenetek` DISABLE KEYS */;
INSERT INTO `uzenetek` VALUES (5,2,'Új adat felvétel','Szertném felvenni a Szegedi egyetemet','2025-05-13 14:31:22','uj',NULL,NULL),(6,13,'Változtatás','Szeretném megváltoztatni a felhasználó nevemet Benedekre','2025-05-13 14:40:53','megoldva',NULL,'Sikeresen megváltoztattam a felhsználónevedet'),(7,13,'Változtatás','Szeretnék admin lenni','2025-05-13 14:41:46','folyamatban',NULL,NULL),(8,13,'Új adat felvétel','Szeretném ha lehetne választani a szegedi egyetemet is','2025-05-13 14:43:11','uj',NULL,NULL),(9,13,'Új adat felvétel','Szeretném felvenni a szegedi egyetemhez a az Orvostudományi kart','2025-05-16 15:05:06','uj',NULL,NULL);
/*!40000 ALTER TABLE `uzenetek` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-16 17:52:14
