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
  <div class="cards">
  {#each group.links??[] as link}<a class="card" href={link.href}><Icon src={data.routeIcons[link.href]}/><span class="card-copy"><h3>{link.name}</h3><small>{link.hint}</small></span><span class="card-arrow" aria-hidden="true">↗</span></a>{/each}
  {#each group.categories as key}
   {@const category=data.categories.find(category=>category.key===key)}
   {#if category}<a class="card" href={`/data/${category.key}/`}><Icon src={category.icon}/><span class="card-copy"><h3>{category.name}</h3><small>{category.count} 筆資料</small></span><span class="card-arrow" aria-hidden="true">↗</span></a>{/if}
  {/each}</div>
 </section>
{/each}
<div class="notice">遊戲 {data.version} 的原始資料。品質、強化、難度及戰鬥效果可能改變最終數值；未驗證的代碼保留原名。</div>
<style>
 .overview-group{margin:26px 0}.overview-group h2{margin-bottom:4px}.group-description{color:var(--muted);margin:0 0 12px;font-size:13px}
 .cards{grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}
 .cards .card{min-height:88px;padding:16px;display:flex;flex-direction:row;align-items:center;justify-content:flex-start;gap:14px;background:radial-gradient(ellipse at 0 50%,#b88b3320,transparent 75%),linear-gradient(135deg,#241c14,#17130f);transition:border-color .15s,background .15s}
 .card:hover,.card:focus-visible{border-color:var(--gold);background:#302417}.card-copy{flex:1;min-width:0}.card h3{font-size:16px;margin:0 0 5px}.card-copy small{color:var(--muted);font-size:11px}.card-arrow{color:var(--gold);opacity:.65}.card:hover .card-arrow{opacity:1}
 @media(max-width:550px){.cards{grid-template-columns:1fr}}
</style>
