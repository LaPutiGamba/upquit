ALTER TABLE "users" ADD COLUMN "username" varchar(30) NOT NULL UNIQUE;
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "username" DROP DEFAULT;
