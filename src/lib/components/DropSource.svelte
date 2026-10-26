<script lang="ts">
 import EntryLink from './EntryLink.svelte';
 import type {Reward} from '#lib/server/data.ts';
 let {reward}:{reward:Reward}=$props();
</script>
<div class="drop-source-monsters">
 {#each reward.enemies as enemy}<div class="drop-source-enemy"><EntryLink record={enemy}/><span class="drop-source-locations">{#each reward.locations as location}<a href={location.href}>{location.name}</a>{:else}<span>地點待核對</span>{/each}</span></div>{:else}<span class="data-note">未有可確認的怪物資料</span>{/each}
</div>
{#if reward.enemies.length>1}<small class="shared-drop-note">同一關卡共用獎勵，非每隻各抽一次</small>{/if}
<style>.drop-source-enemy{display:flex;align-items:center;flex-wrap:wrap;gap:6px 12px}.drop-source-locations{display:flex;flex-wrap:wrap;gap:3px 8px;font-size:11px}.drop-source-locations a{color:var(--muted)}.drop-source-locations a:hover{color:var(--gold);text-decoration:underline}</style>
