<script lang="ts">
 import EntryLink from './EntryLink.svelte';
 import DropSource from './DropSource.svelte';
 import type {Reward} from '#lib/server/data.ts';
 import {skinUnlockRate} from '#lib/core/drops.ts';
 import {dropPoolNames,skinLevelBands,percent} from '#lib/core/rewards.ts';
 let {rewards}:{rewards:Reward[]}=$props();
 let drops=$derived(rewards.filter(r=>r.rates.length));
 let unlocks=$derived(rewards.filter(r=>r.unlock));
 let hints=$derived(rewards.filter(r=>r.draws.every(draw=>draw.field==='droptip')));
 let pending=$derived(rewards.filter(r=>!r.unlock&&!r.rates.length&&!r.draws.every(draw=>draw.field==='droptip')));
</script>
{#if drops.length}
 <h3>可掉落道具</h3>
 <p class="data-note">以下為掉落倍率 1 倍、一次掉落流程的參考值。「1 個（機率）」表示剛好取得 1 個，不含取得 2 個的情況。各道具獨立抽取，可同時取得多種道具；取得條件不同時分開列出。</p>
 <p class="data-note">來源列出該戰鬥的怪物；多隻怪物共用關卡獎勵，機率不代表每隻怪物各抽一次。怪物等級依該敵人條目顯示。</p>
 <div class="tablewrap"><table class="available-drops"><thead><tr><th>道具</th><th>來源怪物</th><th>掉落數量（掉落率）</th><th>額外條件</th></tr></thead><tbody>
 {#each drops as drop}<tr>
  <td><EntryLink record={drop.item} id={drop.itemId}/></td><td><DropSource reward={drop}/></td>
  <td class="drop-quantities">{drop.rates.filter(r=>r.percent>0).map(r=>`${r.quantity} 個（${percent(r.percent)}）`).join('、')||'不會掉落'}
   <details><summary>計算詳情</summary><p>0 個（{percent(drop.zeroRate ?? 0)}）</p>{#each drop.draws as draw}<p>{dropPoolNames[draw.field]||draw.field}：{percent(draw.rate ?? 0)} × {draw.checks} 次，每次 1 個</p>{/each}</details>
  </td><td class="drop-condition">{drop.condition}</td>
 </tr>{/each}</tbody></table></div>
{/if}
{#if unlocks.length}
 <h3>戰鬥結算幻化解鎖</h3>
 <p class="data-note">幻化直接加入收藏，並非背包道具。以下是已核對結算分支的參考機率，對應遊戲玩法尚未確認，不能當成所有戰鬥的實際機率；已解鎖者不重複取得。角色比關卡高出越多級，獎勵倍率越低。</p>
 <div class="tablewrap"><table class="skin-level-bands"><thead><tr><th>角色與關卡的等級差</th><th>獎勵倍率</th></tr></thead><tbody>{#each skinLevelBands as band}<tr><td>{band.label}</td><td>{band.multiplier} 倍</td></tr>{/each}</tbody></table></div>
 <div class="tablewrap"><table class="skin-unlocks"><thead><tr><th>幻化</th><th>戰鬥來源</th><th>解鎖機率（參考）</th><th>適用條件</th></tr></thead><tbody>
 {#each unlocks as drop}<tr><td><EntryLink record={drop.item} id={drop.itemId}/></td><td><DropSource reward={drop}/></td>
 <td class="drop-quantities">{percent(drop.unlockRate ?? 0)}／次{drop.checks>1?`，共 ${drop.checks} 次`:''}
  <details><summary>角色等級與機率</summary><div class="tablewrap"><table><thead><tr><th>角色等級</th><th>倍率</th><th>解鎖機率／次</th></tr></thead><tbody>
  {#each skinLevelBands as band,i}<tr><td>{i===0?`Lv. 1～${drop.copyLevel+band.max!}`:band.max===null?`Lv. ${drop.copyLevel+band.min} 以上`:`Lv. ${drop.copyLevel+band.min}～${drop.copyLevel+band.max}`}</td><td>{band.multiplier} 倍</td><td>{percent(skinUnlockRate(Number(drop.copy?.id),band.multiplier,true))}</td></tr>{/each}
  </tbody></table></div></details>
 </td><td class="drop-condition">玩法適用性待確認；須通過結算條件。{#if drop.copy?.id===1163}須在裝備欄位 9 佩戴「黑暗守護者」或「君王的榮耀」，並通過額外資源門檻（計數 ≥1080）；未達條件為 0%。{:else}無額外裝備門檻。{/if}</td></tr>{/each}
 </tbody></table></div>
 <details><summary>已核對的幻化解鎖計算</summary><p>原始分支的隨機值為 1～100000，普通門檻為 30，嚴格小於門檻時成功：倍率 1 倍為 0.029%。內部模式編號 0 對應的遊戲玩法尚未確認，編號 1～6 跳過此獎勵池。遠古守護者（1163）達成上述裝備與資源條件時，基礎門檻乘 400。</p><a href="/data/skin-unlock-reference.json" download>下載各關卡機率核對資料</a> · <a href="/data/specialdrop2-skin-verified.json" download>下載原生分支核對資料</a></details>
{/if}
{#if pending.length}
 <h3>其他取得線索（尚未確認掉落）</h3><p class="data-note">以下來自特殊欄位或遊戲提示，不代表打倒敵人就會掉落。</p>
 <div class="tablewrap"><table class="pending-drops"><thead><tr><th>項目</th><th>戰鬥來源</th><th>確認狀態</th></tr></thead><tbody>{#each pending as drop}<tr><td><EntryLink record={drop.item} id={drop.itemId}/></td><td><DropSource reward={drop}/></td><td class="drop-condition">待核對：{drop.condition}</td></tr>{/each}</tbody></table></div>
{/if}
{#if hints.length}
 <h3>遊戲內掉落提示（未確認取得）</h3><p class="data-note">以下來源僅在遊戲預覽提示中列出此物品，沒有數量或機率設定，不保證實際掉落。</p>
 <div class="tablewrap"><table class="hint-drops"><thead><tr><th>項目</th><th>提示來源</th></tr></thead><tbody>{#each hints as hint}<tr><td><EntryLink record={hint.item} id={hint.itemId}/></td><td><DropSource reward={hint}/></td></tr>{/each}</tbody></table></div>
{/if}
{#if rewards.length}<details data-pagefind-ignore><summary>掉落資料來源與計算方式</summary><p class="source">Copy::getDrops 0x76e468：rand()%10001，roll &lt; 門檻；Copy::getDropSpecial 0x76eaec。參考值尚未合併角色加成或整場戰鬥的多次掉落流程。</p><pre>{rewards.flatMap(r=>r.draws.map(d=>`${d.copyId} / ${d.itemId}: ${d.field}`)).join('\n')}</pre></details>{/if}
