CREATE TABLE `agendas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` varchar(10) NOT NULL,
	`mecanico` varchar(50) NOT NULL,
	`horario` varchar(5) NOT NULL,
	`cardId` varchar(64),
	`placa` varchar(20),
	`modelo` text,
	`tipo` varchar(50),
	`isEncaixe` int NOT NULL DEFAULT 0,
	`status` enum('planejado','em_andamento','concluido','cancelado') NOT NULL DEFAULT 'planejado',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agendas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feedbacks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` varchar(10) NOT NULL,
	`mecanico` varchar(50) NOT NULL,
	`feedback` text NOT NULL,
	`ocorreuComoEsperado` int NOT NULL DEFAULT 1,
	`observacoes` text,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `feedbacks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sugestoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` varchar(10) NOT NULL,
	`conteudo` text NOT NULL,
	`status` enum('pendente','aprovada','rejeitada') NOT NULL DEFAULT 'pendente',
	`mensagemWhatsapp` text,
	`approvedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sugestoes_id` PRIMARY KEY(`id`)
);
