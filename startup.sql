CREATE DATABASE panoramasnsdb1 CHARACTER SET utf8 COLLATE utf8_general_ci;
use panoramasnsdb1;
CREATE TABLE `topic` (
`id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `author` varchar(30) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
INSERT INTO topic (title, description, author) VALUES('JavaScript','Computer language for web.', 'egoing');
INSERT INTO topic (title, description, author) VALUES('NPM','Package manager', 'leezche');

CREATE TABLE users ( 
    id INT NOT NULL AUTO_INCREMENT , 
    displayName VARCHAR(50) NOT NULL,
    localId VARCHAR(50),
    password VARCHAR(255),
    salt VARCHAR(255), 
    email VARCHAR(50),
    facebookId VARCHAR(50),
    googleId VARCHAR(50),
    twitterId VARCHAR(50),
    kakaoId VARCHAR(50),
    PRIMARY KEY (id), 
    UNIQUE (id)
) ENGINE = InnoDB DEFAULT CHARSET=utf8;