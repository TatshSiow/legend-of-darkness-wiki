# 黑暗傳說 Wiki · Legend of Darkness

《黑暗傳說》11.01 非官方遊戲資料庫，使用 SvelteKit、TypeScript 與原版遊戲圖示。

提供地區與副本、深淵、試煉、怪物技能、物品裝備、寵物、幻化、成就、稱號、商店、積分兌換與合成配方查詢，包含裝備成長、素材成本及掉落機率。

## 開發

需要 Node.js **22.18 或更新版本**。

```sh
git clone https://github.com/TatshSiow/legend-of-darkness-wiki.git
cd legend-of-darkness-wiki
npm ci
npm run dev
```

開啟 <http://127.0.0.1:5174>。開發模式即時更新；Pagefind 全文搜尋索引於正式建置時產生。

## 驗證與建置

```sh
npm run check
npm test
npm run build
npm run test:build
```

瀏覽器測試：先執行 `npx playwright install chromium`，另開終端啟動 `npm run preview`，再執行 `npm run test:browser`。其他 `test/*-browser.mjs` 為 dev server 的個別介面測試。

## 部署

將 **`build/` 整個目錄**部署到支援目錄 `index.html` 的靜態主機。不需常駐 Node.js 服務，不需將所有網址改寫成首頁。不存在的網址應以 `404.html` 回應 HTTP 404。

在建置環境設定 `SITE_URL` 為正式網站根網址，即可產生 canonical URL 與 sitemap；未設定時不假定網域。

## 結構

| 目錄 | 用途 |
| --- | --- |
| `src/routes/` | 頁面、載入及舊址轉向 |
| `src/lib/components/` | 共用卡片、表格、掉落及成長介面 |
| `src/lib/core/` | 型別、公式與顯示規則 |
| `src/lib/server/` | 原始資料、圖示映射及關聯查詢 |
| `static/icons/` | 遊戲原版圖示 |
| `static/data/` | 資料下載、程式查核依據及限制 |
| `test/` | 資料、公式、關聯及介面測試 |

正常開發、測試與建置不需要手機、存檔或 APK。完整資料在伺服器／建置端處理；瀏覽器取得各頁需要的資料，搜尋按需載入分塊。

## 資料完整性

目前有 17 個公開分類、2,692 個條目，包含成就 169 筆、稱號 115 筆。保留原始資料列及編號供查證；部分舊資料不在公開圖鑑收錄。

資料來自原版資源與已核對的程式邏輯。線索、原始參數及實戰數值分開呈現，不推測未知機率、取得來源或伺服器限制。目前仍有 56 個特殊稱號的取得條件待確認，部分特殊來源的門檻與機率亦未完全核實。

圖像及遊戲內容屬原權利人所有。本專案為非官方資料整理，與官方無關。維護規則見 [AGENTS.md](AGENTS.md)。
