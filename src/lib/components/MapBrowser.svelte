<script lang="ts">
 import Hero from './Hero.svelte';
 import RegionCards from './RegionCards.svelte';
 import {mapTabs,otherMapTabs} from '#lib/core/region-navigation.ts';
 import type {regionBrowser} from '#lib/server/data.ts';
 let {data}:{data:NonNullable<ReturnType<typeof regionBrowser>>}=$props();
</script>
<div data-pagefind-ignore="all">
 <Hero title={data.activeCategory==='adventure'?'地區圖鑑':data.categoryName} eyebrow="REGIONS & DIFFICULTY" description="選擇地圖類別與地區，查看怪物、技能、各難度屬性及掉落。"/>
 <nav class="map-tabs" aria-label="地圖分類">
  {#each mapTabs as tab}<a href={tab.href} class:active={data.activeGroup===tab.key} aria-current={data.activeGroup===tab.key?'true':undefined}>{tab.name}</a>{/each}
 </nav>
 {#if data.activeGroup==='other'}<nav class="map-subtabs" aria-label="其他副本分類">
  {#each otherMapTabs as tab}<a href={tab.href} class:active={data.activeCategory===tab.key} aria-current={data.activeCategory===tab.key?'page':undefined}>{tab.name}</a>{/each}
 </nav>{/if}
 <section class="region-section" aria-labelledby="map-category-title">
  <div class="map-section-heading"><h2 id="map-category-title">{data.categoryName}</h2><span>{data.regions.length} 個{data.activeCategory==='adventure'?'地區':'關卡'}</span></div>
  {#if data.activeCategory==='portal'}
   {#each data.portals as portal}<details id={portal.key} class="portal-group"><summary>{portal.name}<small>{portal.regions.length} 個關卡</small></summary><RegionCards regions={portal.regions}/></details>{/each}
  {:else}<RegionCards regions={data.regions}/>{/if}
 </section>
 {#if data.extras.length}<details class="region-section other-battles"><summary>其他戰鬥資料（非上述副本選單）</summary><RegionCards regions={data.extras}/></details>{/if}
</div>
