-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 28, 2025 at 09:01 AM
-- Server version: 8.0.44-0ubuntu0.24.04.1
-- PHP Version: 8.3.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `situtur`
--

-- --------------------------------------------------------

--
-- Table structure for table `Mandor`
--

CREATE TABLE `Mandor` (
  `ID` int NOT NULL,
  `Nama_Mandor` varchar(255) NOT NULL,
  `No_Hp` int NOT NULL,
  `Id_User` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Proyek`
--

CREATE TABLE `Proyek` (
  `ID` int NOT NULL,
  `Id_User` int NOT NULL,
  `Nama_Proyek` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `query_actions`
--

CREATE TABLE `query_actions` (
  `id` bigint UNSIGNED NOT NULL,
  `method` enum('select','insert','update','delete') COLLATE utf8mb4_general_ci NOT NULL,
  `table_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `columns` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `whereClause` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `params` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `ambiguity_level` enum('low','medium','high') COLLATE utf8mb4_general_ci NOT NULL,
  `confidence` decimal(5,4) NOT NULL DEFAULT '0.0000',
  `matched_task_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `reason` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ;

--
-- Dumping data for table `query_actions`
--

INSERT INTO `query_actions` (`id`, `method`, `table_name`, `columns`, `whereClause`, `params`, `ambiguity_level`, `confidence`, `matched_task_ids`, `reason`, `created_at`) VALUES
(1, 'update', 'work', '[\"progress\"]', '[\"work_name\"]', '[90,\"programming\"]', 'low', 0.9500, '[1]', 'Update progress task programming', '2025-12-22 12:31:48');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id_user` int NOT NULL,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `nama_depan` varchar(255) DEFAULT NULL,
  `nama_belakang` varchar(255) DEFAULT NULL,
  `role` enum('admin','user') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id_user`, `username`, `password`, `email`, `nama_depan`, `nama_belakang`, `role`) VALUES
(1, 'makanbakso', 'c3b1b22a2c9ec383a2d0f9035ae39790327ef8177899b9ef34e9cd18f71ac5bb', 'makanbakso@gmail.com', 'makan', 'bakso', 'user');

-- --------------------------------------------------------

--
-- Table structure for table `work`
--

CREATE TABLE `work` (
  `id` int NOT NULL,
  `id_Proyek` int NOT NULL,
  `work_name` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `Current_task` int DEFAULT NULL,
  `Finished_Task` int NOT NULL,
  `progress` int NOT NULL,
  `status` varchar(200) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `workers`
--

CREATE TABLE `workers` (
  `id` int NOT NULL,
  `worker_name` varchar(165) COLLATE utf8mb4_general_ci NOT NULL,
  `phone_number` varchar(100) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Mandor`
--
ALTER TABLE `Mandor`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `nohp` (`No_Hp`),
  ADD UNIQUE KEY `Id_User` (`Id_User`);

--
-- Indexes for table `Proyek`
--
ALTER TABLE `Proyek`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `UNIQUE` (`Nama_Proyek`),
  ADD KEY `ID_User to ID_Proyek` (`Id_User`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id_user`);

--
-- Indexes for table `work`
--
ALTER TABLE `work`
  ADD PRIMARY KEY (`id`),
  ADD KEY `relasi` (`Current_task`,`Finished_Task`) USING BTREE,
  ADD KEY `finished_task to id_workers` (`Finished_Task`),
  ADD KEY `id_proyek to proyek.id` (`id_Proyek`);

--
-- Indexes for table `workers`
--
ALTER TABLE `workers`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Mandor`
--
ALTER TABLE `Mandor`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Proyek`
--
ALTER TABLE `Proyek`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id_user` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `work`
--
ALTER TABLE `work`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `workers`
--
ALTER TABLE `workers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Mandor`
--
ALTER TABLE `Mandor`
  ADD CONSTRAINT `Mandor_ibfk_1` FOREIGN KEY (`Id_User`) REFERENCES `user` (`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Proyek`
--
ALTER TABLE `Proyek`
  ADD CONSTRAINT `ID_User to ID_Proyek` FOREIGN KEY (`Id_User`) REFERENCES `user` (`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `work`
--
ALTER TABLE `work`
  ADD CONSTRAINT `current_task to id_workers` FOREIGN KEY (`Current_task`) REFERENCES `workers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `finished_task to id_workers` FOREIGN KEY (`Finished_Task`) REFERENCES `workers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `id_proyek to proyek.id` FOREIGN KEY (`id_Proyek`) REFERENCES `Proyek` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
