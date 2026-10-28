<script lang="ts">
 import Currency from './Currency.svelte';
 import Icon from './Icon.svelte';
 import EntryLink from './EntryLink.svelte';
 import {attrNames,fieldValue} from '#lib/core/fields.ts';
 import {equipmentCosts,strengthCost,equipmentStat,scaledStat,specialAttributes,equipmentAffixes,socketCost,gemInsertionCost,gemRemovalCost,enchantRanks,enchantValue,scoreNames,randomAttributeRange,refineCost} from '#lib/core/item-mechanics.ts';
 import type {GameRecord} from '#lib/core/types.ts';
 import type {ItemProgression,Summary} from '#lib/server/data.ts';
 let {row,progression:p,record}:{row:GameRecord;progression:ItemProgression;record:Summary}=$props();
 let paragon=$state(0),ancient=$state(false),quality=$derived(Number(row.quality)||1),level=$derived(Number(row.level)||1),playerLevel=$state(80),playerParagon=$state(0),offset=$state(0);
 let refines=$state(0),discount=$state(false);
 let strength=$state(0),grade=$state(4),score=$state(100);
 let affixes=$derived(equipmentAffixes(row,p.randomAttributes));
 let fixed=$derived(affixes.fixed);
 const attributeName=(type:number)=>attrNames[type]?.replace(/%$/,'')||`效果 ${type}`;
 const unit=(type:number)=>[9,10,12,13,14,15,16,17,19,42,44,45,46,47,52].includes(type)?'%':'';
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
 {#if ['accessory','wing','badge'].includes(p.kind)}
  <section class="equipment-tooltip" aria-label="裝備詳情預覽" data-item-quality={quality}>
   <div class="tooltip-heading"><div><h1 class="item-name" data-pagefind-meta="title">{record.name}{p.kind!=='badge'&&strength?` +${strength}`:''}</h1><p class="tooltip-level">等級：<span>{level}{context.paragon?`(${context.paragon})`:""}</span></p></div><div class="tooltip-identity"><Icon src={record.icon} quality={quality} large eager/><span>{fieldValue('item','subtype',row.subtype,row)}</span></div></div>
   <div class="tooltip-body"><div class="tooltip-attributes">
    {#if p.kind==='wing'}<dl class="equipment-attributes"><div class="main-stat"><dt>攻擊：</dt><dd>{number(scaledStat(Number(row.mainvalue),p.multipliers[strength]))}</dd></div><div class="main-stat"><dt>生命：</dt><dd>{number(scaledStat(Number(row.subvalue),p.multipliers[strength]))}</dd></div></dl>{/if}
    <ul class="special-attributes">
     {#if p.kind==='badge'}
      {#each fixed as a}<li>{attributeName(a.type)} +{number(a.value)}{unit(a.type)}</li>{/each}
      {#each Array.from({length:quality+2}) as _}<li><a href="#random-affix-pool">隨機屬性</a></li>{/each}
     {:else}
      {#each attributes as a,i}<li class:locked={p.kind==='wing'&&strength<p.wingUnlockLevels[i]}>{#if p.kind==='wing'}[{i+1}] {/if}{attributeName(a.type)} +{number(p.kind==='accessory'?accessory(a.value,a.type,strength):a.value)}{unit(a.type)}{#if p.kind==='wing'&&strength<p.wingUnlockLevels[i]} <span class="unlock-label">[+{p.wingUnlockLevels[i]}解鎖]</span>{/if}</li>{/each}
     {/if}
    </ul>
   </div><nav class="equipment-actions" aria-label="裝備資料">{#if p.kind==='badge'}<a href="#random-affix-pool">洗練</a>{:else}<a href="#special-upgrades">升級</a>{/if}</nav></div>
   <div class="tooltip-costs"><small>售價</small><Currency kind="gold" value={Number(row.price)||0}/></div>
  </section>
  {#if p.kind!=='badge'}<details class="preview-settings"><summary>調整預覽 · 升級等級</summary><label>預覽升級<select bind:value={strength}>{#each steps as step}<option value={step}>+{step}</option>{/each}</select></label></details>{/if}
 {/if}
 {#if p.kind==='equipment'}
  <div class="equipment-layout">
  <section class="equipment-tooltip" aria-label="裝備詳情預覽" data-item-quality={quality}>
   <div class="tooltip-heading">
    <div><h1 class="item-name" data-pagefind-meta="title">{fieldValue('item','quality',quality)}：{record.name}{ancient?'［遠古］':''}{strength?` +${strength}`:''}</h1><p class="tooltip-level">等級：<span>{level}{context.paragon?`(${context.paragon})`:row.paragon?'（巔峰依生成）':''}</span></p></div>
    <div class="tooltip-identity"><Icon src={record.icon} quality={quality} large eager/><span class={`equipment-score score-${grade}`}>{scoreNames[grade-1]}</span><span>{fieldValue('item','subtype',row.subtype,{type:2})}</span>{#if quality===6}<small class="artifact-stat">星級依生成結果</small>{/if}</div>
   </div>
   <div class="tooltip-body">
    <div class="tooltip-attributes">
     {#if valid&&Number.isInteger(score)&&score>=1&&score<=100}
      <dl class="equipment-attributes"><div class="main-stat"><dt>{attributeName(Number(row.maintype))}：</dt><dd>{number(main(strength,grade,score))}</dd></div><div class="sub-stat" class:unlocked={strength>=12}><dt>{attributeName(Number(row.maintype))}：</dt><dd>{number(Number(row.subvalue)||0)}</dd><span class="unlock-label">[+12解鎖]</span></div></dl>
     {:else}<p role="alert">請輸入範圍內的整數；評分點數為 1～100。</p>{/if}
     <ul class="fixed-attributes" aria-label="附加屬性">
      {#each fixed as a}<li class="additional-stat"><span>{attributeName(a.type)} +{number(a.value)}{unit(a.type)}</span></li>{/each}
      {#each Array.from({length:affixes.randomCount}) as _}<li class="additional-stat"><a href="#random-affix-pool">隨機屬性</a></li>{/each}
     </ul>
     {#if !fixed.length&&!affixes.randomCount}<p class="tooltip-note">未配置附加詞條</p>{/if}
     {#if quality===6}<p class="artifact-stat tooltip-special">神器效果依生成的星級而定</p>{/if}
     {#if row.paragon}<p class="enhancement-stat tooltip-special">鑲嵌：最多 3 孔 <span class="socket-preview" aria-label="孔位上限 3 孔">◇ ◇ ◇</span></p>{/if}
    </div>
    <nav class="equipment-actions" aria-label="裝備資料"><a href="#equipment-strength">強化</a><a href="#equipment-reforge">重鑄</a><a href="#equipment-enchant">附魔</a>{#if row.paragon}<a href="#equipment-sockets">鑲嵌</a>{/if}</nav>
   </div>
   <div class="tooltip-costs"><small>售價</small><Currency kind="gold" value={Number(row.price)||0}/></div>
  </section>
  <div class="equipment-expenses">{#if valid&&costs}
   <h3 id="equipment-reforge">重鑄與附魔成本（每次）</h3>
   <div class="tablewrap"><table class="craft-costs" id="equipment-enchant"><thead><tr><th>操作</th><th>消耗</th></tr></thead><tbody>
    <tr><th>重鑄</th><td><div class="cost-items"><Currency kind="gold" value={costs.reset.gold}/><EntryLink record={material(5004)} id={5004} quantity={costs.reset.materials}/></div></td></tr>
    <tr><th>金幣附魔</th><td><Currency kind="gold" value={costs.enchantGold}/></td></tr>
    <tr><th>魔石附魔</th><td><Currency kind="money" value={costs.enchantMoney}/></td></tr>
   </tbody></table></div><p class="data-note">附魔選一種付費方式。魔石是貨幣，與重鑄材料「魔力之石」不同。</p>
   <h3>附魔屬性對照 · Lv. {level}</h3>
   <div class="tablewrap"><table class="enchant-values"><thead><tr><th>屬性</th>{#each enchantRanks as rank}<th>{rank}</th>{/each}</tr></thead><tbody>{#each [1,2,3,4,5,6,7,8] as type}<tr><th>{attributeName(type)}</th>{#each enchantRanks as _,i}<td>+{number(enchantValue(type,i+1,level))}</td>{/each}</tr>{/each}</tbody></table></div>
   <p class="data-note">一般裝備附魔，每次取得一項屬性；數值依裝備等級計算，不是百分比。此表不適用特殊飾品及徽章的附魔。</p>
{/if}</div></div>
  <details class="preview-settings"><summary>調整預覽 · 品質、巔峰、強化與評分</summary>
   <div class="progression-controls stat-controls">
    <label>預覽強化<select aria-label="預覽強化" bind:value={strength}>{#each steps as step}<option value={step}>+{step}</option>{/each}</select></label>
    <label>預覽評分<select aria-label="預覽評分" bind:value={grade}>{#each scoreNames as name,i}<option value={i+1}>{name}</option>{/each}</select></label>
    <label>評分點數<input type="number" min="1" max="100" step="1" bind:value={score}/></label>
   </div>
  <div class="progression-controls">
   {#if p.qualities.length>1}<label>裝備版本<select bind:value={quality}>{#each p.qualities as q}<option value={q}>{fieldValue('item','quality',q)}</option>{/each}</select></label>{/if}
   {#if row.paragon}<label>裝備巔峰等級<input type="number" min="0" max="1500" step="1" bind:value={paragon}/></label>{/if}
   <label>星級主屬性加值<input type="number" min="0" max="1000000" step="1" bind:value={offset}/></label>
   <label class="check-control"><input type="checkbox" bind:checked={ancient}/> 遠古裝備</label>
  </div>
  </details>
  <p class="data-note">主屬性依預覽設定計算，副屬性列出未套用裝備經驗成長的基值；未知的星級、神器效果與孔位狀態不作假設。<a href="/data/equipment-display-native.txt">顯示規則查核</a></p>
  {#if row.paragon}
   <h3 class="enhancement-stat">鑲嵌 · 最多 3 孔</h3>
   <p class="data-note">角色 Lv. 30 開啟鑲嵌功能。巔峰裝備生成時可能已有 0～3 孔；以下為尚未開啟的孔位費用，已有的孔不必重付。鑲嵌寶石的費用另計。<a href="/data/equipment-ui-native.json">打孔與解鎖查核</a></p>
   <div class="tablewrap"><table class="socket-costs" id="equipment-sockets"><thead><tr><th>打開孔位</th><th>消耗</th></tr></thead><tbody>{#each [0,1,2] as opened}<tr><th>第 {opened+1} 孔</th><td><EntryLink record={material(5200)} id={5200} quantity={socketCost(opened)}/></td></tr>{/each}</tbody></table></div>
   <p class="data-note">打孔器需求為現有孔位數＋1，每次增加一孔；開孔不扣魔石。鑲嵌與拆卸寶石的魔石費用另計。</p>
   <h3>鑲嵌與拆卸寶石</h3>
   <div class="tablewrap"><table class="gem-costs"><thead><tr><th>操作</th><th>消耗</th></tr></thead><tbody>
    {#each [0,1,2] as occupied}<tr><th>鑲嵌第 {occupied+1} 顆</th><td><div class="cost-items"><Currency kind="money" value={gemInsertionCost(occupied)}/><span>待鑲嵌寶石 ×1</span></div></td></tr>{/each}
    {#each [1,2,3] as occupied}<tr><th>拆卸一顆（目前裝有 {occupied} 顆）</th><td><Currency kind="money" value={gemRemovalCost(occupied)}/></td></tr>{/each}
   </tbody></table></div>
   <p class="data-note">費用依操作前已鑲嵌的寶石總數計算，與點選哪個孔無關；鑲嵌需有空孔。拆卸後寶石返回背包，孔位保留。由零鑲滿三顆共需 600 魔石，從三顆全部拆下共需 180 魔石。</p>
  {:else}<p class="data-note">此非巔峰裝備未配置鑲嵌孔位。</p>{/if}
  {#if p.qualities.length>1}<p class="data-note">此裝備有可核對的掉落來源；原版掉落流程可將史詩裝備生成為神器，並非每次必定取得神器。神器星級與額外屬性由生成結果決定，請填入實際的星級主屬性加值；下表不自動假設滿星數值。<a href="/data/equipment-variants-native.json">生成規則核對</a></p>{/if}
  {#if valid&&costs}
   <h3>每級主屬性與評分範圍</h3>
   <p class="data-note">每欄為該評分 1～100 分的最小～最大「{attrNames[Number(row.maintype)]||'主屬性'}」。素材為本級升至下一級的一次嘗試成本，並非保證成功或累計成本。+15 起可另加普通強化石提高成功率。</p>
   <div class="tablewrap"><table class="upgrade-levels" id="equipment-strength"><thead><tr><th>強化</th>{#each scoreNames as name,grade}<th class={`score-${grade+1}`}>{name}</th>{/each}<th>升下一級素材</th><th>可選追加素材</th></tr></thead><tbody>
    {#each steps as step}<tr><th>+{step}</th>{#each scoreNames as _,grade}<td class={`score-${grade+1}`}>{number(main(step,grade+1,1))}～{number(main(step,grade+1,100))}</td>{/each}<td>{#if step<18}{@const cost=strengthCost(context,step)}<EntryLink record={material(cost.id)} id={cost.id} quantity={cost.primary}/>{:else}已達上限{/if}</td><td>{#if step>=15&&step<18}<EntryLink record={material(5003)} id={5003} quantity={strengthCost(context,step).supplement}/>{:else}—{/if}</td></tr>{/each}
   </tbody></table></div>
  {:else}<p role="alert">請輸入範圍內的整數。</p>{/if}
 {:else if p.kind==='accessory'||p.kind==='wing'}
  <h2 id="special-upgrades">{p.kind==='wing'?'翅膀':'飾品'}逐級屬性與升級素材</h2>
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
  {#if p.kind==='equipment'}<p class="data-note">共 {fixed.length} 條固定、{affixes.randomCount} 條隨機屬性。固定類型與已抽中的類型不會重複。下表「單欄機率」為尚未知其他隨機欄結果時，各欄抽到此屬性的機率；「整件出現率」為任一隨機欄出現此屬性的機率。已知前面抽選結果時，下一欄改從剩餘類型等機率抽取；不是各欄獨立抽選。</p>{/if}
  <div class="tablewrap" id="random-affix-pool"><table class="random-attributes" class:additional-stat={p.kind==='equipment'}><thead><tr><th>屬性</th><th>最小值</th><th>最大值</th>{#if p.kind==='equipment'}<th>單欄機率（約）</th><th>整件出現率（約）</th>{/if}</tr></thead><tbody>{#each (p.kind==='equipment'?affixes.candidates:p.randomAttributes) as descriptor}{@const range=p.kind==='rune'?{min:descriptor[1],max:descriptor[2]}:randomAttributeRange(descriptor,level,context.paragon,ancient,p.kind==='badge')}<tr><th>{attributeName(descriptor[0])}</th><td>{range.min}{unit(descriptor[0])}</td><td>{range.max}{unit(descriptor[0])}</td>{#if p.kind==='equipment'}<td>{number(affixes.slotRate)}%</td><td>{number(affixes.itemRate)}%</td>{/if}</tr>{/each}</tbody></table></div>
 {/if}
 <p class="source">公式核對：遊戲 11.01 原版程式 · <a href="/data/item-mechanics-native.json">計算核對資料</a></p>
</section>

<style>
 .special-attributes{list-style:none;padding:0;margin:12px 0;color:#6fda64;font-size:18px;line-height:1.65}.special-attributes a{color:inherit}.special-attributes .locked{color:#a8999a}
 .cost-items{display:flex;align-items:center;flex-wrap:wrap;gap:12px}
 .equipment-layout{display:grid;grid-template-columns:minmax(0,480px) minmax(220px,1fr);gap:32px;align-items:start;max-width:1120px}.equipment-expenses{padding-top:28px;min-width:0}.equipment-expenses h3{margin-top:0}.equipment-expenses :global(.entry-identity){font-size:12px}
 @media(max-width:800px){.equipment-layout{grid-template-columns:minmax(0,480px);gap:0}.equipment-expenses{padding-top:0}}

 .equipment-tooltip{max-width:480px;box-sizing:border-box;margin:28px 0 16px;padding:18px 18px 0;border:1px solid #756953;border-radius:8px;background:linear-gradient(135deg,#171211ed,#060506f5 65%);box-shadow:inset 0 0 0 3px #050405,0 12px 32px #0005;font-family:'Microsoft JhengHei',sans-serif}
 .tooltip-heading{display:grid;grid-template-columns:minmax(0,1fr) 84px;gap:18px;align-items:start}.tooltip-heading h1{color:var(--item-color);font-size:18px;line-height:1.4;letter-spacing:0;margin:0 0 8px;font-weight:500;overflow-wrap:anywhere}.tooltip-level{color:#f0ede6;font-size:18px;margin:0;line-height:1.5}.tooltip-level>span{color:#6fda64}.tooltip-identity{position:relative;display:flex;flex-direction:column;align-items:center;gap:7px;font-size:20px;color:#f0ede6}.tooltip-identity :global(.game-icon.large){width:68px;height:68px;flex-basis:auto}.tooltip-identity>small{font-size:11px;text-align:center}.equipment-score{position:absolute;right:calc(100% + 6px);top:38px;white-space:nowrap;font-size:18px}
 .tooltip-body{display:grid;grid-template-columns:minmax(0,1fr) 84px;gap:16px;min-height:0;margin-top:2px}.tooltip-attributes{min-width:0}.equipment-attributes{margin:0 0 12px}.equipment-attributes>div{display:flex;flex-wrap:wrap;align-items:baseline;line-height:1.55;font-size:21px}.equipment-attributes dt,.equipment-attributes dd{margin:0}.fixed-attributes{list-style:none;margin:0;padding:0 0 8px}.fixed-attributes li{font-size:18px;line-height:1.55;margin:0 0 6px;overflow-wrap:anywhere}.fixed-attributes a{text-decoration:none}.fixed-attributes a:hover{text-decoration:underline}.tooltip-special{font-size:18px;margin:8px 0 18px}.socket-preview{white-space:nowrap;letter-spacing:3px;color:#a8999a}.tooltip-note{font-size:13px;color:#a8999a}
 .equipment-actions{display:flex;flex-direction:column;gap:12px;align-self:end;margin:8px 0 24px}.equipment-actions>a{display:flex;align-items:center;justify-content:center;min-height:36px;margin:0;padding:4px 10px;border:1px solid #8c7462;color:#f6e9d0;font-size:18px;letter-spacing:3px;text-decoration:none;background:radial-gradient(ellipse at 50% 115%,#eb532c99,transparent 55%),linear-gradient(#581b14,#240a08 55%,#43110b);box-shadow:inset 0 0 0 3px #140b09,0 2px 4px #0008}.equipment-actions>a:hover{border-color:#dfbd83;filter:brightness(1.2)}
 .tooltip-costs{display:flex;align-items:center;flex-wrap:wrap;gap:15px;margin-top:14px;padding:17px 0;border-top:1px solid #493c2c}.tooltip-costs>small{color:#a8999a;font-size:11px}.tooltip-costs :global(.currency){font-size:21px;color:#ffd165;font-style:italic;font-weight:700}.tooltip-costs :global(.entry-identity){font-size:12px}.tooltip-costs :global(.game-icon){width:30px;height:30px;flex-basis:30px}.preview-settings{max-width:480px;margin:0 0 16px;padding:12px 0}.preview-settings summary{font-size:12px}.preview-settings .progression-controls{padding:0 8px}
 @media(max-width:520px){.equipment-tooltip{padding:17px 16px 0;margin-top:22px}.tooltip-heading{grid-template-columns:minmax(0,1fr) 78px;gap:10px}.tooltip-heading h1{font-size:21px}.tooltip-level{font-size:18px}.tooltip-identity{font-size:16px;gap:5px}.tooltip-identity :global(.game-icon.large){width:72px;height:72px}.equipment-score{position:static;font-size:17px;order:1}.tooltip-identity>small{font-size:9px;order:2}.tooltip-body{grid-template-columns:minmax(0,1fr) 78px;gap:12px;margin-top:0}.equipment-attributes>div{font-size:21px}.fixed-attributes{padding-left:0}.fixed-attributes li{font-size:17px}.equipment-actions{gap:10px}.equipment-actions>a{font-size:18px;letter-spacing:1px;min-height:42px;padding:2px 7px}.tooltip-special{font-size:15px}.tooltip-costs{gap:10px}.tooltip-costs>small{flex-basis:100%}.tooltip-costs :global(.currency){font-size:18px}.tooltip-costs :global(.entry-identity){font-size:11px}}
 .unlock-label{font-size:14px;margin-left:5px;white-space:nowrap}.main-stat,.sub-stat.unlocked{color:#f3f0e9}.sub-stat{color:#a8999a}.additional-stat,.random-attributes.additional-stat th,.random-attributes.additional-stat td{color:#79b4ff}.fixed-attributes a{color:inherit}.artifact-stat{color:#ff6b62}.enhancement-stat{color:#78d879}.stat-controls{margin-top:0}
 .score-1{color:#b4b4b4}.score-2{color:#a4d5ff}.score-3{color:#dfa6ef}.score-4{color:#ffbc55}
 .progression-controls{display:flex;flex-wrap:wrap;gap:1rem;margin:1rem 0}.progression-controls label{display:flex;flex-direction:column;gap:.4rem}.progression-controls input[type=number]{width:10rem}.progression-controls .check-control{flex-direction:row;align-items:center}.material-line{display:block;margin:.35rem 0}.upgrade-levels td{white-space:nowrap}.item-progression h2{margin-top:2rem}
</style>
