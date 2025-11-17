# app/ddl/DDL.py

SQL_SCHEMA_V3 = """
/* Hot's POD Database Schema v3.0 */

CREATE DATABASE IF NOT EXISTS `hots_pod_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `hots_pod_db`;

/* 기존 객체 삭제 */
DROP TABLE IF EXISTS `VectorSyncQueue`;
DROP TABLE IF EXISTS `Log`;
DROP TABLE IF EXISTS `Chat`;
DROP TABLE IF EXISTS `Comment`;
DROP TABLE IF EXISTS `Pod_Member`;
DROP TABLE IF EXISTS `CategoryLink`;
DROP TABLE IF EXISTS `Pod`;
DROP TABLE IF EXISTS `Category`;
DROP TABLE IF EXISTS `KakaoAPI`;
DROP TABLE IF EXISTS `User`;

DROP TRIGGER IF EXISTS `trg_pod_after_insert`;
DROP TRIGGER IF EXISTS `trg_pod_after_update`;
DROP TRIGGER IF EXISTS `trg_pod_after_delete`;

DROP PROCEDURE IF EXISTS `sp_CreatePod`;
DROP PROCEDURE IF EXISTS `sp_GetPodDetailsForVectorizing`;
DROP PROCEDURE IF EXISTS `sp_FilterPods`;
DROP PROCEDURE IF EXISTS `sp_GetAllCategories`;

/* Core Tables */

CREATE TABLE `User` (
  `user_id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(100) NOT NULL,
  `phonenumber` VARCHAR(20) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  INDEX `IDX_User_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `KakaoAPI` (
  `k_id` BIGINT NOT NULL,
  `user_id` INT NOT NULL,
  `access_token` VARCHAR(255) NULL,
  `refresh_token` VARCHAR(255) NULL,
  `user_name` VARCHAR(100) NULL,
  `profile_picture` VARCHAR(255) NULL,
  PRIMARY KEY (`k_id`),
  UNIQUE KEY `UK_KakaoAPI_user_id` (`user_id`),
  CONSTRAINT `FK_User_TO_KakaoAPI` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Category` (
  `category_id` INT NOT NULL AUTO_INCREMENT,
  `category_name` VARCHAR(100) NOT NULL,
  `parent_category_id` INT NULL,
  PRIMARY KEY (`category_id`),
  INDEX `IDX_Category_name` (`category_name`),
  CONSTRAINT `FK_Category_TO_Category` FOREIGN KEY (`parent_category_id`) REFERENCES `Category` (`category_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Pod` (
  `pod_id` INT NOT NULL AUTO_INCREMENT,
  `host_user_id` INT NOT NULL,
  `event_time` DATETIME NOT NULL,
  `place` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NULL,
  `min_peoples` INT NOT NULL,
  `max_peoples` INT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`pod_id`),
  INDEX `IDX_Pod_event_time` (`event_time`),
  INDEX `IDX_Pod_place` (`place`),
  CONSTRAINT `FK_User_TO_Pod` FOREIGN KEY (`host_user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `CategoryLink` (
  `category_link_id` INT NOT NULL AUTO_INCREMENT,
  `pod_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  PRIMARY KEY (`category_link_id`),
  UNIQUE KEY `UK_CategoryLink_pod_category` (`pod_id`, `category_id`),
  CONSTRAINT `FK_Pod_TO_CategoryLink` FOREIGN KEY (`pod_id`) REFERENCES `Pod` (`pod_id`) ON DELETE CASCADE,
  CONSTRAINT `FK_Category_TO_CategoryLink` FOREIGN KEY (`category_id`) REFERENCES `Category` (`category_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Pod_Member` (
  `pod_member_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `pod_id` INT NOT NULL,
  `amount` INT NULL DEFAULT 0,
  `place_start` VARCHAR(255) NULL,
  `place_end` VARCHAR(255) NULL,
  `joined_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`pod_member_id`),
  UNIQUE KEY `UK_Pod_Member_user_pod` (`user_id`, `pod_id`),
  CONSTRAINT `FK_User_TO_Pod_Member` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `FK_Pod_TO_Pod_Member` FOREIGN KEY (`pod_id`) REFERENCES `Pod` (`pod_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Comment` (
  `comment_id` INT NOT NULL AUTO_INCREMENT,
  `pod_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `content` TEXT NOT NULL,
  `parent_comment_id` INT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`comment_id`),
  INDEX `IDX_Comment_pod` (`pod_id`),
  CONSTRAINT `FK_Pod_TO_Comment` FOREIGN KEY (`pod_id`) REFERENCES `Pod` (`pod_id`) ON DELETE CASCADE,
  CONSTRAINT `FK_User_TO_Comment` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `FK_Comment_TO_Comment` FOREIGN KEY (`parent_comment_id`) REFERENCES `Comment` (`comment_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Chat` (
  `chat_id` BIGINT NOT NULL AUTO_INCREMENT,
  `pod_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `content` TEXT NULL,
  `time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`chat_id`),
  INDEX `IDX_Chat_pod_time` (`pod_id`, `time`),
  CONSTRAINT `FK_Pod_TO_Chat` FOREIGN KEY (`pod_id`) REFERENCES `Pod` (`pod_id`) ON DELETE CASCADE,
  CONSTRAINT `FK_User_TO_Chat` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Log` (
  `log_id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` INT NULL,
  `log_code` VARCHAR(50) NULL,
  `time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `content` TEXT NULL,
  PRIMARY KEY (`log_id`),
  INDEX `IDX_Log_time` (`time`),
  CONSTRAINT `FK_User_TO_Log` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `VectorSyncQueue` (
  `queue_id` BIGINT NOT NULL AUTO_INCREMENT,
  `pod_id` INT NOT NULL,
  `action_type` ENUM('upsert', 'delete') NOT NULL,
  `status` ENUM('pending', 'processing', 'failed') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `retry_count` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`queue_id`),
  INDEX `IDX_VectorSyncQueue_status_created` (`status`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* Triggers */

DELIMITER $$

CREATE TRIGGER `trg_pod_after_insert`
AFTER INSERT ON `Pod`
FOR EACH ROW
BEGIN
    INSERT INTO `VectorSyncQueue` (`pod_id`, `action_type`, `status`, `created_at`)
    VALUES (NEW.`pod_id`, 'upsert', 'pending', CURRENT_TIMESTAMP);
END$$

CREATE TRIGGER `trg_pod_after_update`
AFTER UPDATE ON `Pod`
FOR EACH ROW
BEGIN
    IF NOT (OLD.`title` <=> NEW.`title`) OR
       NOT (OLD.`content` <=> NEW.`content`) OR
       NOT (OLD.`place` <=> NEW.`place`) THEN
        INSERT INTO `VectorSyncQueue` (`pod_id`, `action_type`, `status`, `created_at`)
        VALUES (NEW.`pod_id`, 'upsert', 'pending', CURRENT_TIMESTAMP);
    END IF;
END$$

CREATE TRIGGER `trg_pod_after_delete`
AFTER DELETE ON `Pod`
FOR EACH ROW
BEGIN
    INSERT INTO `VectorSyncQueue` (`pod_id`, `action_type`, `status`, `created_at`)
    VALUES (OLD.`pod_id`, 'delete', 'pending', CURRENT_TIMESTAMP);
END$$

DELIMITER ;

/* Stored Procedures */

DELIMITER $$

CREATE PROCEDURE `sp_CreatePod`(
    IN `in_host_user_id` INT,
    IN `in_event_time` DATETIME,
    IN `in_place` VARCHAR(255),
    IN `in_title` VARCHAR(255),
    IN `in_content` TEXT,
    IN `in_min_peoples` INT,
    IN `in_max_peoples` INT,
    IN `in_category_ids` JSON
)
BEGIN
    DECLARE `new_pod_id` INT;
    DECLARE `_category_id` INT;
    DECLARE `_index` INT DEFAULT 1;
    DECLARE `_length` INT;

    START TRANSACTION;

    INSERT INTO `Pod` (`host_user_id`, `event_time`, `place`, `title`, `content`, `min_peoples`, `max_peoples`)
    VALUES (`in_host_user_id`, `in_event_time`, `in_place`, `in_title`, `in_content`, `in_min_peoples`, `in_max_peoples`);

    SET `new_pod_id` = LAST_INSERT_ID();
    SET `_length` = JSON_LENGTH(`in_category_ids`);

    WHILE `_index` < `_length` DO
        SET `_category_id` = JSON_UNQUOTE(JSON_EXTRACT(`in_category_ids`, CONCAT('$[', `_index`, ']')));
        
        INSERT INTO `CategoryLink` (`pod_id`, `category_id`)
        VALUES (`new_pod_id`, `_category_id`);
        
        SET `_index` = `_index` + 1;
    END WHILE;

    COMMIT;

    SELECT `new_pod_id` AS `pod_id`;
END$$

CREATE PROCEDURE `sp_GetPodDetailsForVectorizing`(
    IN `in_pod_id` INT
)
BEGIN
    SELECT 
        p.`pod_id`,
        p.`title`,
        p.`content`,
        p.`place`,
        p.`event_time`,
        p.`min_peoples`,
        p.`max_peoples`,
        (SELECT GROUP_CONCAT(c.`category_name` SEPARATOR ', ')
         FROM `CategoryLink` cl
         JOIN `Category` c ON cl.`category_id` = c.`category_id`
         WHERE cl.`pod_id` = p.`pod_id`) AS `categories`
    FROM `Pod` p
    WHERE p.`pod_id` = `in_pod_id`;
END$$

CREATE PROCEDURE `sp_FilterPods`(
    IN `in_pod_ids_json` JSON,
    IN `in_place_keyword` VARCHAR(255),
    IN `in_category_id` INT
)
BEGIN
    SELECT 
        p.`pod_id`,
        p.`host_user_id`,
        p.`event_time`,
        p.`place`,
        p.`title`,
        p.`content`,
        p.`min_peoples`,
        p.`max_peoples`,
        p.`created_at`,
        p.`updated_at`,
        u.`username` AS `host_username`
    FROM `Pod` p
    JOIN `User` u ON p.`host_user_id` = u.`user_id`
    WHERE p.`pod_id` IN (
        SELECT CAST(`pod_id_str` AS UNSIGNED) 
        FROM JSON_TABLE(
            `in_pod_ids_json`,
            "$[*]" COLUMNS (`pod_id_str` VARCHAR(20) PATH "$")
        ) AS `jt`
    )
    AND (`in_place_keyword` IS NULL OR p.`place` COLLATE utf8mb4_unicode_ci LIKE CONCAT('%', `in_place_keyword` COLLATE utf8mb4_unicode_ci, '%'))
    AND (`in_category_id` IS NULL OR EXISTS (
        SELECT 1 FROM `CategoryLink` cl
        WHERE cl.`pod_id` = p.`pod_id` AND cl.`category_id` = `in_category_id`
    ))
    AND p.`event_time` > NOW()
    ORDER BY p.`event_time` DESC
    LIMIT 10;
END$$

CREATE PROCEDURE `sp_GetAllCategories`()
BEGIN
    SELECT `category_id`, `category_name`, `parent_category_id`
    FROM `Category`
    ORDER BY `category_name`;
END$$

DELIMITER ;

/* Initial Data */
INSERT INTO `Category` (`category_id`, `category_name`, `parent_category_id`) VALUES
(0,'', NULL);
INSERT INTO `Category` (`category_name`, `parent_category_id`) VALUES
('스포츠', NULL),
('문화·예술', NULL),
('학습·교육', NULL),
('취미·여가', NULL),
('푸드·요리', NULL);

INSERT INTO `Category` (`category_name`, `parent_category_id`) VALUES
('축구', 1),
('농구', 1),
('러닝', 1),
('전시회', 2),
('공연', 2),
('프로그래밍', 3),
('외국어', 3),
('사진', 4),
('음악', 4),
('베이킹', 5),
('맛집투어', 5);

INSERT INTO `User` (`username`, `phonenumber`) VALUES
('테스트유저1', '010-1234-5678'),
('테스트유저2', '010-2345-6789'),
('테스트유저3', '010-3456-7890');

INSERT INTO `Pod` (`host_user_id`, `event_time`, `place`, `title`, `content`, `min_peoples`, `max_peoples`) VALUES
(1, '2025-12-15 14:00:00', '강남역 2번 출구', '주말 러닝 모임', '같이 한강 러닝하실 분 구합니다!', 5, 10),
(2, '2025-12-20 19:00:00', '홍대 카페 XXX', '영화 스터디 모임', '영화 이야기 나누며 영어 공부해요.', 2, 5),
(3, '2025-12-25 10:00:00', '성수동 베이킹 스튜디오', '베이킹 클래스', '초보자도 환영합니다.', 2, 10);

INSERT INTO `CategoryLink` (`pod_id`, `category_id`) VALUES
(1, 3),
(2, 7),
(2, 2),
(3, 10);
"""

def execute_ddl(connection):
    """DDL 스크립트를 실행합니다."""
    import re
    
    cursor = connection.cursor()
    
    statements = []
    current_statement = ""
    delimiter = ";"
    
    for line in SQL_SCHEMA_V3.split('\n'):
        line = line.strip()
        
        #대충 주석이랑 공백 지우는거임
        line = re.sub(r'/\*.*?\*/', '', line)
        if '--' in line:
            line = line.split('--', 1)[0].rstrip()
        if not line:
            continue
        if line.startswith('DELIMITER'):
            delimiter = line.split()[-1]
            continue
        current_statement += line + " "
        if delimiter == "$$":
            if current_statement.rstrip().endswith("$$"):
                current_statement = current_statement.rstrip()
                if current_statement.endswith(delimiter):
                    current_statement = current_statement.removesuffix(delimiter).rstrip()
                statements.append(current_statement.strip())
                current_statement = ""
        elif delimiter in line:
            statements.append(current_statement.strip())
            current_statement = ""
    
    # 실행
    for statement in statements:
        if statement:
            try:
                cursor.execute(statement)
            except Exception as e:
                print(f"Error: {e}")
                print(f"Statement: {statement[:100]}...")
    
    connection.commit()
    cursor.close()
    print("DDL execution completed!")