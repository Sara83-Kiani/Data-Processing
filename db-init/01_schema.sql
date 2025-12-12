-- Genre
CREATE TABLE IF NOT EXISTS `Genre` (
    genre_id INT(11) AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    PRIMARY KEY(genre_id)
);

-- Classification
CREATE TABLE IF NOT EXISTS `Classification` (
    classification_id INT(11) AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    PRIMARY KEY(classification_id)
);

-- Subscription
CREATE TABLE IF NOT EXISTS `Subscription` (
    subscription_id INT(11) AUTO_INCREMENT,
    description VARCHAR(255) NOT NULL,
    price DOUBLE NOT NULL DEFAULT 7.99,
    quality ENUM('SD', 'HD', 'UHD') NOT NULL DEFAULT 'SD',
    PRIMARY KEY(subscription_id)
);

-- Account
CREATE TABLE IF NOT EXISTS `Account` (
    account_id INT(11) AUTO_INCREMENT NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(60) NOT NULL,
    is_activated BOOLEAN NOT NULL DEFAULT FALSE,
    registration_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    subscription_id INT(11) NOT NULL,
    payment_method VARCHAR(255) NOT NULL,
    is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (account_id),
    FOREIGN KEY (subscription_id) 
        REFERENCES Subscription(subscription_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- Profile
CREATE TABLE IF NOT EXISTS `Profile` (
    profile_id INT(11) AUTO_INCREMENT,
    account_id INT(11) NOT NULL,
    name VARCHAR(60) NOT NULL,
    image VARCHAR(255) NOT NULL DEFAULT 'placeholder.jpeg',
    age INT(11) DEFAULT 18,
    language  ENUM('ENGLISH', 'DUTCH') NOT NULL DEFAULT 'ENGLISH',
    PRIMARY KEY(profile_id),
    FOREIGN KEY(account_id) 
        REFERENCES Account(account_id) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE
);

-- Profile Preference
CREATE TABLE IF NOT EXISTS `ProfilePreference` (
    profile_id INT(11) NOT NULL,
    classification_id INT(11) NOT NULL,
    genre_id INT(11) NOT NULL,
    PRIMARY KEY(profile_id, classification_id, genre_id),
    FOREIGN KEY(profile_id)
        REFERENCES Profile(profile_id) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE,
    FOREIGN KEY(classification_id) 
        REFERENCES Classification(classification_id) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE,
    FOREIGN KEY(genre_id) 
        REFERENCES Genre(genre_id) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE
);

-- Invitation
CREATE TABLE IF NOT EXISTS `Invitation` (
    invitation_id INT(11) AUTO_INCREMENT NOT NULL,
    account_id INT(11) NOT NULL,
    invitee_email VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP NULL DEFAULT NULL,
    discount_valid_until TIMESTAMP NULL DEFAULT NULL,
    status ENUM('PENDING', 'ACCEPTED') NOT NULL DEFAULT 'PENDING',
    PRIMARY KEY (invitation_id),
    FOREIGN KEY (account_id) 
        REFERENCES Account(account_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- Movie
CREATE TABLE IF NOT EXISTS `Movie` (
    movie_id INT(11) AUTO_INCREMENT,
    description VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    duration TIME NOT NULL DEFAULT '00:00:00',
    genre_id INT(11) NOT NULL,
    classification_id INT(11) NOT NULL,
    PRIMARY KEY(movie_id),
    FOREIGN KEY(genre_id) 
        REFERENCES Genre(genre_id)
        ON UPDATE CASCADE 
        ON DELETE CASCADE,
    FOREIGN KEY(classification_id) 
        REFERENCES Classification(classification_id)
        ON UPDATE CASCADE 
        ON DELETE CASCADE
);

-- Series
CREATE TABLE IF NOT EXISTS `Series` (
    series_id INT(11) AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    seasons INT(11) NOT NULL DEFAULT 1,
    description VARCHAR(255) NOT NULL,
    genre_id INT(11) NOT NULL,
    classification_id INT(11) NOT NULL,
    PRIMARY KEY(series_id),
    FOREIGN KEY(genre_id) 
        REFERENCES Genre(genre_id) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE,
    FOREIGN KEY(classification_id) 
        REFERENCES Classification(classification_id) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE
);

-- Episode
CREATE TABLE IF NOT EXISTS `Episode` (
    episode_id INT(11) AUTO_INCREMENT,
    series_id INT(11) NOT NULL,
    title VARCHAR(255) NOT NULL,
    duration TIME NOT NULL DEFAULT '00:00:00',
    season_number INT(11) NOT NULL,
    episode_number INT(11) NOT NULL,
    PRIMARY KEY(episode_id),
    FOREIGN KEY(series_id) 
        REFERENCES Series(series_id) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE
);

-- Subtitle
CREATE TABLE IF NOT EXISTS `Subtitle` (
    subtitle_id INT(11) AUTO_INCREMENT,
    movie_id INT(11),
    episode_id INT(11),
    language ENUM('ENGLISH', 'DUTCH') NOT NULL DEFAULT 'ENGLISH',
    subtitle_location VARCHAR(255) NOT NULL,
    PRIMARY KEY(subtitle_id),
    FOREIGN KEY(movie_id) 
        REFERENCES Movie(movie_id)
        ON UPDATE CASCADE 
        ON DELETE CASCADE,
    FOREIGN KEY(episode_id) 
        REFERENCES Episode(episode_id)
        ON UPDATE CASCADE 
        ON DELETE CASCADE
);

-- triggers for sustitle. making sure a subtitle belongs either to a movie or an episode.
-- if episode and movie are both null: error
-- if episode and movie are BOTH NOT null: error
-- only one of them is null: allowed
DELIMITER //

CREATE TRIGGER subtitle_xor_before_insert
BEFORE INSERT ON Subtitle
FOR EACH ROW
BEGIN
    IF ( (NEW.movie_id IS NULL AND NEW.episode_id IS NULL)
         OR (NEW.movie_id IS NOT NULL AND NEW.episode_id IS NOT NULL) ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Exactly one of movie_id or episode_id must be non-NULL';
    END IF;
END //
    
CREATE TRIGGER subtitle_xor_before_update
BEFORE UPDATE ON Subtitle
FOR EACH ROW
BEGIN
    IF ( (NEW.movie_id IS NULL AND NEW.episode_id IS NULL)
         OR (NEW.movie_id IS NOT NULL AND NEW.episode_id IS NOT NULL) ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Exactly one of movie_id or episode_id must be non-NULL';
    END IF;
END //

DELIMITER ;


-- PasswordReset
CREATE TABLE IF NOT EXISTS `PasswordReset` (
    pass_reset_id INT(11) AUTO_INCREMENT NOT NULL,
    account_id INT(11) NOT NULL,
    pass_reset_token VARCHAR(255) NOT NULL,
    PRIMARY KEY(pass_reset_id),
    FOREIGN KEY(account_id) 
        REFERENCES Account(account_id) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE
);

-- Watchlist
CREATE TABLE IF NOT EXISTS `Watchlist` (
    watchlist_id INT(11) AUTO_INCREMENT,
    profile_id INT(11) NOT NULL,
    name VARCHAR(255) NOT NULL,
    movie_id INT(11),
    series_id INT(11),
    episode_id INT(11),
    PRIMARY KEY(watchlist_id),
    FOREIGN KEY(profile_id)
        REFERENCES Profile(profile_id) 
        ON UPDATE CASCADE 
        ON DELETE NO ACTION,
    FOREIGN KEY(movie_id) 
        REFERENCES Movie(movie_id) 
        ON UPDATE CASCADE 
        ON DELETE NO ACTION,
    FOREIGN KEY(series_id) 
        REFERENCES Series(series_id) 
        ON UPDATE CASCADE 
        ON DELETE NO ACTION,
    FOREIGN KEY(episode_id) 
        REFERENCES Episode(episode_id) 
        ON UPDATE CASCADE 
        ON DELETE NO ACTION
);

-- a watchlist item must point either to:
-- a movie (movie_id NOT NULL), OR
-- a specific episode (series_id NOT NULL AND episode_id NOT NULL).
-- If movie_id is NULL, then BOTH series_id and episode_id must be non-NULL.
DELIMITER //

CREATE TRIGGER watchlist_check_before_insert
BEFORE INSERT ON Watchlist
FOR EACH ROW
BEGIN
    IF (NEW.movie_id IS NULL AND (NEW.series_id IS NULL OR NEW.episode_id IS NULL)) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Watchlist item must reference a movie or a (series, episode) pair';
    END IF;
END //

CREATE TRIGGER watchlist_check_before_update
BEFORE UPDATE ON Watchlist
FOR EACH ROW
BEGIN
    IF (NEW.movie_id IS NULL AND (NEW.series_id IS NULL OR NEW.episode_id IS NULL)) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Watchlist item must reference a movie or a (series, episode) pair';
    END IF;
END //

DELIMITER ;


-- Watch History
CREATE TABLE IF NOT EXISTS `WatchHistory` (
    history_id INT(11) AUTO_INCREMENT,
    profile_id INT(11) NOT NULL,
    movie_id INT(11),
    episode_id INT(11),
    duration_watched INT(11) NOT NULL DEFAULT 1,
    PRIMARY KEY(history_id),
    FOREIGN KEY(profile_id)
        REFERENCES Profile(profile_id)
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
    FOREIGN KEY(movie_id) 
        REFERENCES Movie(movie_id)
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
    FOREIGN KEY(episode_id)
        REFERENCES Episode(episode_id)
        ON UPDATE CASCADE 
        ON DELETE NO ACTION
);

-- each history row must reference at least one title:
-- movie_id NOT NULL OR episode_id NOT NULL.
DELIMITER //

CREATE TRIGGER watchhistory_check_before_insert
BEFORE INSERT ON WatchHistory
FOR EACH ROW
BEGIN
    IF (NEW.movie_id IS NULL AND NEW.episode_id IS NULL) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Watch history item must reference a movie or an episode';
    END IF;
END //

CREATE TRIGGER watchhistory_check_before_update
BEFORE UPDATE ON WatchHistory
FOR EACH ROW
BEGIN
    IF (NEW.movie_id IS NULL AND NEW.episode_id IS NULL) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Watch history item must reference a movie or an episode';
    END IF;
END //

DELIMITER ;