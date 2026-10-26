<script lang="ts">
 import EntryLink from './EntryLink.svelte';
 import type {DropHint} from '#lib/server/data.ts';
 let {hints}:{hints:DropHint[]}=$props();
</script>
{#if hints.length}
 <section class="game-drop-hints">
  <h3>遊戲內掉落提示</h3>
  <p class="data-note">這是遊戲預覽介面的提示清單，多個關卡可能共用同一組。提示未提供數量與機率，也不保證實際掉落；已核對的掉落率另列於「可掉落道具」。</p>
  <div class="tablewrap"><table><thead><tr><th>提示道具</th><th>適用關卡</th></tr></thead><tbody>
   {#each hints as hint}{#each hint.items as item}<tr><td><EntryLink record={item}/></td><td>{#each hint.sources as source}<EntryLink record={source}/>{/each}</td></tr>{/each}{/each}
  </tbody></table></div>
 </section>
{/if}
