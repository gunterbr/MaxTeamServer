CREATE TABLE `o8usy5kkwtym7eo6`.`events` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(45) NOT NULL,
  `backgroundColor` VARCHAR(45) NULL,
  `title` VARCHAR(45) NOT NULL,
  `start` DATETIME NOT NULL,
  `end` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `title_UNIQUE` (`title` ASC) VISIBLE);

CREATE TABLE `o8usy5kkwtym7eo6`.`login` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user` VARCHAR(45) NOT NULL,
  `username` VARCHAR(45) NOT NULL,
  `password` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`, `username`),
  UNIQUE INDEX `username_UNIQUE` (`username` ASC) VISIBLE);
