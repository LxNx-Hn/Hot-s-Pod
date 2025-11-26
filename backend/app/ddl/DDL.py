# app/ddl/DDL.py

SQL_SCHEMA_V3 = """
/* Hot's POD Database Schema v3.0 */

CREATE DATABASE IF NOT EXISTS `hots_pod_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `hots_pod_db`;

/* 기존 객체 삭제 */
DROP TABLE IF EXISTS `vectorsyncqueue`;
DROP TABLE IF EXISTS `log`;
DROP TABLE IF EXISTS `chat`;
DROP TABLE IF EXISTS `comment`;
DROP TABLE IF EXISTS `pod_member`;
DROP TABLE IF EXISTS `categorylink`;
DROP TABLE IF EXISTS `pod`;
DROP TABLE IF EXISTS `category`;
DROP TABLE IF EXISTS `kakaoapi`;
DROP TABLE IF EXISTS `user`;

DROP TRIGGER IF EXISTS `trg_pod_after_insert`;
DROP TRIGGER IF EXISTS `trg_pod_after_update`;
DROP TRIGGER IF EXISTS `trg_pod_after_delete`;

DROP PROCEDURE IF EXISTS `sp_CreatePod`;
DROP PROCEDURE IF EXISTS `sp_GetPodDetailsForVectorizing`;
DROP PROCEDURE IF EXISTS `sp_FilterPods`;
DROP PROCEDURE IF EXISTS `sp_GetAllCategories`;

/* Core Tables */

CREATE TABLE `user` (
  `user_id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(100) NOT NULL,
  `phonenumber` VARCHAR(20) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  INDEX `IDX_User_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `kakaoapi` (
  `k_id` BIGINT NOT NULL,
  `user_id` INT NOT NULL,
  `access_token` VARCHAR(255) NULL,
  `refresh_token` VARCHAR(255) NULL,
  `user_name` VARCHAR(100) NULL,
  `profile_picture` VARCHAR(255) NULL,
  PRIMARY KEY (`k_id`),
  UNIQUE KEY `UK_KakaoAPI_user_id` (`user_id`),
  CONSTRAINT `FK_User_TO_KakaoAPI` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `category` (
  `category_id` INT NOT NULL AUTO_INCREMENT,
  `category_name` VARCHAR(100) NOT NULL,
  `parent_category_id` INT NULL,
  PRIMARY KEY (`category_id`),
  INDEX `IDX_Category_name` (`category_name`),
  CONSTRAINT `FK_Category_TO_Category` FOREIGN KEY (`parent_category_id`) REFERENCES `category` (`category_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `pod` (
  `pod_id` INT NOT NULL AUTO_INCREMENT,
  `host_user_id` INT NOT NULL,
  `event_time` DATETIME NOT NULL,
  `place` VARCHAR(255) NULL,
  `place_detail` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NULL,
  `min_peoples` INT NOT NULL,
  `max_peoples` INT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`pod_id`),
  INDEX `IDX_Pod_event_time` (`event_time`),
  INDEX `IDX_Pod_place` (`place`),
  INDEX `IDX_Pod_place_detail` (`place_detail`),
  CONSTRAINT `FK_User_TO_Pod` FOREIGN KEY (`host_user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `categorylink` (
  `category_link_id` INT NOT NULL AUTO_INCREMENT,
  `pod_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  PRIMARY KEY (`category_link_id`),
  UNIQUE KEY `UK_CategoryLink_pod_category` (`pod_id`, `category_id`),
  CONSTRAINT `FK_Pod_TO_CategoryLink` FOREIGN KEY (`pod_id`) REFERENCES `pod` (`pod_id`) ON DELETE CASCADE,
  CONSTRAINT `FK_Category_TO_CategoryLink` FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `pod_member` (
  `pod_member_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `pod_id` INT NOT NULL,
  `amount` INT NULL DEFAULT 0,
  `place_start` VARCHAR(255) NULL,
  `place_end` VARCHAR(255) NULL,
  `joined_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`pod_member_id`),
  UNIQUE KEY `UK_Pod_Member_user_pod` (`user_id`, `pod_id`),
  CONSTRAINT `FK_User_TO_Pod_Member` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `FK_Pod_TO_Pod_Member` FOREIGN KEY (`pod_id`) REFERENCES `pod` (`pod_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `comment` (
  `comment_id` INT NOT NULL AUTO_INCREMENT,
  `pod_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `content` TEXT NOT NULL,
  `parent_comment_id` INT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`comment_id`),
  INDEX `IDX_Comment_pod` (`pod_id`),
  CONSTRAINT `FK_Pod_TO_Comment` FOREIGN KEY (`pod_id`) REFERENCES `pod` (`pod_id`) ON DELETE CASCADE,
  CONSTRAINT `FK_User_TO_Comment` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `FK_Comment_TO_Comment` FOREIGN KEY (`parent_comment_id`) REFERENCES `comment` (`comment_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `chat` (
  `chat_id` BIGINT NOT NULL AUTO_INCREMENT,
  `pod_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `content` TEXT NULL,
  `time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`chat_id`),
  INDEX `IDX_Chat_pod_time` (`pod_id`, `time`),
  CONSTRAINT `FK_Pod_TO_Chat` FOREIGN KEY (`pod_id`) REFERENCES `pod` (`pod_id`) ON DELETE CASCADE,
  CONSTRAINT `FK_User_TO_Chat` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `log` (
  `log_id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` INT NULL,
  `log_code` VARCHAR(50) NULL,
  `time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `content` TEXT NULL,
  PRIMARY KEY (`log_id`),
  INDEX `IDX_Log_time` (`time`),
  CONSTRAINT `FK_User_TO_Log` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `vectorsyncqueue` (
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
AFTER INSERT ON `pod`
FOR EACH ROW
BEGIN
    INSERT INTO `vectorsyncqueue` (`pod_id`, `action_type`, `status`, `created_at`)
    VALUES (NEW.`pod_id`, 'upsert', 'pending', CURRENT_TIMESTAMP);
END$$

CREATE TRIGGER `trg_pod_after_update`
AFTER UPDATE ON `pod`
FOR EACH ROW
BEGIN
    IF NOT (OLD.`title` <=> NEW.`title`) OR
       NOT (OLD.`content` <=> NEW.`content`) OR
       NOT (OLD.`place` <=> NEW.`place`) THEN
        INSERT INTO `vectorsyncqueue` (`pod_id`, `action_type`, `status`, `created_at`)
        VALUES (NEW.`pod_id`, 'upsert', 'pending', CURRENT_TIMESTAMP);
    END IF;
END$$

CREATE TRIGGER `trg_pod_after_delete`
AFTER DELETE ON `pod`
FOR EACH ROW
BEGIN
    INSERT INTO `vectorsyncqueue` (`pod_id`, `action_type`, `status`, `created_at`)
    VALUES (OLD.`pod_id`, 'delete', 'pending', CURRENT_TIMESTAMP);
END$$

DELIMITER ;

/* Stored Procedures */

DELIMITER $$

CREATE PROCEDURE `sp_CreatePod`(
    IN `in_host_user_id` INT,
    IN `in_event_time` DATETIME,
    IN `in_place` VARCHAR(255),
    IN `in_place_detail` VARCHAR(255),
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

    INSERT INTO `pod` (`host_user_id`, `event_time`, `place`, `place_detail`, `title`, `content`, `min_peoples`, `max_peoples`)
    VALUES (`in_host_user_id`, `in_event_time`, `in_place`, `in_place_detail`, `in_title`, `in_content`, `in_min_peoples`, `in_max_peoples`);

    SET `new_pod_id` = LAST_INSERT_ID();
    SET `_length` = JSON_LENGTH(`in_category_ids`);

    WHILE `_index` < `_length` DO
        SET `_category_id` = JSON_UNQUOTE(JSON_EXTRACT(`in_category_ids`, CONCAT('$[', `_index`, ']')));
        
        INSERT INTO `categorylink` (`pod_id`, `category_id`)
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
        p.`place_detail`,
        p.`event_time`,
        p.`min_peoples`,
        p.`max_peoples`,
        (SELECT GROUP_CONCAT(c.`category_name` SEPARATOR ', ')
         FROM `categorylink` cl
         JOIN `category` c ON cl.`category_id` = c.`category_id`
         WHERE cl.`pod_id` = p.`pod_id`) AS `categories`
    FROM `pod` p
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
        p.`place_detail`,
        p.`title`,
        p.`content`,
        p.`min_peoples`,
        p.`max_peoples`,
        (SELECT COUNT(*) FROM `pod_member` pm WHERE pm.`pod_id` = p.`pod_id`) AS `current_member`,
        p.`created_at`,
        p.`updated_at`,
        u.`username` AS `host_username`,
        (
            SELECT JSON_ARRAYAGG(cl.`category_id`)
            FROM `categorylink` cl
            WHERE cl.`pod_id` = p.`pod_id`
        ) AS `category_ids`
    FROM `pod` p
    JOIN `user` u ON p.`host_user_id` = u.`user_id`
    WHERE p.`pod_id` IN (
        SELECT CAST(`pod_id_str` AS UNSIGNED) 
        FROM JSON_TABLE(
            `in_pod_ids_json`,
            "$[*]" COLUMNS (`pod_id_str` VARCHAR(20) PATH "$")
        ) AS `jt`
    )
    AND (`in_place_keyword` IS NULL OR COALESCE(p.`place`, '') COLLATE utf8mb4_unicode_ci LIKE CONCAT('%', `in_place_keyword` COLLATE utf8mb4_unicode_ci, '%') OR p.`place_detail` COLLATE utf8mb4_unicode_ci LIKE CONCAT('%', `in_place_keyword` COLLATE utf8mb4_unicode_ci, '%'))
    AND (`in_category_id` IS NULL OR EXISTS (
        SELECT 1 FROM `categorylink` cl
        WHERE cl.`pod_id` = p.`pod_id` AND cl.`category_id` = `in_category_id`
    ))
    AND p.`event_time` > NOW()
    ORDER BY p.`event_time` DESC
    LIMIT 10;
END$$

CREATE PROCEDURE `sp_GetAllCategories`()
BEGIN
    SELECT `category_id`, `category_name`, `parent_category_id`
    FROM `category`
    ORDER BY `category_name`;
END$$

DELIMITER ;

/* Initial Data */
INSERT INTO `category` (`category_id`, `category_name`, `parent_category_id`) VALUES
(0,'', NULL);
INSERT INTO `category` (`category_name`, `parent_category_id`) VALUES
('스포츠', NULL),
('문화·예술', NULL),
('학습·교육', NULL),
('취미·여가', NULL),
('푸드·요리', NULL);

INSERT INTO `category` (`category_name`, `parent_category_id`) VALUES
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

INSERT INTO `user` (`username`, `phonenumber`) VALUES
('테스트유저1', '010-1234-5678'),
('테스트유저2', '010-2345-6789'),
('테스트유저3', '010-3456-7890'),
('테스트유저4', '010-4567-8901'),
('테스트유저5', '010-5678-9012'),
('테스트유저6', '010-6789-0123'),
('테스트유저7', '010-7890-1234'),
('테스트유저8', '010-8901-2345');

INSERT INTO `pod` (`host_user_id`, `event_time`, `place`, `place_detail`, `title`, `content`, `min_peoples`, `max_peoples`) VALUES
(1, '2025-12-15 14:00', '석장동', '스타벅스 석장점', '주말 카페 스터디', '같이 카페에서 공부하실 분 구합니다!', 2, 6),
(2, '2025-12-20 19:00', '성건동', '청년다방', '저녁 맛집 탐방', '맛집 같이 다니실 분 환영합니다.', 3, 8),
(3, '2025-12-25 10:00', '황성동', '황성공원', '아침 러닝 모임', '새벽 러닝 같이해요!', 5, 10),
(1, '2025-12-16 15:00', '용강동', '용강체육관', '배드민턴 동아리', '배드민턴 치실 분 구합니다', 4, 8),
(2, '2025-12-18 18:00', '보문동', '보문호수 둘레길', '저녁 산책 모임', '보문호수 산책하실 분', 2, 6),
(3, '2025-12-22 13:00', '충효동', '챔피언당구클럽', '당구 치실 분', '당구 실력 무관! 같이 치며 친해져요', 2, 4),
(1, '2025-12-17 16:00', '석장동', '프리미엄PC방', 'LOL 게임 모임', '롤 같이 하실 분! 티어 무관', 4, 5),
(2, '2025-12-19 20:00', '성건동', '코인노래방', '노래방 가실 분', '스트레스 풀러 노래방 가요', 3, 6),
(3, '2025-12-23 14:00', '황성동', '황성도서관', '시험기간 스터디', '같이 공부하면서 응원해요', 3, 8),
(1, '2025-12-24 11:00', '용강동', 'CGV 경주', '크리스마스 영화 관람', '크리스마스 영화 같이 봐요', 2, 5),
(2, '2025-12-26 17:00', '보문동', '보문아트홀', '전시회 관람', '보문단지 전시회 같이 가실 분', 2, 4),
(3, '2025-12-27 19:00', '충효동', 'BBQ치킨 충효점', '치킨 파티', '치킨 먹으면서 수다 떨어요', 4, 8),
(1, '2025-12-28 10:00', '석장동', '석장피트니스', '아침 운동 모임', '헬스 같이 하실 분!', 2, 6),
(2, '2025-12-29 15:00', '성건동', '투썸플레이스', '영어 회화 스터디', '영어로 자유롭게 대화해요', 3, 6),
(3, '2025-12-30 13:00', '황성동', '황성풋살장', '풋살 모임', '풋살 같이 하실 분 구합니다', 8, 12),
(1, '2026-01-02 14:00', '용강동', '용강볼링센터', '볼링 치실 분', '볼링 초보도 환영!', 4, 8),
(2, '2026-01-03 18:00', '보문동', '보문호수 자전거길', '자전거 라이딩', '보문호수 자전거 투어', 3, 6),
(3, '2026-01-04 16:00', '충효동', '포켓볼클럽', '포켓볼 모임', '당구 좋아하시는 분들 모여요', 2, 4),
(1, '2026-01-05 12:00', '석장동', '카페베네', '독서 모임', '책 읽고 이야기 나눠요', 3, 6),
(2, '2026-01-06 19:00', '성건동', '경주한옥마을', '저녁 회식', '맛있는 저녁 같이 먹어요', 4, 8),
(4, '2026-01-07 15:00', '황성동', '스터디룸', '자격증 스터디', '자격증 공부 같이 해요', 2, 6),
(5, '2026-01-08 18:00', '석장동', '동해루', '중식 맛집 탐방', '짬뽕 좋아하시는 분!', 3, 6),
(6, '2026-01-09 10:00', '용강동', '용강근린공원', '요가 클래스', '아침 요가 같이 해요', 4, 10),
(7, '2026-01-10 20:00', '성건동', '할매떡볶이', '떡볶이 파티', '매운 떡볶이 도전!', 3, 8),
(8, '2026-01-11 14:00', '보문동', '보문호수 테라스카페', '사진 촬영 모임', '카메라 들고 사진 찍어요', 2, 5),
(4, '2026-01-12 16:00', '충효동', '코믹스펀', '만화 읽기 모임', '만화책 같이 읽어요', 2, 4),
(5, '2026-01-13 19:00', '황성동', '이자카야 사쿠라', '회식 모임', '술한잔 하실 분!', 4, 8),
(6, '2026-01-14 11:00', '석장동', '파리바게트', '베이킹 클래스', '쿠키 만들기 체험', 3, 6),
(7, '2026-01-15 13:00', '용강동', '용강탁구클럽', '탁구 동아리', '탁구 치실 분 구합니다', 4, 8),
(8, '2026-01-16 17:00', '성건동', '교보문고', '책 추천 모임', '좋은 책 공유해요', 2, 6),
(4, '2026-01-17 15:00', '보문동', '보문미술관', '미술 감상', '미술 작품 같이 봐요', 2, 5),
(5, '2026-01-18 12:00', '충효동', '왕족발', '족발 맛집', '족발 좋아하시는 분!', 3, 8),
(6, '2026-01-19 10:00', '황성동', '황성근린공원', '아침 산책', '산책하며 대화해요', 2, 6),
(7, '2026-01-20 18:00', '석장동', '황금찜질방', '찜질방 힐링', '찜질방에서 쉬어요', 3, 6),
(8, '2026-01-21 14:00', '용강동', '미스터리방', '방탈출 도전', '방탈출 같이 해요!', 4, 6),
(4, '2026-01-22 16:00', '성건동', '보드게임천국', '보드게임 모임', '보드게임 좋아하시는 분', 3, 6),
(5, '2026-01-23 19:00', '보문동', '경주한정식', '한식 맛집', '삼겹살 먹으러 가요', 4, 8),
(6, '2026-01-24 11:00', '충효동', '충효테니스클럽', '테니스 모임', '테니스 치실 분!', 4, 8),
(7, '2026-01-25 13:00', '황성동', '커피빈', '코딩 스터디', 'Python 같이 공부해요', 3, 6),
(8, '2026-01-26 17:00', '석장동', '스시로', '초밥 맛집 탐방', '초밥 좋아하시는 분', 3, 6);

INSERT INTO `categorylink` (`pod_id`, `category_id`) VALUES
(1, 3),
(2, 11),
(3, 3),
(4, 1),
(5, 4),
(6, 4),
(7, 4),
(8, 4),
(9, 3),
(10, 2),
(11, 2),
(12, 5),
(13, 1),
(14, 7),
(15, 1),
(16, 1),
(17, 1),
(18, 4),
(19, 3),
(20, 5),
(21, 3),
(22, 11),
(23, 1),
(24, 5),
(25, 8),
(26, 4),
(27, 5),
(28, 10),
(29, 1),
(30, 3),
(31, 2),
(32, 5),
(33, 4),
(34, 4),
(35, 4),
(36, 4),
(37, 5),
(38, 1),
(39, 3),
(40, 11);
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