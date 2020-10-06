-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Oct 06, 2020 at 06:30 AM
-- Server version: 10.4.13-MariaDB
-- PHP Version: 7.4.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `lilplaytime`
--

-- --------------------------------------------------------

--
-- Table structure for table `ns_documents`
--

CREATE TABLE `ns_documents` (
  `id` int(11) NOT NULL,
  `content` text CHARACTER SET utf32 COLLATE utf32_unicode_ci NOT NULL,
  `path` varchar(128) NOT NULL,
  `updateDate` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `ns_documents`
--

INSERT INTO `ns_documents` (`id`, `content`, `path`, `updateDate`) VALUES
(3, '# More\\n\\n[index](index.md)\\n', 'more.md', '2020-10-05'),
(4, '# Index\\n\\n[more](more.md)\\n\\ngoing back and forth\\n[general/index](general/index.md)', 'index.md', '2020-10-05'),
(5, '# General/index\\n\\nhere we go\\n\\n[more](../more.md)\\n\\n', 'general/index.md', '2020-10-05');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ns_documents`
--
ALTER TABLE `ns_documents`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ns_documents`
--
ALTER TABLE `ns_documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;