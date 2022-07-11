-- MySQL dump 10.13  Distrib 8.0.29, for Linux (x86_64)
--
-- Host: 1.2.3.4    Database: VitePay
-- ------------------------------------------------------
-- Server version	5.5.5-10.3.32-MariaDB-0ubuntu0.20.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `expiredTransactions`
--

DROP TABLE IF EXISTS `expiredTransactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expiredTransactions` (
  `merchantName` text DEFAULT NULL,
  `txDescription` text DEFAULT NULL,
  `txToken` varchar(100) DEFAULT NULL,
  `txAmount` text DEFAULT NULL,
  `mmSeed` text DEFAULT NULL,
  `mmAddress` varchar(100) DEFAULT NULL,
  `txMemo` text DEFAULT NULL,
  `txID` varchar(100) DEFAULT NULL,
  `txDestination` varchar(100) DEFAULT NULL,
  `txStatus` varchar(100) DEFAULT NULL,
  `txHash` varchar(100) DEFAULT NULL,
  `redirectURL` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expiredTransactions`
--

LOCK TABLES `expiredTransactions` WRITE;
/*!40000 ALTER TABLE `expiredTransactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `expiredTransactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `merchants`
--

DROP TABLE IF EXISTS `merchants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `merchants` (
  `name` varchar(100) DEFAULT NULL,
  `apikey` varchar(100) DEFAULT NULL,
  `verified` varchar(100) DEFAULT NULL,
  `css` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `merchants`
--

LOCK TABLES `merchants` WRITE;
/*!40000 ALTER TABLE `merchants` DISABLE KEYS */;
/*!40000 ALTER TABLE `merchants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `merchantName` text DEFAULT NULL,
  `txDescription` text DEFAULT NULL,
  `txToken` varchar(100) DEFAULT NULL,
  `txAmount` text DEFAULT NULL,
  `mmSeed` text DEFAULT NULL,
  `mmAddress` varchar(100) DEFAULT NULL,
  `txMemo` text DEFAULT NULL,
  `txDeadline` varchar(100) DEFAULT NULL,
  `txID` varchar(100) DEFAULT NULL,
  `txDestination` varchar(100) DEFAULT NULL,
  `merchantVerified` varchar(100) DEFAULT NULL,
  `txHash` varchar(100) DEFAULT NULL,
  `redirectURL` text DEFAULT NULL,
  `css` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'VitePay'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-06-28 15:12:07
