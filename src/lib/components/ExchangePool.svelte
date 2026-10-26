<script lang="ts">
 import EntryLink from './EntryLink.svelte';
 import type {ExchangeInfo} from '#lib/server/data.ts';
 let {info}:{info:ExchangeInfo}=$props();
</script>
{#if info.pool.length}
<p>每次隨機取得 1 件；共 {info.pool.length} 種候選。星數與生成屬性依兌換方案，物品連結顯示基礎裝備資料。</p>
<table class="exchange-pool"><thead><tr><th>候選裝備</th><th>取得機率</th></tr></thead><tbody>{#each info.pool as item}<tr><td><EntryLink record={item}/></td><td>{100/info.pool.length}%</td></tr>{/each}</tbody></table>
{/if}
