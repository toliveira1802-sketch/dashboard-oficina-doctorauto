CREATE TABLE `metasFinanceiras` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mes` int NOT NULL,
	`ano` int NOT NULL,
	`metaMensal` int NOT NULL,
	`metaPorServico` int,
	`metaDiaria` int,
	`senhaProtecao` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `metasFinanceiras_id` PRIMARY KEY(`id`)
);
