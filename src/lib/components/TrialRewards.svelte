<script lang="ts">
 import EntryLink from './EntryLink.svelte';
 import type {trialBattle} from '#lib/server/data.ts';
 let {rewards}:{rewards:NonNullable<ReturnType<typeof trialBattle>>['rewards']}=$props();
 const names=['青銅','白銀','黃金'];
 let score=$state<number|null|undefined>();
 let rows=$derived(score==null?rewards:Number.isInteger(score)&&score>=0?rewards.filter(r=>r.score<=score!):[]);
</script>
<h2>結算獎勵池</h2>
<ol class="reward-flow"><li><strong>勝利累加分數</strong><span>繼續下一波，跨過分數不會直接發道具。</span></li><li><strong>失敗時結算</strong><span>以本次分數及難度，篩出可抽選的獎勵。</span></li><li><strong>每列各抽一次</strong><span>可能同時抽中多列；同一道具的多列獎勵可疊加。</span></li></ol>
<p class="notice">例如青銅本次結算 50 分：秘藥 ×2 有 60% 機率抽中，並非達到 50 分就必得。分數只決定哪些獎勵參與結算抽選。</p>
<div class="toolbar"><label for="trial-score">本次結算分數</label><input id="trial-score" type="number" min="0" step="1" placeholder="留空查看完整獎勵池" bind:value={score}/><span>{score==null?'完整獎勵池':'符合分數條件'}：{rows.length} 列</span></div>
<div class="tablewrap"><table class="trial-rewards"><thead><tr><th>可抽中獎勵</th>{#each names as name,i}<th class={`difficulty-${i+1}`}>{name}<small>每次結算抽中率／分數條件</small></th>{/each}</tr></thead><tbody>
{#each rows as reward}<tr><td>{#if reward.candidates.length>1}<small>抽中此列後，隨機取得以下一項</small>{/if}<div class="reward-candidates">{#each reward.candidates as candidate}{#if candidate.record}<EntryLink record={candidate.record} quantity={reward.quantity} quantityOnIcon/>{:else if candidate.conflictingItem}<div><EntryLink record={candidate.conflictingItem} quantity={reward.quantity} quantityOnIcon/><small>獎勵類型衝突，非已確認可取得獎勵。</small></div>{:else}<EntryLink record={null} id={candidate.id} quantity={reward.quantity} quantityOnIcon/>{/if}{/each}</div></td>{#each names as name,i}<td class={`difficulty-${i+1}`} data-sort-value={i+1>=reward.requiredDifficulty?reward.rate:-1}>{#if i+1>=reward.requiredDifficulty}<span class="reward-threshold"><strong>{reward.rate}%</strong><small>本次分數 ≥ {reward.score.toLocaleString('en-US')}</small></span>{:else}<span class="unavailable" aria-label="不適用">—</span>{/if}</td>{/each}</tr>
{:else}<tr><td colspan="4">目前沒有符合分數條件的獎勵；請輸入有效的非負整數。</td></tr>{/each}
</tbody></table></div>
<p class="data-note">青銅完整獎勵池 30 列、白銀 61 列、黃金 91 列，並非可獲得的獎勵數量。各列獨立判定，機率不需合計 100%；多選一的百分比是整列抽中率，不是其中每件道具的機率。圖示右下角為抽中後的數量。</p>
<details><summary>抽選規則與核對範圍</summary><p>難度與分數符合條件後，逐列以 0～99 的隨機值判定。門檻為「原始權重 ×（1 + 0.2 ×（該列來源難度 − 1））」經原版單精度運算後截斷；使用的是該列來源難度，同一列在更高難度不會再加成。所有 29 種實際組合均已用原版指令核對。未模擬完整結算、物品建立及入背包流程；資料衝突仍保留標記。</p><a href="/data/trial-reward-native.json" download>下載原版判定核對資料</a> · <a href="/data/trial-settlement-native.txt" download>結算流程查核依據</a></details>
<style>
.reward-flow{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;padding-left:22px;margin:20px 0}.reward-flow strong,.reward-flow span{display:block}.reward-flow span{color:var(--muted);font-size:12px;margin-top:6px}.toolbar input{max-width:190px}.reward-candidates{display:flex;flex-wrap:wrap;gap:12px;padding:5px 0}.reward-candidates>div>small{display:block}.trial-rewards{width:100%}.trial-rewards th:not(:first-child),.trial-rewards td:not(:first-child){text-align:center;white-space:nowrap;width:20%}.trial-rewards th small{color:var(--muted);font-size:10px;font-weight:normal;margin-top:4px}.difficulty-1{color:#d49a6a}.difficulty-2{color:#83c988}.difficulty-3{color:#f5a44b}.unavailable{color:var(--muted);opacity:.45}.reward-threshold{font-variant-numeric:tabular-nums}.reward-threshold strong,.reward-threshold small{display:block}.reward-threshold small{font-size:11px;color:var(--muted);margin-top:5px}
@media(max-width:600px){.reward-flow{grid-template-columns:1fr;gap:14px}.trial-rewards th,.trial-rewards td{padding:10px 8px}.reward-candidates{min-width:130px}.trial-rewards{font-size:12px}}
</style>
