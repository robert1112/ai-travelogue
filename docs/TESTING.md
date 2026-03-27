# 測試指引 (Local Testing Guide)

在部署到 Vercel 之前，建議您先在本地環境完成以下測試：

## 1. 資料庫同步 (Prisma Sync)
請確保您的 `DATABASE_URL` 已正確填寫 (不論是本地 Postgres 或是 Supabase)；隨後執行：
```bash
npx prisma db push
```
這會在您的資料庫中建立 `User`、`Account`、`Session` 等認證所需的資料表。

## 2. 啟動開發伺服器
```bash
npm run dev
```

## 3. 測試 Magic Link 登入
1. 開啟瀏覽器訪問 `http://localhost:3000`。
2. 點擊右上角的 **「Sign In」**。
3. 輸入您的電子郵件並點擊 **「Send Magic Link」**。
4. **檢查信箱**：
   - 如果成功，您應該會收到一封由 `travel@flippage.tw` 發出的登入信。
   - 點擊信中的連結後，系統應該會自動將您重新導向回預覽頁面，且右上角會顯示為 **「Sign Out」**。

## 4. 測試「發佈」按鈕
1. 登入後，點擊畫面上的 **「Publish」** 按鈕。
2. 目前按鈕應該會顯示 **「Publishing...」** 隨後變為 **「Published」**。 (目前僅為 Mock 邏輯，下一階段將串接資料庫儲存)。

---

# 下一步是什麼？ (Next Steps)

1. **GitHub 推送**：
   - 將目前的代碼推送到您的 GitHub Repo。
2. **Vercel 部署**：
   - 在 Vercel 建立新專案，並連結您的 Repo。
   - 參照專案內的 [docs/VERCEL.md](file:///Users/robertchen/App/ai-travelogue/docs/VERCEL.md) 填入所有環境變數。
3. **域名授權 (Kirim.email)**：
   - 請確保 `travel@flippage.tw` 所在的域名已在 Kirim.email 通過 SPF/DKIM 等驗證，否則信件可能會進入垃圾郵箱。
4. **正式 MVP 開放**：
   - 部署完成後，您就可以將 Vercel 網址提供給種子用戶進行測試了！銷。
