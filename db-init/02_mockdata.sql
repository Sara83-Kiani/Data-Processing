-- StreamFlix Sample Data Script
-- Populates all tables with realistic test data

USE mydb;

-- Delete existing data in correct order (respecting foreign keys)
DELETE FROM Subtitle;
DELETE FROM WatchHistory;
DELETE FROM Watchlist;
DELETE FROM Episode;
DELETE FROM Movie;
DELETE FROM Series;
DELETE FROM PasswordReset;
DELETE FROM ActivationToken;
DELETE FROM Invitation;
DELETE FROM ProfilePreference;
DELETE FROM Profile;
DELETE FROM Account;
DELETE FROM Subscription;
DELETE FROM Classification;
DELETE FROM Genre;

-- Reset auto-increment counters
ALTER TABLE Genre AUTO_INCREMENT = 1;
ALTER TABLE Classification AUTO_INCREMENT = 1;
ALTER TABLE Subscription AUTO_INCREMENT = 1;
ALTER TABLE Account AUTO_INCREMENT = 1;
ALTER TABLE Profile AUTO_INCREMENT = 1;
ALTER TABLE Movie AUTO_INCREMENT = 1;
ALTER TABLE Series AUTO_INCREMENT = 1;
ALTER TABLE Episode AUTO_INCREMENT = 1;

-- Genres
INSERT INTO Genre (name) VALUES
('Action'),
('Drama'),
('Comedy'),
('Horror'),
('Sci-Fi'),
('Thriller'),
('Romance'),
('Documentary'),
('Animation'),
('Crime');

-- Classifications
INSERT INTO Classification (name, description) VALUES
('G', 'General Audiences - All ages admitted'),
('PG', 'Parental Guidance Suggested - Some material may not be suitable for children'),
('PG-13', 'Parents Strongly Cautioned - Some material inappropriate for children under 13'),
('R', 'Restricted - Under 17 requires accompanying parent or guardian'),
('TV-MA', 'Mature Audiences Only - Specifically designed to be viewed by adults'),
('TV-14', 'Parents Strongly Cautioned - May be unsuitable for children under 14'),
('TV-PG', 'Parental Guidance Suggested - May contain material unsuitable for younger children');

-- Subscriptions
INSERT INTO Subscription (description, price, quality, status) VALUES
('Basic SD - Standard Definition streaming', 7.99, 'SD', 'ACTIVE'),
('Standard HD - High Definition streaming', 12.99, 'HD', 'ACTIVE'),
('Premium UHD - Ultra HD streaming', 17.99, 'UHD', 'ACTIVE');

-- Accounts (password: Test123456 - bcrypt hashed)
INSERT INTO Account (email, password, is_activated, subscription_id, referral_code, is_blocked) VALUES
('john.doe@streamflix.com', '$2b$10$rZ5L3qY8xKp9vN2wQ1mXxOYzJ4K6P8R9sT0uV1wX2yZ3aB4cD5eF6', TRUE, 2, 'JOHN2024', FALSE),
('jane.smith@streamflix.com', '$2b$10$rZ5L3qY8xKp9vN2wQ1mXxOYzJ4K6P8R9sT0uV1wX2yZ3aB4cD5eF6', TRUE, 3, 'JANE2024', FALSE),
('bob.wilson@streamflix.com', '$2b$10$rZ5L3qY8xKp9vN2wQ1mXxOYzJ4K6P8R9sT0uV1wX2yZ3aB4cD5eF6', TRUE, 1, 'BOB2024', FALSE);

-- Profiles
INSERT INTO Profile (account_id, name, age, language) VALUES
(1, 'John', 35, 'ENGLISH'),
(1, 'Emma', 8, 'ENGLISH'),
(2, 'Jane', 28, 'ENGLISH'),
(2, 'Little Tom', 5, 'ENGLISH'),
(3, 'Bob', 42, 'DUTCH');

-- Movies
INSERT INTO Movie (description, title, duration, genre_id, classification_id) VALUES
('A computer hacker learns about the true nature of reality', 'The Matrix', '02:16:00', 5, 4),
('A thief who steals corporate secrets through dream-sharing technology', 'Inception', '02:28:00', 5, 3),
('Two imprisoned men bond over years finding redemption', 'The Shawshank Redemption', '02:22:00', 2, 4),
('The lives of two mob hitmen, a boxer, and a pair of diner bandits', 'Pulp Fiction', '02:34:00', 10, 4),
('Batman faces the Joker in a battle for Gotham City', 'The Dark Knight', '02:32:00', 1, 3),
('The presidencies of Kennedy and Johnson through the eyes of a man', 'Forrest Gump', '02:22:00', 2, 3),
('The aging patriarch of an organized crime dynasty transfers control', 'The Godfather', '02:55:00', 10, 4),
('An insomniac office worker forms an underground fight club', 'Fight Club', '02:19:00', 2, 4),
('The story of Henry Hill and his life in the mob', 'Goodfellas', '02:26:00', 10, 4),
('A young FBI cadet seeks help from an imprisoned cannibal killer', 'The Silence of the Lambs', '01:58:00', 6, 4);

-- Series
INSERT INTO Series (title, seasons, description, genre_id, classification_id) VALUES
('Breaking Bad', 5, 'A chemistry teacher turned meth manufacturer', 10, 5),
('Stranger Things', 4, 'Kids in a small town uncover supernatural mysteries', 5, 5),
('The Office', 9, 'Mockumentary about office employees', 3, 6),
('Game of Thrones', 8, 'Noble families vie for control of the Iron Throne', 2, 5),
('Friends', 10, 'Six friends navigate life and love in New York', 3, 6);

-- Episodes for Breaking Bad (series_id = 1)
INSERT INTO Episode (series_id, title, duration, season_number, episode_number) VALUES
(1, 'Pilot', '00:58:00', 1, 1),               -- episode_id = 1
(1, 'Cats in the Bag', '00:48:00', 1, 2),      -- episode_id = 2
(1, 'And the Bags in the River', '00:48:00', 1, 3), -- episode_id = 3
(1, 'Seven Thirty-Seven', '00:47:00', 2, 1),   -- episode_id = 4
(1, 'Grilled', '00:47:00', 2, 2);              -- episode_id = 5

-- Episodes for Stranger Things (series_id = 2)
INSERT INTO Episode (series_id, title, duration, season_number, episode_number) VALUES
(2, 'Chapter One: The Vanishing', '00:49:00', 1, 1), -- episode_id = 6
(2, 'Chapter Two: The Weirdo', '00:56:00', 1, 2),    -- episode_id = 7
(2, 'Chapter Three: Holly Jolly', '00:52:00', 1, 3), -- episode_id = 8
(2, 'MADMAX', '00:56:00', 2, 1),                     -- episode_id = 9
(2, 'Trick or Treat', '00:54:00', 2, 2);             -- episode_id = 10

-- Episodes for The Office (series_id = 3)
INSERT INTO Episode (series_id, title, duration, season_number, episode_number) VALUES
(3, 'Pilot', '00:23:00', 1, 1),
(3, 'Diversity Day', '00:22:00', 1, 2),
(3, 'Health Care', '00:22:00', 1, 3);

-- Watchlist
-- Must satisfy trigger:
--  - EITHER movie_id NOT NULL and series_id/episode_id NULL
--  - OR movie_id NULL AND series_id NOT NULL AND episode_id NOT NULL
INSERT INTO Watchlist (profile_id, movie_id, series_id, episode_id) VALUES
(1, 1, NULL, NULL),
(1, 2, NULL, NULL),
-- Series watchlist: Breaking Bad S1E1 (series_id=1, episode_id=1)
(1, NULL, 1, 1),
(3, 4, NULL, NULL),
-- Series watchlist: Stranger Things S1E1 (series_id=2, episode_id=6)
(3, NULL, 2, 6);

-- Watch History
-- Must satisfy trigger: movie_id IS NOT NULL OR episode_id IS NOT NULL
INSERT INTO WatchHistory (profile_id, movie_id, episode_id, duration_watched, resume_position, completed) VALUES
(1, 1, NULL, 136, '02:16:00', TRUE),
(1, 2, NULL, 85, '01:25:00', FALSE),
(3, NULL, 1, 58, '00:58:00', TRUE),
(3, NULL, 2, 30, '00:30:00', FALSE),
(5, 3, NULL, 142, '02:22:00', TRUE);

-- Subtitles
-- Must satisfy trigger: exactly one of (movie_id, episode_id) is non-NULL
INSERT INTO Subtitle (movie_id, episode_id, language, subtitle_location) VALUES
(1, NULL, 'ENGLISH', '/subtitles/matrix_en.srt'),
(1, NULL, 'DUTCH', '/subtitles/matrix_nl.srt'),
(2, NULL, 'ENGLISH', '/subtitles/inception_en.srt'),
(NULL, 1, 'ENGLISH', '/subtitles/bb_s01e01_en.srt'),
(NULL, 6, 'ENGLISH', '/subtitles/st_s01e01_en.srt');

-- Profile Preferences (linking profiles to their preferred genres and classifications)
INSERT INTO ProfilePreference (profile_id, classification_id, genre_id) VALUES
(1, 4, 5),
(1, 3, 1),
(2, 1, 9),
(3, 4, 10),
(5, 4, 2);

-- Invitations
-- New schema requires invitee_email NOT NULL; status defaults to 'PENDING' but we can mark accepted ones.
INSERT INTO Invitation (inviter_account_id, invitee_email, invitee_account_id, invitation_code, discount_amount, discount_started_at, discount_valid_until, discount_applied, status) VALUES
(1, 'jane.smith@streamflix.com', 2, 'INV-JOHN-001', 2.00, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), TRUE, 'ACCEPTED'),
(2, 'bob.wilson@streamflix.com', 3, 'INV-JANE-002', 0.00, NULL, NULL, FALSE, 'ACCEPTED');

SELECT 'Sample data inserted successfully!' AS Status;
