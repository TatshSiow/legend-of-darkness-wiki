<script lang="ts">
 import Hero from '#lib/components/Hero.svelte';
 import type {PageData} from './$types';
 let {data}:{data:PageData}=$props();
</script>
<Hero title="來源與驗證" eyebrow="PROVENANCE" description="遊戲原始資源、擷取版本與 SHA-256 雜湊，可下載各資料表交叉核對。"/>
<div class="notice">遊戲 {data.metadata.version} · 套件 {data.metadata.package} · 擷取日期 {data.metadata.extracted}。只收錄遊戲資源與機制筆記，未收錄個人存檔。</div>
<p class="source">APK SHA-256：{data.metadata.apkSha256}</p>
<div class="tablewrap"><table class="sources-table"><thead><tr><th>資料表</th><th>筆數</th><th>來源編碼</th><th>下載與雜湊</th></tr></thead><tbody>
{#each Object.entries(data.metadata.sources) as [key,source]}<tr><td><a href={`/data/${key}/`}>{data.categories.find(category=>category.key===key)?.name||key}</a><br>{source.path}</td><td>{source.count}</td><td>{source.textEncoding||'utf8'}{source.replacementCharacters?' · 有解碼缺字':''}</td><td><a href={`/data/${key}.json`} download>下載 JSON</a><details><summary>SHA-256</summary><p class="hash">原始加密資源：{source.encryptedSha256}</p><p class="hash">解析後 JSON：{source.jsonSha256}</p></details></td></tr>{/each}
</tbody></table></div>
<p><a href="/data/sources.json" download>下載來源與雜湊清單</a> · <a href="/data/icon-sources.json" download>下載圖示來源清單</a></p>
<p><a href="/data/item-mechanics-native.json" download>下載裝備／飾品／翅膀／幻化升級與精煉核對資料</a>：包含原版程式位址、APK 雜湊、逐級常數及計算案例；不含個人存檔。</p>
<h2>數值核對資料</h2><ul class="known"><li><a href="/data/enemy-difficulty-native.json" download>敵人品質／難度階段資料（未套角色調整）</a></li><li><a href="/data/enemy-difficulties.csv" download>敵人品質／難度 CSV（含技能與抗性）</a></li><li><a href="/data/enemy-paragon-reference.json" download>一般冒險巔峰縮放核對</a></li><li><a href="/data/drop-rate-evidence.json" download>掉落流程依據</a></li><li><a href="/data/drop-rate-native-boundaries.json" download>掉落判定邊界核對</a></li><li><a href="/data/skin-unlock-reference.json" download>幻化解鎖參考機率</a></li></ul>
