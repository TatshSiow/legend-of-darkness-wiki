<script lang="ts">
 import EntryLink from './EntryLink.svelte';
 import ExchangePool from './ExchangePool.svelte';
 import type {ExchangeInfo} from '#lib/server/data.ts';
 let {info,stage}:{info:ExchangeInfo;stage?:number}=$props();
</script>
<section class="exchange-details">
 {#if info.boost}
  <p>每階增加 {info.boost.amount}{info.boost.unit}，依序兌換；累計效果為額外增加的數值。</p>
  <div class="tablewrap"><table class="exchange-tiers"><thead><tr><th>階段</th><th>本階增加</th><th>累計效果</th><th>本階積分</th><th>從零累計積分</th><th>前置條件</th></tr></thead><tbody>
   {#each info.tiers as tier}<tr class:current={stage===tier.stage}><th><a href={tier.record.href}>第 {tier.stage} 階{stage===tier.stage?'（本頁）':''}</a></th><td>+{info.boost.amount}{info.boost.unit}</td><td>{tier.effect}</td><td>{tier.point.toLocaleString()}</td><td>{tier.totalPoints.toLocaleString()}</td><td>{tier.stage===1?'尚未兌換此增益':`先取得第 ${tier.stage-1} 階`}</td></tr>{/each}
  </tbody></table></div>
 {:else}
  {#if info.pool.length}<h3>獎勵池</h3><ExchangePool {info}/>{/if}
  {#if info.target}<h3>{info.kind==='幻化解鎖'?'解鎖幻化':info.kind==='稱號解鎖'?'取得稱號':'取得對象'}</h3><EntryLink record={info.target}/>{/if}
  {#if info.kind==='幻化解鎖'}<p>兌換後解鎖此幻化，不是取得背包道具，也不代表直接升滿幻化等級。</p>{/if}
  <h3>兌換需求</h3><div class="tablewrap"><table class="exchange-requirements"><tbody><tr><th>消耗積分</th><td>{info.point.toLocaleString()}</td></tr>
   {#if info.requiredLevel>0}<tr><th>角色等級門檻</th><td>Lv. {info.requiredLevel}</td></tr>{/if}
   {#if info.achievementPoints>0}<tr><th>成就點數條件</th><td>{info.achievementPoints}</td></tr>{/if}
   {#if info.material}<tr><th>需求材料</th><td><EntryLink record={info.material} quantity={info.materialCount}/></td></tr>{/if}
  </tbody></table></div>
 {/if}
</section>
<style>.current{background:#b48d3420}.exchange-tiers td{white-space:nowrap}</style>
