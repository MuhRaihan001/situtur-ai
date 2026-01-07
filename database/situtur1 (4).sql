-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 07, 2026 at 02:18 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `situtur1`
--

-- --------------------------------------------------------

--
-- Table structure for table `ai_conversations`
--

CREATE TABLE `ai_conversations` (
  `id` int(11) NOT NULL,
  `phone_number` varchar(100) NOT NULL,
  `role` enum('user','ai') NOT NULL,
  `message` text NOT NULL,
  `context_type` varchar(50) DEFAULT 'general',
  `related_id` int(11) DEFAULT NULL,
  `created_at` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `table_name` varchar(50) NOT NULL,
  `record_id` varchar(50) DEFAULT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `table_name`, `record_id`, `old_values`, `new_values`, `ip_address`, `user_agent`, `created_at`) VALUES
(1, NULL, 'SYSTEM_UPDATE', 'proyek', '6', '{\"status\":\"Pending\"}', '{\"status\":\"In Progress\"}', NULL, NULL, '2026-01-04 23:46:36'),
(2, 3, 'CREATE', 'proyek', '7', NULL, '{\"name\":\"test1\",\"id_user\":3,\"due_date\":\"2026-01-08\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-05 00:11:49'),
(3, NULL, 'SYSTEM_UPDATE', 'proyek', '7', '{\"status\":\"Pending\"}', '{\"status\":\"In Progress\"}', NULL, NULL, '2026-01-05 00:12:18'),
(4, 3, 'CREATE', 'proyek', '8', NULL, '{\"name\":\"test2\",\"id_user\":3,\"due_date\":\"2026-01-08\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-05 06:18:36'),
(5, 3, 'CREATE', 'proyek', '9', NULL, '{\"name\":\"test3\",\"id_user\":3,\"due_date\":\"2026-01-09\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-05 07:16:36'),
(6, NULL, 'SYSTEM_UPDATE', 'proyek', '8', '{\"status\":\"Pending\"}', '{\"status\":\"In Progress\"}', NULL, NULL, '2026-01-05 08:02:46'),
(7, NULL, 'SYSTEM_UPDATE', 'proyek', '9', '{\"status\":\"Pending\"}', '{\"status\":\"In Progress\"}', NULL, NULL, '2026-01-05 08:03:00');

-- --------------------------------------------------------

--
-- Table structure for table `mandor`
--

CREATE TABLE `mandor` (
  `ID` int(11) NOT NULL,
  `Nama_Mandor` varchar(255) NOT NULL,
  `No_Hp` int(11) NOT NULL,
  `Id_User` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `proyek`
--

CREATE TABLE `proyek` (
  `ID` int(11) NOT NULL,
  `Id_User` int(11) NOT NULL,
  `Nama_Proyek` varchar(255) NOT NULL,
  `status` enum('Pending','In Progress','Compleated','Failed') NOT NULL DEFAULT 'Pending',
  `due_date` bigint(20) DEFAULT NULL,
  `created_at` bigint(20) NOT NULL DEFAULT (unix_timestamp() * 1000),
  `finished_at` bigint(20) DEFAULT NULL,
  `progress` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `proyek`
--

INSERT INTO `proyek` (`ID`, `Id_User`, `Nama_Proyek`, `status`, `due_date`, `created_at`, `finished_at`, `progress`) VALUES
(7, 3, 'test1', 'Compleated', 1767830400000, 1767571909000, 1767571909000, 100),
(8, 3, 'test2', 'Compleated', 1767830400000, 1767593916000, NULL, 100),
(9, 3, 'test3', 'In Progress', 1767916800000, 1767597396000, NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `query_actions`
--

CREATE TABLE `query_actions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `method` enum('select','insert','update','delete') NOT NULL,
  `table_name` varchar(100) NOT NULL,
  `columns` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `whereClause` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `params` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `ambiguity_level` enum('low','medium','high') NOT NULL,
  `confidence` decimal(5,4) NOT NULL DEFAULT 0.0000,
  `matched_task_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `reason` varchar(255) NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` bigint(20) NOT NULL DEFAULT (unix_timestamp() * 1000)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id_user` int(11) NOT NULL,
  `username` varchar(255) DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `nama_depan` varchar(255) DEFAULT NULL,
  `nama_belakang` varchar(255) DEFAULT NULL,
  `login_terakhir` datetime DEFAULT NULL,
  `role` enum('admin','user') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id_user`, `username`, `email`, `password`, `nama_depan`, `nama_belakang`, `login_terakhir`, `role`) VALUES
(2, 'Angga', 'angga@gmail.com', '4b7e1e70394781649617b5b05d2a1c81e82edd1e70d13ce96f5b8411c8c99965', 'Makan', ' coto', NULL, 'user'),
(3, 'makanbakso', 'makanbakso@gmail.com', '8ef9b7f6a318760d2089cd5b19d6a6877a8f03e68e94576a9c122b8224b777f0', 'makan', 'bakso', NULL, 'user'),
(4, 'TsumuX', 'muhraihannurtaufiq@gmail.com', '51552951fd6b3946075a495d02b62bacf7046eb5c77079a7a3830a0c1bcb1a39', 'Raihan', 'Taufiq', NULL, 'user');

-- --------------------------------------------------------

--
-- Table structure for table `work`
--

CREATE TABLE `work` (
  `id` int(10) UNSIGNED NOT NULL,
  `work_name` varchar(150) NOT NULL,
  `progress` int(11) NOT NULL DEFAULT 0,
  `status` enum('pending','in_progress','completed','failed') NOT NULL DEFAULT 'pending',
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `started_at` bigint(20) DEFAULT NULL,
  `finished_at` bigint(20) DEFAULT NULL,
  `deadline` bigint(20) DEFAULT NULL,
  `created_at` bigint(20) NOT NULL DEFAULT (unix_timestamp() * 1000),
  `id_Proyek` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `work`
--

INSERT INTO `work` (`id`, `work_name`, `progress`, `status`, `priority`, `started_at`, `finished_at`, `deadline`, `created_at`, `id_Proyek`) VALUES
(8, 'test1', 100, 'completed', 'medium', 1767571938662, 1767594415761, 1767744000000, 1767571938000, 7),
(9, 'test2', 100, 'completed', 'medium', 1767577308935, 1767577317409, 1767916800000, 1767577308000, 7),
(10, 'test1', 100, 'completed', 'medium', 1767600166587, 1767596624925, 1767744000000, 1767593926000, 8),
(12, 'test', 90, 'in_progress', 'medium', 1767600180556, NULL, 1767657600000, 1767597976000, 9);

-- --------------------------------------------------------

--
-- Table structure for table `workers`
--

CREATE TABLE `workers` (
  `id` int(11) NOT NULL,
  `worker_name` varchar(165) NOT NULL,
  `phone_number` varchar(100) NOT NULL,
  `current_task` int(10) UNSIGNED DEFAULT NULL,
  `finished_task` int(10) UNSIGNED DEFAULT NULL,
  `status` enum('Active','Not active','','') NOT NULL DEFAULT 'Active',
  `created_at` bigint(20) NOT NULL DEFAULT (unix_timestamp() * 1000)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `workers`
--

INSERT INTO `workers` (`id`, `worker_name`, `phone_number`, `current_task`, `finished_task`, `status`, `created_at`) VALUES
(4, 'angga', '6289527529107@c.us', 12, NULL, 'Active', 1767576817000),
(5, 'lasains', '6289503689943@c.us', 10, NULL, 'Active', 1767598022000);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ai_conversations`
--
ALTER TABLE `ai_conversations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_action` (`user_id`,`action`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `mandor`
--
ALTER TABLE `mandor`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `proyek`
--
ALTER TABLE `proyek`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `idx_user_id` (`Id_User`);

--
-- Indexes for table `query_actions`
--
ALTER TABLE `query_actions`
  ADD PRIMARY KEY (`id`);

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
  ADD KEY `idx_proyek_id` (`id_Proyek`);

--
-- Indexes for table `workers`
--
ALTER TABLE `workers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `current_task` (`current_task`,`finished_task`),
  ADD KEY `fhinished_task to work` (`finished_task`),
  ADD KEY `idx_status` (`status`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ai_conversations`
--
ALTER TABLE `ai_conversations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `mandor`
--
ALTER TABLE `mandor`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `proyek`
--
ALTER TABLE `proyek`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `query_actions`
--
ALTER TABLE `query_actions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `work`
--
ALTER TABLE `work`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `workers`
--
ALTER TABLE `workers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `proyek`
--
ALTER TABLE `proyek`
  ADD CONSTRAINT `id_proyek to id_user` FOREIGN KEY (`Id_User`) REFERENCES `user` (`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `work`
--
ALTER TABLE `work`
  ADD CONSTRAINT `id_proyek in work to id_proyek in proyek` FOREIGN KEY (`id_Proyek`) REFERENCES `proyek` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `workers`
--
ALTER TABLE `workers`
  ADD CONSTRAINT `current_task to work ` FOREIGN KEY (`current_task`) REFERENCES `work` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fhinished_task to work` FOREIGN KEY (`finished_task`) REFERENCES `work` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
