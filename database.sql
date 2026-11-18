-- =============================================================================
-- STORE RATING MANAGEMENT SYSTEM DATABASE SCHEMA & SEED DATA
-- Database Name: store_rating_db
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `store_rating_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `store_rating_db`;

-- -----------------------------------------------------------------------------
-- Table: users
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `ratings`;
DROP TABLE IF EXISTS `stores`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(60) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `address` VARCHAR(400) NOT NULL,
  `role` ENUM('admin', 'user', 'store_owner') NOT NULL DEFAULT 'user',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table: stores
-- -----------------------------------------------------------------------------
CREATE TABLE `stores` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(60) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `address` VARCHAR(400) NOT NULL,
  `owner_id` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_stores_owner` (`owner_id`),
  INDEX `idx_stores_name` (`name`),
  CONSTRAINT `fk_stores_owner` FOREIGN KEY (`owner_id`) 
    REFERENCES `users` (`id`) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table: ratings
-- -----------------------------------------------------------------------------
CREATE TABLE `ratings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `store_id` INT NOT NULL,
  `rating` TINYINT NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_ratings_store` (`store_id`),
  INDEX `idx_ratings_user` (`user_id`),
  CONSTRAINT `fk_ratings_user` FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  CONSTRAINT `fk_ratings_store` FOREIGN KEY (`store_id`) 
    REFERENCES `stores` (`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  CONSTRAINT `unique_user_store_rating` UNIQUE (`user_id`, `store_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Seed Data: Users
-- Default Passwords (all 8-16 chars, 1 uppercase, 1 special char):
--   Admin:       AdminPass123!
--   Store Owner: OwnerPass123!
--   User:        UserPass123!
-- -----------------------------------------------------------------------------
INSERT INTO `users` (`id`, `name`, `email`, `password`, `address`, `role`) VALUES
(1, 'System Administrator Master', 'admin@storerating.com', '$2a$10$jCsyLdOQHMlfE3miX4D0/.AMpSWwltdtsri.79Y19H1bo67t1NDqG', '100 Innovation Boulevard, Tech City, TC 94016', 'admin'),
(2, 'Store Owner Alice Cooper', 'alice.owner@shopvista.com', '$2a$10$M3hlR7H43s0w3WDYo17Jlu/cQpTV1vVhx5X.f2Xl3FpRB0O5f9vpG', '204 Market Street, Downtown, DT 10001', 'store_owner'),
(3, 'Store Owner Bob Henderson', 'bob.owner@electrohub.com', '$2a$10$M3hlR7H43s0w3WDYo17Jlu/cQpTV1vVhx5X.f2Xl3FpRB0O5f9vpG', '512 Electronics Avenue, Silicon Plaza, SP 95054', 'store_owner'),
(4, 'Johnathan Doe Regular User', 'johnathan.doe@example.com', '$2a$10$tIxygeZTFoTy7u3TDim.g.c/qsKd.LcdXnQTxyp5w9lKoSpOB/Sca', '123 Maple Street, Green Valley, GV 23456', 'user'),
(5, 'Jane Smith Certified Shopper', 'jane.smith@example.com', '$2a$10$tIxygeZTFoTy7u3TDim.g.c/qsKd.LcdXnQTxyp5w9lKoSpOB/Sca', '456 Oak Avenue, Riverdale, RD 78910', 'user'),
(6, 'Michael Robert Johnson Doe', 'michael.r@example.com', '$2a$10$tIxygeZTFoTy7u3TDim.g.c/qsKd.LcdXnQTxyp5w9lKoSpOB/Sca', '789 Pine Road, Highland Park, HP 34567', 'user');

-- -----------------------------------------------------------------------------
-- Seed Data: Stores
-- -----------------------------------------------------------------------------
INSERT INTO `stores` (`id`, `name`, `email`, `address`, `owner_id`) VALUES
(1, 'ShopVista Supermart Global', 'contact@shopvista.com', '204 Market Street, Downtown, DT 10001', 2),
(2, 'ElectroHub Gadget Center Inc', 'support@electrohub.com', '512 Electronics Avenue, Silicon Plaza, SP 95054', 3),
(3, 'FreshOrganic Healthy Grocers', 'hello@freshorganic.com', '888 Green Horizon Way, Meadowlands, ML 45678', NULL);

-- -----------------------------------------------------------------------------
-- Seed Data: Ratings
-- -----------------------------------------------------------------------------
INSERT INTO `ratings` (`id`, `user_id`, `store_id`, `rating`) VALUES
(1, 4, 1, 5),
(2, 5, 1, 4),
(3, 6, 2, 5),
(4, 4, 2, 3),
(5, 5, 3, 4);

-- Reset AUTO_INCREMENT values
ALTER TABLE `users` AUTO_INCREMENT = 7;
ALTER TABLE `stores` AUTO_INCREMENT = 4;
ALTER TABLE `ratings` AUTO_INCREMENT = 6;
