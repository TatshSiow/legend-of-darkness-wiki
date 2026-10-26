<script lang="ts">
 import Currency from './Currency.svelte';
 import EntryLink from './EntryLink.svelte';
 import {attrNames,fieldValue} from '#lib/core/fields.ts';
 import {equipmentCosts,strengthCost,equipmentStat,scaledStat,specialAttributes,scoreNames,randomAttributeRange,refineCost} from '#lib/core/item-mechanics.ts';
 import type {GameRecord} from '#lib/core/types.ts';
 import type {ItemProgression} from '#lib/server/data.ts';
 let {row,progression:p}:{row:GameRecord;progression:ItemProgression}=$props();
 let paragon=$state(0),ancient=$state(false),quality=$derived(Number(row.quality)||1),level=$derived(Number(row.level)||1),playerLevel=$state(80),playerParagon=$state(0),offset=$state(0);
 let refines=$state(0),discount=$state(false);
 const number=(n:number)=>n.toLocaleString('zh-TW',{maximumFractionDigits:4});
 let valid=$derived(Number.isInteger(level)&&level>=1&&level<=80&&Number.isInteger(paragon)&&paragon>=0&&paragon<=1500&&Number.isInteger(offset)&&offset>=0&&offset<=1000000&&Number.isInteger(playerLevel)&&playerLevel>=1&&playerLevel<=80&&Number.isInteger(playerParagon)&&playerParagon>=0&&playerParagon<=1500);
 let context=$derived({level,quality,paragon:row.paragon||p.kind==='badge'?paragon:0,ancient});
 let costs=$derived(valid&&p.kind==='equipment'?equipmentCosts(context):null);
 let attributes=$derived(specialAttributes(row));
 let max=$derived(p.kind==='equipment'?18:p.kind==='accessory'?5:p.kind==='wing'?60:15);
 let steps=$derived(Array.from({length:max+1},(_,i)=>i));
 function main(step:number,grade:number,score:number){return equipmentStat(Number(row.mainvalue)+offset,step,grade,score,context.paragon,p.multipliers,p.scoreMultipliers);}
 function accessory(value:number,type:number,step:number){if(type===20)return value;const scaled=Math.fround(Math.fround(value)*p.multipliers[step]);return Math.trunc(row.specialgrow?Math.fround(scaled*(playerLevel+Math.trunc(playerParagon/10))):scaled);}
 const material=(id:number)=>p.materials.find(m=>m.id===id)?.record??null;
</script>

<section class="item-progression" aria-label="升級與製作資料">
 {#if p.kind==='equipment'}
  <h2>強化與重鑄</h2>
  <div class="score-legend" aria-label="裝備評分">{#each scoreNames as name,grade}<span class={`score-badge score-${grade+1}`}>{name}</span>{/each}</div>
  <p class="data-note">強化上限 +18。以下計算此物品的主屬性；固定詞條、隨機詞條與附魔另計。星級增加的主屬性可填入下方欄位。</p>
  <div class="progression-controls">
   {#if p.qualities.length>1}<label>裝備版本<select bind:value={quality}>{#each p.qualities as q}<option value={q}>{fieldValue('item','quality',q)}</option>{/each}</select></label>{/if}
   {#if row.paragon}<label>裝備巔峰等級<input type="number" min="0" max="1500" step="1" bind:value={paragon}/></label>{/if}
   <label>星級主屬性加值<input type="number" min="0" max="1000000" step="1" bind:value={offset}/></label>
   <label class="check-control"><input type="checkbox" bind:checked={ancient}/> 遠古裝備</label>
  </div>
  <p class="data-note">目前版本：「{fieldValue('item','quality',quality)}」。費用依此版本的品質計算。重鑄評分為獨立系統，可比較下方四種評分的屬性範圍。</p>
  {#if p.qualities.length>1}<p class="data-note">此裝備有可核對的掉落來源；原版掉落流程可將史詩裝備生成為神器，並非每次必定取得神器。神器星級與額外屬性由生成結果決定，請填入實際的星級主屬性加值；下表不自動假設滿星數值。<a href="/data/equipment-variants-native.json">生成規則核對</a></p>{/if}
  {#if valid&&costs}
   <h3>重鑄與附魔成本（每次）</h3>
   <div class="tablewrap"><table class="craft-costs"><thead><tr><th>操作</th><th>金幣</th><th>魔石</th><th>材料</th></tr></thead><tbody>
    <tr><th>重鑄</th><td><Currency kind="gold" value={costs.reset.gold}/></td><td>—</td><td><EntryLink record={material(5004)} id={5004} quantity={costs.reset.materials}/></td></tr>
    <tr><th>金幣附魔</th><td><Currency kind="gold" value={costs.enchantGold}/></td><td>—</td><td>無</td></tr>
    <tr><th>魔石附魔</th><td>—</td><td><Currency kind="money" value={costs.enchantMoney}/></td><td>無</td></tr>
   </tbody></table></div><p class="data-note">附魔選一種付費方式。魔石是貨幣，與重鑄材料「魔力之石」不同。</p>
   <h3>每級主屬性與評分範圍</h3>
   <p class="data-note">每欄為該評分 1～100 分的最小～最大「{attrNames[Number(row.maintype)]||'主屬性'}」。素材為本級升至下一級的一次嘗試成本，並非保證成功或累計成本。+15 起可另加普通強化石提高成功率。</p>
   <div class="tablewrap"><table class="upgrade-levels"><thead><tr><th>強化</th>{#each scoreNames as name,grade}<th class={`score-${grade+1}`}>{name}</th>{/each}<th>升下一級素材</th><th>可選追加素材</th></tr></thead><tbody>
    {#each steps as step}<tr><th>+{step}</th>{#each scoreNames as _,grade}<td class={`score-${grade+1}`}>{number(main(step,grade+1,1))}～{number(main(step,grade+1,100))}</td>{/each}<td>{#if step<18}{@const cost=strengthCost(context,step)}<EntryLink record={material(cost.id)} id={cost.id} quantity={cost.primary}/>{:else}已達上限{/if}</td><td>{#if step>=15&&step<18}<EntryLink record={material(5003)} id={5003} quantity={strengthCost(context,step).supplement}/>{:else}—{/if}</td></tr>{/each}
   </tbody></table></div>
  {:else}<p role="alert">請輸入範圍內的整數。</p>{/if}
 {:else if p.kind==='accessory'||p.kind==='wing'}
  <h2>{p.kind==='wing'?'翅膀':'飾品'}逐級屬性與升級素材</h2>
  <p class="data-note">上限 +{max}。素材與金幣列在目前等級，代表升至下一級的單次需求。</p>
  {#if row.specialgrow}<div class="progression-controls"><label>角色等級<input type="number" min="1" max="80" step="1" bind:value={playerLevel}/></label><label>角色巔峰等級<input type="number" min="0" max="1500" step="1" bind:value={playerParagon}/></label></div><p class="data-note">成長型飾品屬性會再乘上「角色等級＋角色巔峰等級÷10 取整」。這裡未加入巔峰1500後額外的裝備經驗成長。</p>{/if}
  {#if valid}<div class="tablewrap"><table class="upgrade-levels"><thead><tr><th>等級</th>{#if p.kind==='wing'}<th>{attrNames[Number(row.maintype)]||'主屬性'}</th><th>副屬性參數</th>{:else}{#each attributes as a}<th>{attrNames[a.type]||`效果 ${a.type}`}</th>{/each}{/if}<th>升下一級金幣</th><th>升下一級素材</th></tr></thead><tbody>
   {#each steps as step}<tr><th>+{step}</th>{#if p.kind==='wing'}<td>{number(scaledStat(Number(row.mainvalue),p.multipliers[step]))}</td><td>{number(scaledStat(Number(row.subvalue),p.multipliers[step]))}</td>{:else}{#each attributes as a}<td>{number(accessory(a.value,a.type,step))}</td>{/each}{/if}
    <td>{#if step===max}—{:else}<Currency kind="gold" value={p.recipes[step]?.gold||0}/>{/if}</td><td>{#if step===max}已達上限{:else if p.recipes[step]?.materials.length}{#each p.recipes[step].materials as m}<span class="material-line"><EntryLink record={material(m.id)} id={m.id} quantity={number(m.quantity)}/></span>{/each}{#if p.recipes[step].recipe}<a class="source" href={p.recipes[step].recipe!.href}>查看配方</a>{/if}{:else}未找到升級配方{/if}</td></tr>{/each}
  </tbody></table></div>{:else}<p role="alert">請輸入範圍內的整數。</p>{/if}
  {#if p.kind==='wing'}<h3>特殊屬性解鎖</h3><div class="tablewrap"><table><thead><tr><th>解鎖等級</th><th>屬性</th><th>數值</th></tr></thead><tbody>{#each attributes as a,i}<tr><td>+{p.wingUnlockLevels[i]}</td><td>{attrNames[a.type]||`效果 ${a.type}`}</td><td>{a.value}</td></tr>{/each}</tbody></table></div><p class="data-note">特殊屬性依強化等級逐條解鎖；表內數值不乘主屬性倍率。</p>{/if}
 {:else if p.kind==='legend'}
  <h2>傳奇寶石逐級屬性</h2><p class="data-note">以裝備自身的成長經驗升級，不套用普通強化石。主屬性另有生成時的 20%～100% 加值；表內列出完整範圍。附加詞條每級乘上「等級＋1」。</p>
  <div class="tablewrap"><table class="upgrade-levels"><thead><tr><th>等級</th><th>{attrNames[Number(row.maintype)]}</th><th>附加詞條倍率</th><th>升下一級經驗</th></tr></thead><tbody>{#each steps as step}<tr><th>Lv. {step}</th><td>{Math.trunc(Math.fround(Math.fround(Number(row.mainvalue)*Math.fround(1.2))*(step+1)))}～{Number(row.mainvalue)*2*(step+1)}</td><td>×{step+1}</td><td>{step===15?'已達上限':p.legendNeedExp[step]}</td></tr>{/each}</tbody></table></div>
 {:else}
  <h2>{p.kind==='badge'?'徽章':'幻化符文'}成長方式</h2><p class="data-note">{p.kind==='badge'?'徽章採用生成等級、品質與隨機詞條，不套用主裝備 +18 或飾品 +5。相同徽章 ID 的實際屬性會因生成結果不同。':'幻化符文依品質生成詞條，神器為 4 條；各條作用於幻化本身相同的屬性，每條加成獨立計算。它沒有普通裝備的強化等級。'}</p>
  {#if p.kind==='badge'}<div class="progression-controls"><label>徽章等級<input type="number" min="1" max="80" step="1" bind:value={level}/></label><label>裝備巔峰等級<input type="number" min="0" max="1500" step="1" bind:value={paragon}/></label><label class="check-control"><input type="checkbox" bind:checked={ancient}/> 遠古裝備</label></div>{/if}
 {/if}
 {#if p.randomAttributes.length&&valid}
  <h3>詞條精煉成本</h3>
  <div class="progression-controls">
   {#if p.kind==='badge'||p.kind==='rune'}<label>生成品質<select bind:value={quality}>{#each (p.kind==='rune'?[3,4,5,6]:[1,2,3,4,5,6]) as q}<option value={q}>{fieldValue('item','quality',q)}</option>{/each}</select></label>{/if}
   <label>已精煉次數<input type="number" min="0" max="999" step="1" bind:value={refines}/></label><label class="check-control"><input type="checkbox" bind:checked={discount}/> 套用素材 8 折增益</label>
  </div>
  {#if Number.isInteger(refines)&&refines>=0&&refines<=999}
   {@const cost=refineCost(p.kind,level,quality,context.paragon,refines,discount)}
   <div class="tablewrap"><table class="refine-costs"><thead><tr><th>金幣</th><th>魔石</th><th>所需素材</th></tr></thead><tbody><tr><td>{#if p.kind==='rune'}—{:else}<Currency kind="gold" value={cost.price}/>{/if}</td><td>{#if p.kind==='rune'}<Currency kind="money" value={cost.price}/>{:else}—{/if}</td><td><span class="material-line"><EntryLink record={material(5118)} id={5118} quantity={cost.material1}/></span>{#if p.kind==='rune'}<span class="material-line"><EntryLink record={material(5218)} id={5218} quantity={cost.material2}/></span>{/if}</td></tr></tbody></table></div>
   <p class="data-note">本次精煉一條詞條的費用；次數為該物品的累計精煉次數。8 折僅適用於已取得相應增益的角色，影響素材數量，不減免貨幣。</p>
  {:else}<p role="alert">精煉次數請填入 0～999 的整數。</p>{/if}
  <h3>隨機詞條屬性範圍</h3><p class="data-note">{p.kind==='equipment'?'巔峰裝備共 5 條，包含物品本身固定詞條；以下為可抽選詞條的單條範圍。':p.kind==='badge'?'徽章詞條數為品質＋2；以下範圍依上方等級、巔峰與遠古條件計算。':'符文詞條數為品質－2：精良1條、傳說2條、史詩3條、神器4條。'}品質改變詞條數量，不直接乘上單條範圍。</p>
  {#if p.kind==='badge'}<div class="tablewrap"><table><thead><tr><th>品質</th>{#each [1,2,3,4,5,6] as q}<th>{fieldValue('item','quality',q)}</th>{/each}</tr></thead><tbody><tr><th>詞條數量</th>{#each [1,2,3,4,5,6] as q}<td>{q+2}</td>{/each}</tr></tbody></table></div>{/if}
  <div class="tablewrap"><table class="random-attributes"><thead><tr><th>屬性</th><th>最小值</th><th>最大值</th></tr></thead><tbody>{#each p.randomAttributes as descriptor}{@const range=p.kind==='rune'?{min:descriptor[1],max:descriptor[2]}:randomAttributeRange(descriptor,level,context.paragon,ancient,p.kind==='badge')}<tr><th>{attrNames[descriptor[0]]||`效果 ${descriptor[0]}`}</th><td>{range.min}</td><td>{range.max}</td></tr>{/each}</tbody></table></div>
 {/if}
 <p class="source">公式核對：遊戲 11.01 原版程式 · <a href="/data/item-mechanics-native.json">計算核對資料</a></p>
</section>

<style>
 .score-legend{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}.score-badge{padding:3px 12px;border:1px solid currentColor;background:#17120e}.score-1{color:#b4b4b4}.score-2{color:#a4d5ff}.score-3{color:#dfa6ef}.score-4{color:#ffbc55}
 .progression-controls{display:flex;flex-wrap:wrap;gap:1rem;margin:1rem 0}.progression-controls label{display:flex;flex-direction:column;gap:.4rem}.progression-controls input[type=number]{width:10rem}.progression-controls .check-control{flex-direction:row;align-items:center}.material-line{display:block;margin:.35rem 0}.upgrade-levels td{white-space:nowrap}.item-progression h2{margin-top:2rem}
</style>
