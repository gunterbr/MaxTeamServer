CREATE TABLE `events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(45) NOT NULL,
  `backgroundColor` varchar(45) DEFAULT NULL,
  `title` varchar(45) NOT NULL,
  `start` varchar(45) NOT NULL,
  `end` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `login` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user` varchar(45) NOT NULL,
  `username` varchar(45) NOT NULL,
  `password` varchar(200) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
