CREATE DATABASE PanoramaSNSdb1 CHARACTER SET utf8 COLLATE utf8_general_ci;
use PanoramaSNSdb1;
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
    authId VARCHAR(50) NOT NULL ,
    username VARCHAR(30), 
    password VARCHAR(255), 
    salt VARCHAR(255),
    displayName VARCHAR(50) NOT NULL,
    email VARCHAR(50), 
    PRIMARY KEY (id), 
    UNIQUE (authId)
) ENGINE = InnoDB DEFAULT CHARSET=utf8;