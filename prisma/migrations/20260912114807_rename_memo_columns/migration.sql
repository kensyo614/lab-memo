-- カラム名の変更のみ．データはそのまま残る
ALTER TABLE "Resource" RENAME COLUMN "memo" TO "note";
ALTER TABLE "Memo" RENAME COLUMN "memo" TO "body";
