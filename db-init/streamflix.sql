-- 1️ Genre
CREATE TABLE IF NOT EXISTS `Genre` (
    genre_id INT(11) AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    PRIMARY KEY(genre_id)
);

-- 2️ Subscription
CREATE TABLE IF NOT EXISTS `Subscription` (
    subscription_id INT(11) AUTO_INCREMENT,
    description VARCHAR(255) NOT NULL,
    subscription_price FLOAT NOT NULL DEFAULT 7.99,
    PRIMARY KEY(subscription_id)
);

-- 3️ Preference & PreferenceValue
CREATE TABLE IF NOT EXISTS `Preference` (
    preference_id INT(11) AUTO_INCREMENT,
    description VARCHAR(255) NOT NULL,
    PRIMARY KEY(preference_id)
);

CREATE TABLE IF NOT EXISTS `PreferenceValue` (
    preference_value_id INT(11) AUTO_INCREMENT,
    preference_id INT(11) NOT NULL,
    name VARCHAR(255) NOT NULL,
    PRIMARY KEY(preference_value_id),
    FOREIGN KEY(preference_id) REFERENCES Preference(preference_id) ON UPDATE CASCADE ON DELETE NO ACTION
);

-- 4️ Movie
CREATE TABLE IF NOT EXISTS `Movie` (
    movie_id INT(11) AUTO_INCREMENT,
    genre_id INT(11) NOT NULL,
    title VARCHAR(255) NOT NULL,
    duration TIME NOT NULL DEFAULT '00:00:00',
    PRIMARY KEY(movie_id),
    FOREIGN KEY(genre_id) REFERENCES Genre(genre_id) ON UPDATE CASCADE ON DELETE NO ACTION
);

-- 5️ Serie
CREATE TABLE IF NOT EXISTS `Serie` (
    serie_id INT(11) AUTO_INCREMENT,
    genre_id INT(11) NOT NULL,
    title VARCHAR(255) NOT NULL,
    seasons INT(11) NOT NULL DEFAULT 1,
    PRIMARY KEY(serie_id),
    FOREIGN KEY(genre_id) REFERENCES Genre(genre_id) ON UPDATE CASCADE ON DELETE NO ACTION
);

-- 6️ Episode
CREATE TABLE IF NOT EXISTS `Episode` (
    episode_id INT(11) AUTO_INCREMENT,
    serie_id INT(11) NOT NULL,
    title VARCHAR(255) NOT NULL,
    duration TIME NOT NULL DEFAULT '00:00:00',
    season_id INT(11) NOT NULL,
    PRIMARY KEY(episode_id),
    FOREIGN KEY(serie_id) REFERENCES Serie(serie_id) ON UPDATE CASCADE ON DELETE NO ACTION
);

-- 7️ User
CREATE TABLE IF NOT EXISTS `User` (
    user_id INT(11) AUTO_INCREMENT NOT NULL,
    user_email VARCHAR(50) UNIQUE NOT NULL,
    user_password VARCHAR(60) NOT NULL,
    is_activated BOOLEAN,
    subscription_date TIMESTAMP,
    subscription_id INT(11) NOT NULL,
    payment_method VARCHAR(255) NOT NULL,
    PRIMARY KEY(user_id),
    FOREIGN KEY(subscription_id) REFERENCES Subscription(subscription_id) ON UPDATE CASCADE ON DELETE NO ACTION
);

-- 8️ UserPreference
CREATE TABLE IF NOT EXISTS `UserPreference` (
    user_preference_id INT(11) AUTO_INCREMENT,
    user_id INT(11) NOT NULL,
    preference_id INT(11) NOT NULL,
    preference_value_id INT(11) NOT NULL,
    PRIMARY KEY(user_preference_id),
    FOREIGN KEY(user_id) REFERENCES User(user_id) ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY(preference_id) REFERENCES Preference(preference_id) ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY(preference_value_id) REFERENCES PreferenceValue(preference_value_id) ON UPDATE CASCADE ON DELETE NO ACTION
);

-- 9️ Profile
CREATE TABLE IF NOT EXISTS `Profile` (
    profile_id INT(11) AUTO_INCREMENT,
    user_id INT(11) NOT NULL,
    profile_name VARCHAR(60) NOT NULL,
    profile_image VARCHAR(255) NOT NULL DEFAULT 'placeholder.jpeg',
    profile_age INT(11) DEFAULT 0,
    profile_language VARCHAR(60) NOT NULL DEFAULT 'EN',
    PRIMARY KEY(profile_id),
    FOREIGN KEY(user_id) REFERENCES User(user_id) ON UPDATE CASCADE ON DELETE NO ACTION
);

-- 10 PasswordReset
CREATE TABLE IF NOT EXISTS `PasswordReset` (
    pass_reset_id INT(11) AUTO_INCREMENT NOT NULL,
    user_id INT(11) NOT NULL,
    pass_reset_token LONGTEXT NOT NULL,
    PRIMARY KEY(pass_reset_id),
    FOREIGN KEY(user_id) REFERENCES User(user_id) ON UPDATE CASCADE ON DELETE NO ACTION
);

-- 11 Watchlist
CREATE TABLE IF NOT EXISTS `Watchlist` (
    watchlist_id INT(11) AUTO_INCREMENT,
    profile_id INT(11) NOT NULL,
    name VARCHAR(255) NOT NULL,
    movie_id INT(11),
    serie_id INT(11),
    episode_id INT(11),
    PRIMARY KEY(watchlist_id),
    FOREIGN KEY(profile_id) REFERENCES Profile(profile_id) ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY(movie_id) REFERENCES Movie(movie_id) ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY(serie_id) REFERENCES Serie(serie_id) ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY(episode_id) REFERENCES Episode(episode_id) ON UPDATE CASCADE ON DELETE NO ACTION
);

-- 12 History
CREATE TABLE IF NOT EXISTS `History` (
    history_id INT(11) AUTO_INCREMENT,
    profile_id INT(11) NOT NULL,
    movie_id INT(11),
    episode_id INT(11),
    counter INT(11) NOT NULL DEFAULT 1,
    PRIMARY KEY(history_id),
    FOREIGN KEY(profile_id) REFERENCES Profile(profile_id) ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY(movie_id) REFERENCES Movie(movie_id) ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY(episode_id) REFERENCES Episode(episode_id) ON UPDATE CASCADE ON DELETE NO ACTION
);
