-- ==========================================================
-- project-master Database Schema Initialization Script
-- Supports MySQL 5.7, 8.0, 8.4, 9.0+
-- ==========================================================

-- 1. Database Creation
CREATE DATABASE IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `mydb`;

-- 2. Member Table (User Authentication)
CREATE TABLE IF NOT EXISTS `member` (
  `id` VARCHAR(50) NOT NULL COMMENT 'User ID',
  `password` VARCHAR(255) NOT NULL COMMENT 'Bcrypt Hashed Password',
  `name` VARCHAR(50) NOT NULL COMMENT 'User Name',
  `email` VARCHAR(100) NOT NULL COMMENT 'Email Address',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Members Table';

-- 3. Board Table (Posts)
CREATE TABLE IF NOT EXISTS `board` (
  `post_num` INT AUTO_INCREMENT COMMENT 'Post Primary Key',
  `post_id` VARCHAR(50) NOT NULL COMMENT 'Author User ID',
  `post_title` VARCHAR(255) NOT NULL COMMENT 'Post Title',
  `post_content` TEXT NOT NULL COMMENT 'Post Content Body',
  `post_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Created Timestamp',
  `post_hit` INT DEFAULT 0 COMMENT 'View Hit Count',
  PRIMARY KEY (`post_num`),
  KEY `idx_board_post_id` (`post_id`),
  KEY `idx_board_post_time` (`post_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Board Posts Table';

-- 4. Comment Table (Post Comments)
CREATE TABLE IF NOT EXISTS `comment` (
  `comm_num` INT AUTO_INCREMENT COMMENT 'Comment Primary Key',
  `post_num` INT NOT NULL COMMENT 'Referenced Post ID',
  `comm_id` VARCHAR(50) NOT NULL COMMENT 'Author User ID',
  `comm_content` TEXT NOT NULL COMMENT 'Comment Body',
  `comm_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Created Timestamp',
  PRIMARY KEY (`comm_num`),
  KEY `idx_comment_post_num` (`post_num`),
  CONSTRAINT `fk_comment_board` FOREIGN KEY (`post_num`) REFERENCES `board` (`post_num`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Comments Table';
