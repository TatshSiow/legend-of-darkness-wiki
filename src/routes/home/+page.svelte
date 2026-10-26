<script lang="ts">
 import Hero from '#lib/components/Hero.svelte';
 import Icon from '#lib/components/Icon.svelte';
 import {navigationGroups} from '#lib/core/navigation.ts';
 import type {PageData} from './$types';
 let {data}:{data:PageData}=$props();
</script>
<Hero title="資料總覽" eyebrow="THE COMPENDIUM" description="從人物養成、寵物、裝備或地圖開始，查詢能力、素材與取得方式。"/>
<div class="stats"><div class="stat"><strong>{data.categories.reduce((n,c)=>n+c.count,0).toLocaleString()}</strong><span>收錄條目</span></div><div class="stat"><strong>{data.categories.find(c=>c.key==='enemy')?.count.toLocaleString()}</strong><span>敵人條目</span></div><div class="stat"><strong>{data.categories.find(c=>c.key==='item')?.count.toLocaleString()}</strong><span>物品與裝備</span></div><div class="stat"><strong>{navigationGroups.length}</strong><span>主題分類</span></div></div>
{#each navigationGroups as group}
 <section class="overview-group" aria-label={group.name}>
  <h2>{group.name}</h2><p class="group-description">{group.description}</p>
  {#if group.links}<div class="map-links">{#each group.links as link}<a class="btn" href={link.href}>{link.name} <small>{link.hint}</small> →</a>{/each}</div>{/if}
  <div class="cards">{#each group.categories as key}
   {@const category=data.categories.find(category=>category.key===key)}
   {#if category}<a class="card" href={`/data/${category.key}/`}><small>{category.count} 筆 →</small><Icon src={category.icon}/><h3>{category.name}</h3></a>{/if}
  {/each}</div>
 </section>
{/each}
<div class="notice">遊戲 {data.version} 的原始資料。品質、強化、難度及戰鬥效果可能改變最終數值；未驗證的代碼保留原名。</div>
<style>
 .overview-group{margin:32px 0}.overview-group h2{margin-bottom:4px}.group-description{color:var(--muted);margin:0 0 16px;font-size:13px}.map-links{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:16px}.map-links small{margin-left:8px;color:var(--muted)}.cards{grid-template-columns:repeat(auto-fill,minmax(190px,1fr))}.card{padding:16px}.card h3{margin:10px 0 0}
</style>
