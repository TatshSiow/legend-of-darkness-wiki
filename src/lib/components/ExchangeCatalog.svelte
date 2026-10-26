<script lang="ts">
 import Hero from './Hero.svelte';
 import EntryLink from './EntryLink.svelte';
 import ExchangeDetails from './ExchangeDetails.svelte';
 import ExchangePool from './ExchangePool.svelte';
 import type {listing} from '#lib/server/data.ts';
 let {groups}:{groups:NonNullable<NonNullable<ReturnType<typeof listing>>['exchangeGroups']>}=$props();
 let query=$state('');
 let selected=$state('');
 let filtered=$derived(groups.map(g=>({...g,entries:g.entries.filter(e=>`${g.name} ${e.record.name} ${e.record.english} ${e.record.id}`.toLowerCase().includes(query.toLowerCase()))})).filter(g=>g.entries.length));
 let active=$derived(filtered.find(g=>g.key===selected)?.key??filtered[0]?.key);
 function moveTab(event:KeyboardEvent,index:number){
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();
  const next=event.key==='Home'?0:event.key==='End'?filtered.length-1:(index+(event.key==='ArrowRight'?1:-1)+filtered.length)%filtered.length;
  selected=filtered[next].key;
  (event.currentTarget as HTMLElement).parentElement?.querySelectorAll<HTMLButtonElement>('[role=tab]')[next]?.focus();
 }
</script>
<div data-pagefind-ignore="all">
 <Hero title="積分兌換" eyebrow="POINT EXCHANGE" description="依兌換用途分類；永久增益按階段升級，幻化與稱號顯示實際解鎖對象。"/>
 <div class="toolbar"><input class="category-search" type="search" aria-label="搜尋此分類" placeholder="搜尋增益、幻化、寵物或 ID" bind:value={query}/></div>
 <div class="exchange-tabs" role="tablist" aria-label="兌換分類">{#each filtered as group,i}<button type="button" role="tab" id={`tab-${group.key.replace(':','-')}`} aria-controls={`exchange-${group.key.replace(':','-')}`} aria-selected={active===group.key} tabindex={active===group.key?0:-1} class:active={active===group.key} onclick={()=>selected=group.key} onkeydown={event=>moveTab(event,i)}>{group.name}</button>{/each}</div>
 {#each filtered.filter(g=>g.key===active) as group}
  <div role="tabpanel" aria-labelledby={`tab-${group.key.replace(':','-')}`} tabindex="0" id={`exchange-${group.key.replace(':','-')}`} class="exchange-group"><h2>{group.boost?'永久增益：':''}{group.name}</h2>
   {#if group.boost}<ExchangeDetails info={group.entries[0].info}/>
   {:else}<div class="tablewrap"><table><thead><tr><th>兌換內容</th><th>積分</th><th>需求等級</th><th>成就點數條件</th><th>需求材料</th></tr></thead><tbody>{#each group.entries as entry}<tr><td><EntryLink record={entry.record}/>{#if entry.info.pool.length}<details><summary>查看獎勵池（{entry.info.pool.length} 種）</summary><ExchangePool info={entry.info}/></details>{/if}</td><td>{entry.info.point.toLocaleString()}</td><td>{entry.info.requiredLevel?`Lv. ${entry.info.requiredLevel}`:'—'}</td><td>{entry.info.achievementPoints||'—'}</td><td>{#if entry.info.material}<EntryLink record={entry.info.material} quantity={entry.info.materialCount}/>{:else}—{/if}</td></tr>{/each}</tbody></table></div>{/if}
  </div>
 {:else}<p class="empty">沒有符合的兌換項目。</p>{/each}
</div>
<style>.exchange-tabs{display:flex;flex-wrap:wrap;gap:6px}.exchange-tabs button{flex:1 0 auto;padding:10px 14px;border:1px solid #8f733b55;background:#19140f;color:#b6a383;cursor:pointer}.exchange-tabs button.active{background:#b48d3420;color:#f0ce84;border-color:#bd9446}.exchange-tabs button:focus-visible{outline:2px solid #f0ce84;outline-offset:2px}.exchange-group{margin-top:1.5rem}</style>
