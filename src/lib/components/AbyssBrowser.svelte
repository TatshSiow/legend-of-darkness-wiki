<script lang="ts">
 import Hero from './Hero.svelte';import RegionCards from './RegionCards.svelte';
 import type {abyssBrowser} from '#lib/server/data.ts';
 let {data}:{data:NonNullable<ReturnType<typeof abyssBrowser>>}=$props();
</script>
<div data-pagefind-ignore="all"><Hero title="深淵" eyebrow="THE ABYSS" description="每12層一組，選擇樓層範圍查看深淵專屬敵人。"/>
<nav class="map-tabs" aria-label="深淵樓層範圍">{#each data.tabs as tab}<a href={tab.href} class:active={data.start===tab.start} aria-current={data.start===tab.start?'page':undefined}>{tab.label} 層</a>{/each}</nav>
<h2>第 {data.start}～{data.start+11} 層</h2><RegionCards regions={data.regions}/></div>
<style>
 .map-tabs{display:flex;flex-wrap:wrap}
 .map-tabs a{flex:1 0 auto;padding-inline:12px}
</style>
