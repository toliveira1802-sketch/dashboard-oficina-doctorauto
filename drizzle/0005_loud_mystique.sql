CREATE TABLE `agendaHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` varchar(10) NOT NULL,
	`mecanico` varchar(50) NOT NULL,
	`horario` varchar(5) NOT NULL,
	`placa` varchar(20),
	`modelo` text,
	`tipo` varchar(50),
	`isEncaixe` int NOT NULL DEFAULT 0,
	`cumprido` int NOT NULL DEFAULT 1,
	`motivo` text,
	`observacoes` text,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agendaHistory_id` PRIMARY KEY(`id`)
);
