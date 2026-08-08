This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Supabase セットアップ

このプロジェクトは Supabase（Postgres / Auth / Storage）を利用します。

### 1. Supabase プロジェクトを作成する

1. [supabase.com](https://supabase.com) にログインし、**New project** を作成する
2. Database Password は控えておく（後から確認できない）
3. Region は東京（`Northeast Asia (Tokyo)`）を選ぶとレイテンシが小さい

### 2. 環境変数を設定する

Supabase ダッシュボード上部の **Connect → App Frameworks → Next.js** に表示される値を `.env.local` にコピーします。

| 変数名 | 値 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL（`https://xxxxx.supabase.co`） |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key（`sb_publishable_...`） |

Publishable key は旧称 anon key にあたるもので、ブラウザに公開される前提の鍵です。データの保護は Supabase 側の RLS（Row Level Security）で行います。

Secret key（`sb_secret_...` / 旧 `service_role`）は RLS を無視できる管理者権限の鍵です。`NEXT_PUBLIC_` を付けるとブラウザに露出するため、絶対に付けないこと。`.env.local` は `.gitignore` 済みです。

Vercel へデプロイする場合は、同じ 2 つの変数を Vercel のプロジェクト設定にも登録してください。

### 3. 構成

| ファイル | 用途 |
| --- | --- |
| `lib/supabase/client.ts` | Client Component（`"use client"`）から使うクライアント |
| `lib/supabase/server.ts` | Server Component / Route Handler / Server Action から使うクライアント（リクエストごとに生成する） |
| `lib/supabase/proxy.ts` | アクセストークンを更新して Cookie を書き戻す処理 |
| `proxy.ts` | 上記をすべてのリクエストで実行する（Next.js 16 で `middleware.ts` から改称） |

セッションは Cookie で管理され、`proxy.ts` がトークンの更新を担当します。Server Component からは Cookie を書き込めないため、`proxy.ts` を消すとセッションが更新されず突然ログアウトされる原因になります。

Storage を使う場合は追加設定は不要で、上記のクライアントから `supabase.storage.from("バケット名")` で扱えます（バケットの作成と RLS ポリシー設定は Supabase ダッシュボード側で行う）。

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
