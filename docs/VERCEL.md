# Vercel 部署指引 (AI Travelogue MVP)

為了讓少數人開始使用您的服務，請依照以下步驟在 Vercel 進行部署。

## 1. 準備生產環境資料庫
建議使用 **Supabase** 或 **Neon (PostgreSQL)**。
- 在 Supabase 建立專案後，取得 `DATABASE_URL` (Transaction mode, port 6543) 與 `DIRECT_URL` (Session mode, port 5432)。
- 將這些 URL 加入 Vercel 環境變數。

## 2. 設定 Google OAuth
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)。
2. 建立新專案，並進入 "APIs & Services" > "Credentials"。
3. 建立 "OAuth 2.0 Client ID"：
   - Application type: Web application
   - Authorized redirect URIs: `https://YOUR_VERCEL_DOMAIN.vercel.app/api/auth/callback/google`
4. 取得 `GOOGLE_CLIENT_ID` 與 `GOOGLE_CLIENT_SECRET`。

## 3. 設定 Kirim.email SMTP
取得 Kirim.email 的 SMTP 憑證：
- `EMAIL_SERVER`: `smtp://username:password@smtp.kirim.email:587`
- `EMAIL_FROM`: 您在 Kirim.email 驗證過的發信電郵。

## 4. Vercel 環境變數清單
在 Vercel 專案設定中新增以下變數：

| Key | Value 來源 (對應您提供的變數) |
|-----|-------------------|
| `AUTH_SECRET` | `BlIBY0mwPyGWmhx1FHbbpD4CULbsO1hKoU5u4sd33yQ=` |
| `AUTH_URL` | `https://YOUR_DOMAIN.vercel.app` |
| `DATABASE_URL` | **POSTGRES_PRISMA_URL** (6543 端口) |
| `DIRECT_URL` | **POSTGRES_URL_NON_POOLING** (5432 端口) |
| `EMAIL_SERVER` | `smtp://travel@flippage.tw:Tiger%23Novel%23Neon%23Wonder%231839@smtp.kirimemail.com:587` |
| `EMAIL_FROM` | `travel@flippage.tw` |
| `GOOGLE_CLIENT_ID` | (暫時停用，留空即可) |
| `GOOGLE_CLIENT_SECRET` | (暫時停用，留空即可) |
| `OPENAI_API_KEY` | 您的 OpenAI Key |

## 5. 部署後執行資料庫推送
部署完成後，請在本地執行以同步生產環境資料庫：
```bash
# 暫時將本地 .env 的 DATABASE_URL 改為生產環境 URL
npx prisma db push
```

## 6. 邀請測試
部署成功後，將 Vercel 的網址傳送給您的朋友。他們現在可以使用 Google 或 Magic Link 登入並進行預覽。
