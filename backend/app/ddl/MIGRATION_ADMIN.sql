-- Migration: Add admin system
-- Created: 2025-11-27
-- Purpose: Add is_admin field to user table for admin privileges

USE `hots_pod_db`;

-- Add is_admin column to user table
ALTER TABLE `user` 
ADD COLUMN `is_admin` BOOLEAN NOT NULL DEFAULT FALSE AFTER `phonenumber`;

-- Set specific users as admins (예시: user_id 1, 2를 관리자로 설정)
-- UPDATE `user` SET `is_admin` = TRUE WHERE `user_id` IN (1, 2);

-- Create index for faster admin checks
CREATE INDEX `IDX_User_admin` ON `user` (`is_admin`);
