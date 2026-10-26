<script lang="ts">
 import {page} from '$app/state';
 import {goto} from '$app/navigation';
 import {sortableTables} from '#lib/core/table-sort.ts';
 import {navigationGroups} from '#lib/core/navigation.ts';
 import type {LayoutData} from './$types';
 import '../base.css';import '../theme.css';import '../app.css';
 let {data,children}:{data:LayoutData;children:import('svelte').Snippet}=$props();
 let query=$state('');
 function search(event:SubmitEvent){event.preventDefault();void goto('/search/?q='+encodeURIComponent(query.trim()));}
 function shortcut(event:KeyboardEvent){if(event.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes((event.target as HTMLElement)?.tagName)&&!(event.target as HTMLElement)?.isContentEditable){event.preventDefault();document.querySelector<HTMLInputElement>('aside input[type="search"]')?.focus();}}
</script>
<svelte:window onkeydown={shortcut}/>
<svelte:head><meta name="theme-color" content="#12100f" />{#if data.siteUrl&&page.url.pathname!=='/search/'}<link rel="canonical" href={data.siteUrl+page.url.pathname}/>{/if}</svelte:head>
<aside data-pagefind-ignore>
 <a class="brand" href="/home/"><span class="sigil">◈</span><span>黑暗傳說<small>LEGEND OF DARKNESS</small></span></a>
 <div class="edition">遊戲資料典藏 <b>{data.version}</b></div>
 <form class="search" action="/search/" onsubmit={search}><span aria-hidden="true">⌕</span><input name="q" type="search" bind:value={query} placeholder="搜尋怪物、裝備、技能…" aria-label="全站搜尋"><button type="submit" aria-label="搜尋">↵</button></form>
 <nav id="nav" aria-label="資料分類">
  <a href="/home/" class:active={page.url.pathname==='/home/'}><span>資料總覽</span><small>INDEX</small></a>
  {#each navigationGroups as group}
   <div class="navgroup">{group.name}</div>
   {#each group.links??[] as link}<a href={link.href} class:active={page.url.pathname.startsWith(link.href)}><span>{link.name}</span><small>{link.hint}</small></a>{/each}
   {#each group.categories as key}
    {@const category=data.categories.find(category=>category.key===key)}
    {#if category}<a href={`/data/${category.key}/`} class:active={page.params.category===category.key}><span>{category.name}</span><small>{category.count}</small></a>{/if}
   {/each}
  {/each}
  <div class="navgroup">查詢工具</div>
  <a href="/formulas/" class:active={page.url.pathname==='/formulas/'}><span>公式與計算</span><small>TOOLS</small></a>
  <a href="/search/" class:active={page.url.pathname.startsWith('/search/')}><span>全站搜尋</span><small>SEARCH</small></a>
  <a href="/sources/" class:active={page.url.pathname==='/sources/'}><span>來源與驗證</span><small>{data.categories.length}</small></a>
 </nav><div class="sidefoot">原版遊戲圖示 · 遊戲 {data.version}<br>黑暗世界的資料典藏</div>
</aside>
<main>
 <div id="view" use:sortableTables>{@render children()}</div>
 <footer data-pagefind-ignore>Legend Of Darkness · 非官方資料庫 <span>原始資料 ≠ 戰鬥最終數值</span></footer>
</main>


<style>aside .search{width:100%;gap:8px;margin:0 0 18px;padding:8px 10px}aside .search input{font-size:11px}@media(max-width:800px){aside .search{margin:14px 0 0}}</style>
