<script lang="ts">
 import Hero from '#lib/components/Hero.svelte';
 import Icon from '#lib/components/Icon.svelte';
 import type {PageData} from './$types';
 let {data}:{data:PageData}=$props();
</script>
<Hero title="黑暗世界，盡在典藏。" eyebrow="A COMPENDIUM OF THE DARK WORLD" description="查詢敵人、裝備與養成資料，追索合成和掉落來源。以遊戲原始資源為基礎，讓每個數值都有出處。"/>
<div class="stats"><div class="stat"><strong>{data.categories.reduce((n,c)=>n+c.count,0).toLocaleString()}</strong><span>原始資料記錄</span></div><div class="stat"><strong>1,107</strong><span>敵人條目</span></div><div class="stat"><strong>587</strong><span>物品與裝備</span></div><div class="stat"><strong>{data.categories.length}</strong><span>遊戲資料表</span></div></div>
<a class="region-entry" href="/regions/">按地區與難度探索 →</a><h2>探索資料庫</h2>
<div class="cards">{#each data.categories as category}<a class="card" href={`/data/${category.key}/`}><small>{category.count} ENTRIES →</small><Icon src={category.icon} large/><h3>{category.name}</h3></a>{/each}</div>
<div class="notice">遊戲 {data.version} 的原始資料。品質、強化、難度及戰鬥效果可能改變最終數值；未驗證的代碼保留原名。</div>
