<script lang="ts">
 import EntryLink from './EntryLink.svelte';
 import type {trialBattle} from '#lib/server/data.ts';
 let {rewards}:{rewards:NonNullable<ReturnType<typeof trialBattle>>['rewards']}=$props();
 const names=['青銅','白銀','黃金'];
 let score=$state<number|undefined>();
 let rows=$derived(score===undefined?rewards:Number.isInteger(score)&&score>=0?rewards.filter(r=>r.score<=score!):[]);
</script>
<h2>分數獎勵對照</h2>
<p class="data-note">✓ 表示該難度達到所列積分後，可抽選這筆獎勵。白銀包含青銅，黃金包含全部難度；候選道具並非全部必得，多個候選時擇一。</p>
<div class="toolbar"><label for="trial-score">目前積分</label><input id="trial-score" type="number" min="0" step="1" placeholder="留空顯示全部" bind:value={score}/><span>顯示：{rows.length}／{rewards.length} 筆設定</span></div>
<div class="tablewrap"><table class="trial-rewards"><thead><tr><th>獎勵候選</th>{#each names as name,i}<th class={`difficulty-${i+1}`}>{name}<small>所需積分</small></th>{/each}</tr></thead><tbody>
{#each rows as reward}<tr><td>{#if reward.candidates.length>1}<small>以下擇一</small>{/if}<div class="reward-candidates">{#each reward.candidates as candidate}{#if candidate.record}<EntryLink record={candidate.record} quantity={reward.quantity} quantityOnIcon/>{:else if candidate.conflictingItem}<div><EntryLink record={candidate.conflictingItem} quantity={reward.quantity} quantityOnIcon/><small>獎勵類型衝突，非已確認可取得獎勵。</small></div>{:else}<EntryLink record={null} id={candidate.id} quantity={reward.quantity} quantityOnIcon/>{/if}{/each}</div></td>{#each names as name,i}<td class={`difficulty-${i+1}`} data-sort-value={i+1>=reward.requiredDifficulty?reward.score:-1}>{#if i+1>=reward.requiredDifficulty}<span class="reward-threshold"><span aria-label="適用">✓</span> {reward.score.toLocaleString('en-US')}</span>{:else}<span class="unavailable" aria-label="不適用">—</span>{/if}</td>{/each}</tr>
{:else}<tr><td colspan="4">請輸入有效積分；目前沒有符合門檻的獎勵。</td></tr>{/each}
</tbody></table></div>
<p class="data-note">青銅 30 筆、白銀累積 61 筆、黃金累積 91 筆。數量標於可堆疊道具圖示右下角；抽選率尚未完整核對，未將權重當成百分比。</p>
<style>
.toolbar input{max-width:160px}.reward-candidates{display:flex;flex-wrap:wrap;gap:12px;padding:5px 0}.reward-candidates>div>small{display:block}.trial-rewards{width:100%}.trial-rewards th:not(:first-child),.trial-rewards td:not(:first-child){text-align:center;white-space:nowrap;width:16%}.trial-rewards th small{display:block;color:var(--muted);font-size:10px;font-weight:normal;margin-top:4px}.difficulty-1{color:#d49a6a}.difficulty-2{color:#83c988}.difficulty-3{color:#f5a44b}.unavailable{color:var(--muted);opacity:.45}.reward-threshold{font-variant-numeric:tabular-nums}.reward-threshold>span{margin-right:4px}
@media(max-width:600px){.trial-rewards th,.trial-rewards td{padding:10px 8px}.reward-threshold>span{display:block;margin:0}.reward-candidates{min-width:130px}.trial-rewards{font-size:12px}}
</style>
