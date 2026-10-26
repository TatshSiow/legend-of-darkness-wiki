<script lang="ts">import Icon from './Icon.svelte';let {regions}:{regions:{key:string;name:string;level:string;icon?:string;href:string}[]}=$props();</script>
<div class="region-grid flat-regions">{#each regions as region}<a class="region-card" href={region.href}><Icon src={region.icon?'/'+region.icon:null}/><span>{region.name}<small>{region.level}</small></span></a>{/each}</div>

