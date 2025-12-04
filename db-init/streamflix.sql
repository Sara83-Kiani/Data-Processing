CREATE TABLE IF NOT EXISTS `Subscription`(
    subscription_id int(11) AUTO_INCREMENT,
    description varchar(255) not null,
    subscription_price float not null default 7.99,
    PRIMARY KEY(subscription_id)
);

CREATE TABLE IF NOT EXISTS `Movie`(
    movie_id int(11) AUTO_INCREMENT,
    genre_id int(11) not null,
    title varchar(255) not null,
    duration timestamp not null default '00:00:00', 
    PRIMARY KEY(movie_id),
    FOREIGN KEY(genre_id) REFERENCES Genre(genre_id) ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS `Serie`(
    serie_id int(11) AUTO_INCREMENT,
    genre_id int(11) not null,
    title varchar(255) not null,
	seasons int(11) not null default 1,
    PRIMARY KEY(movie_id),
    FOREIGN KEY(genre_id) REFERENCES Genre(genre_id) ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS `Genre`(
    genre_id int(11) AUTO_INCREMENT,
    name varchar(255) not null,
    PRIMARY KEY(genre_id)
);

CREATE TABLE IF NOT EXISTS `Episode`(
    episode_id int(11) AUTO_INCREMENT,
  	serie_id int(11) not null,
    title varchar(255) not null,
    duration timestamp not null default '00:00:00',
    season_id int(11) not null,
    PRIMARY KEY(episode_id),
  	FOREIGN KEY(serie_id_id) REFERENCES Serie(serie_id) ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS `Subtitle`(
    subtitle_id int(11) AUTO_INCREMENT,
    language varchar(255) not null,
    movie_id int(11) null,
    episode_id int(11) null,
    subtitle_location varchar(255) not null,
    PRIMARY KEY(subtitle_id),
    FOREIGN KEY(movie_id) REFERENCES Movie(movie_id) ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY(episode_id) REFERENCES Episode(episode_id) ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS `User` (
    user_id int AUTO_INCREMENT not null,
    user_email varchar(50) UNIQUE not null,
    user_password varchar(60) not null,
    is_activated boolean,
    subscription_date timestamp,
    subscription_id int(11) not null,
    payment_method varchar(255) not null,
    PRIMARY KEY(user_id),
    FOREIGN KEY(subscription_id) REFERENCES Subscription(subscription_id) ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS `Profile`(
    profile_id int(11) AUTO_INCREMENT,
    user_id int(11) not null,
    profile_name varchar(60) not null,
    profile_image varchar(255) not null default 'placeholder.jpeg',
    profile_age int(11) default 0,
    profile_language varchar(60) not null default 'EN',
    PRIMARY KEY(profile_id),
    FOREIGN KEY(user_id) REFERENCES User(user_id) ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS `PasswordReset` (
    pass_reset_id int AUTO_INCREMENT not null,
    user_id int(11) not null,
    pass_reset_token LONGTEXT not null,
    PRIMARY KEY(pass_reset_id),
    FOREIGN KEY(user_id) REFERENCES User(user_id) ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS `Preference`(
    preference_id int(11) AUTO_INCREMENT,
    description varchar(255) not null,
    PRIMARY KEY(preference_id)
);

CREATE TABLE IF NOT EXISTS `PreferenceValue`(
    preference_value_id int(11) AUTO_INCREMENT,
    preference_id int(11) not null,
    name varchar(255) not null,
    PRIMARY KEY(preference_value_id),
    FOREIGN KEY(preference_id) REFERENCES Preference(preference_id) ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS `UserPreference`(
    user_preference_id int(11) AUTO_INCREMENT,
    user_id int(11) not null,
    preference_id int(11) not null,
    preference_value_id int(11) not null,
    PRIMARY KEY(user_preference_id),
    FOREIGN KEY(user_id) REFERENCES User(user_id) ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY(preference_id) REFERENCES Preference(preference_id) ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY(preference_value_id) REFERENCES PreferenceValue(preference_value_id) ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS `Watchlist`(
    profile_id int(11) AUTO_INCREMENT,
 	name varchar(255) not null,
 	movie_id int(11),
 	serie_id int (11),
    FOREIGN KEY(profile_id) REFERENCES Profile(profile_id) ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY(movie_id) REFERENCES Movie(movie_id) ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY(episode_id) REFERENCES Episode(episode_id) ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS `History`(
    profile_id int(11) AUTO_INCREMENT,
 	movie_id int(11),
 	episode_id int (11),
	counter int(11) not null default 1,
    FOREIGN KEY(profile_id) REFERENCES Profile(profile_id) ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY(movie_id) REFERENCES Movie(movie_id) ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY(episode_id) REFERENCES Episode(episode_id) ON UPDATE CASCADE ON DELETE NO ACTION
);