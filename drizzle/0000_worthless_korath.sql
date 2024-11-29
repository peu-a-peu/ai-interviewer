CREATE TABLE IF NOT EXISTS "users" (
	"userId" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_userId_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"email" varchar(255) NOT NULL,
	"ticketCount" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp NOT NULL
);
