CREATE TABLE `historicoMovimentacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`veiculoId` int NOT NULL,
	`trelloCardId` varchar(64),
	`etapaAnterior` varchar(50),
	`etapaNova` varchar(50) NOT NULL,
	`dataMovimentacao` timestamp NOT NULL DEFAULT (now()),
	`diasNaEtapaAnterior` int,
	`mecanicoResponsavel` varchar(100),
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `historicoMovimentacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mecanicoPerformance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mecanicoNome` varchar(100) NOT NULL,
	`data` varchar(10) NOT NULL,
	`veiculosConcluidos` int NOT NULL DEFAULT 0,
	`servicosConcluidos` int NOT NULL DEFAULT 0,
	`tempoMedioServicoHoras` int,
	`taxaRetorno` int,
	`pontuacaoQualidade` int,
	`horasTrabalhadas` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mecanicoPerformance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mecanicos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`especialidade` varchar(100),
	`telefone` varchar(20),
	`email` varchar(320),
	`dataAdmissao` timestamp,
	`ativo` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mecanicos_id` PRIMARY KEY(`id`),
	CONSTRAINT `mecanicos_nome_unique` UNIQUE(`nome`)
);
--> statement-breakpoint
CREATE TABLE `servicos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`veiculoId` int NOT NULL,
	`tipoServicoId` int,
	`descricao` text NOT NULL,
	`mecanicoResponsavel` varchar(100),
	`dataInicio` timestamp,
	`dataFim` timestamp,
	`tempoExecucaoHoras` int,
	`valor` int,
	`status` enum('planejado','em_andamento','concluido','cancelado') NOT NULL DEFAULT 'planejado',
	`foiRetorno` int NOT NULL DEFAULT 0,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `servicos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tiposServico` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`categoria` varchar(50),
	`tempoMedioHoras` int,
	`valorMedio` int,
	`ativo` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tiposServico_id` PRIMARY KEY(`id`),
	CONSTRAINT `tiposServico_nome_unique` UNIQUE(`nome`)
);
--> statement-breakpoint
CREATE TABLE `veiculos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`placa` varchar(10) NOT NULL,
	`modelo` varchar(100),
	`marca` varchar(50),
	`ano` int,
	`cliente` varchar(100),
	`telefone` varchar(20),
	`trelloCardId` varchar(64),
	`dataEntrada` timestamp NOT NULL DEFAULT (now()),
	`dataSaida` timestamp,
	`status` enum('ativo','concluido','cancelado') NOT NULL DEFAULT 'ativo',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `veiculos_id` PRIMARY KEY(`id`),
	CONSTRAINT `veiculos_placa_unique` UNIQUE(`placa`)
);
