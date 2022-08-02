CREATE TABLE `inscricao` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nomeCandidato` varchar(45) NOT NULL,
  `evento` varchar(45) NOT NULL,
  `pagamento` blob NOT NULL,
  `numeroInscricao` int NOT NULL,
  `deferida` varchar(45) DEFAULT NULL,
  `responsavel` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numeroInscricao_UNIQUE` (`numeroInscricao`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `login` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user` varchar(45) NOT NULL,
  `username` varchar(45) NOT NULL,
  `password` varchar(45) NOT NULL,
  PRIMARY KEY (`id`,`username`),
  UNIQUE KEY `username_UNIQUE` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
