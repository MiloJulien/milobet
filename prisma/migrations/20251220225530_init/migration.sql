-- CreateTable
CREATE TABLE "bet" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "match_id" INTEGER NOT NULL,
    "prediction" VARCHAR(50) NOT NULL,

    CONSTRAINT "bet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" INTEGER NOT NULL,
    "utc_date" TIMESTAMP(6) NOT NULL,
    "status" VARCHAR(50),
    "group_name" VARCHAR(50),
    "home_team_name" VARCHAR(255),
    "home_team_crest" VARCHAR(255),
    "away_team_name" VARCHAR(255),
    "away_team_crest" VARCHAR(255),
    "score_winner" VARCHAR(50),
    "home_score" INTEGER,
    "away_score" INTEGER,
    "stage" VARCHAR(50),

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" TEXT NOT NULL,
    "has_bet" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unique_user_match" ON "bet"("user_id", "match_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "bet" ADD CONSTRAINT "fk_bet_match" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bet" ADD CONSTRAINT "fk_bet_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
