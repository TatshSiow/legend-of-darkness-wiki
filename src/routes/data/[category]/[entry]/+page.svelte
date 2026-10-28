<script lang="ts">
 import Currency from '#lib/components/Currency.svelte';
 import ExchangeDetails from '#lib/components/ExchangeDetails.svelte';
 import Icon from '#lib/components/Icon.svelte';
 import EntryLink from '#lib/components/EntryLink.svelte';
 import Rewards from '#lib/components/Rewards.svelte';
 import DropHints from '#lib/components/DropHints.svelte';
 import DifficultyTable from '#lib/components/DifficultyTable.svelte';
 import ItemProgression from '#lib/components/ItemProgression.svelte';
 import SkinProgression from '#lib/components/SkinProgression.svelte';
 import {labels,attributeRows,isValue} from '#lib/core/fields.ts';
 import {percent,trialRewardRate} from '#lib/core/rewards.ts';
 import type {PageData} from './$types';
 let {data}:{data:PageData}=$props();
 let attributes=$derived(attributeRows(data.record.category,data.row).filter(a=>!(["shop","exchange"].includes(data.record.category)&&a.label==="數量")));
</script>
<svelte:head><title>{data.record.name} · 黑暗傳說 Wiki</title><meta name="description" content={`${data.record.name} ${data.record.english}：查看遊戲屬性、技能、掉落與相關資料。`}/><meta property="og:title" content={`${data.record.name} · 黑暗傳說 Wiki`}/><meta property="og:description" content={`${data.record.name}：查看遊戲屬性、技能、掉落與相關資料。`}/></svelte:head>
<a class="region-entry" href={`/data/${data.record.category}/`}>← 返回{data.categoryName}</a>
<article data-pagefind-body data-pagefind-filter={`category:${data.categoryName}`}>
 <div class="detailhead"><Icon src={data.record.icon} large quantity={data.record.stackable?data.record.quantity:undefined}/><span class="tag">{data.categoryName}</span>{#if data.record.category==='enemy'}<span class="tag monster-level" data-pagefind-meta="level">{data.record.level!==null&&data.record.level>0?`Lv. ${data.record.level}`:'等級待核對'}</span>{/if}<h1 data-pagefind-meta="title">{data.record.name}</h1><p>{data.record.english}</p></div>
 {#if data.categoryDescription}<p class="notice">{data.categoryDescription}</p>{/if}
 {#each [data.row.describe,data.row.describe_en,data.row.desc].filter(isValue) as text}<p>{String(text)}</p>{/each}
 {#if data.titleUnlock}
  <h3>稱號取得方式</h3>
  {#if data.titleUnlock.condition}<p>{data.titleUnlock.condition}。</p>{/if}
  {#if data.titleUnlock.note}<p class="notice">{data.titleUnlock.note}</p>{/if}
  {#if data.titleUnlock.requirements.length}<div class="tablewrap"><table><thead><tr><th>前置成就（點擊查看條件）</th></tr></thead><tbody>{#each data.titleUnlock.requirements as requirement}<tr><td><EntryLink record={requirement}/></td></tr>{/each}</tbody></table></div><p class="data-note">成就解鎖型稱號需要全部前置成就完成；單一成就只是其中一項條件。</p>{/if}
  {#each data.titleUnlock.exchanges as exchange}<h3>積分兌換</h3><ExchangeDetails info={exchange.info}/>{/each}
  <p class="data-note">前置關聯來自原版稱號資料與解鎖程式；特殊事件稱號未確認的門檻或機率不作推測。<a href="/data/title-unlock-native.json" download>取得方式查核依據</a></p>
 {/if}
 {#if data.record.category==='achievement'}
  <h3>可解鎖的稱號</h3>
  {#if data.unlockedTitles.length}<div class="tablewrap"><table><thead><tr><th>稱號</th><th>完整解鎖條件</th></tr></thead><tbody>{#each data.unlockedTitles as title}<tr><td><EntryLink record={title.record}/></td><td>{title.automatic?'需完成全部成就：':'資料列有前置關聯，額外條件待核對：'}{#each title.requirements as requirement,i}{#if i>0}、{/if}<EntryLink record={requirement}/>{/each}</td></tr>{/each}</tbody></table></div>{:else}<p>未列為任何稱號的直接前置成就；所得成就點數仍可累積至成就點數型稱號的門檻。</p>{/if}
 {/if}
 {#if data.record.category==='item'}
  {#if data.row.type===1&&data.row.subtype===4&&Number(data.row.id)>=5013&&Number(data.row.id)<=5036}<p class="notice">這批寶石的原始描述與目前共用的效果代碼名稱有差異，效果依原文列出；尚未確認現行取得入口及實際鑲嵌效果。請勿只憑同名寶石判斷效果相同。</p>{/if}
  <details><summary>物品欄位怎麼看</summary><p>固定攻擊、生命等數值與特殊屬性分開列出。「主屬性參數」「副屬性參數」「生成參數」是裝備生成及成長計算的輸入，不能直接當成最終角色加成；各等級與品質結果請看下方的成長表。</p><p>「特殊參數」依物品用途使用不同規則，不能跨物品比較大小；「內部資料標記」尚未完成程式用途核對，不代表能否掉落或取得。成長型、巔峰參數亦不是角色目前的等級。</p><p>特殊屬性名稱已對照原版語言檔；有名稱不代表已驗證全部觸發條件或戰鬥公式。</p><a href="/data/item-attribute-language.json" download>下載原版屬性名稱對照</a></details>
 {/if}
 {#if data.record.category==='item'&&!data.record.icon}<p class="notice">原圖缺失：此物品指定的圖示檔不在原版 APK 的物品圖示目錄中，目前以備用圖示顯示；未用其他同名物品的圖代替。</p>{/if}{#if data.availability}<h3>取得方式查核</h3><p><strong>{data.availability.status}</strong>：{data.availability.note}</p><p>其他取得設定：{data.availability.methods.join('、')||'尚未找到已核對的取得設定'}。</p>{#if data.availability.candidates.length}<p>獎勵候選線索：{data.availability.candidates.join('、')}。列入候選不代表保證取得，機率及適用條件尚須核對。</p>{/if}<p class="data-note">來源為原版戰鬥掉落、合成、商店、積分兌換及幸運寶箱設定；未核對的活動、伺服器獎勵與舊版掉落表，不當作已確認掉落。</p>{/if}
 {#if data.record.category==='make'}
  {#if data.makeOperation}<h3>{data.makeOperation.group}</h3><p>{data.makeOperation.description}</p>{:else}<h3>合成產物</h3><EntryLink record={data.product} id={data.row.itemid}/>{/if}
  <h3>所需材料</h3><div class="relations">{#each data.materials as material}<span><EntryLink record={material.item} id={material.id} quantity={String(material.quantity)}/></span>{/each}</div>
 {/if}
 {#if data.pool.length}
  {#if data.treasure}<h3>這個獎勵池用在哪裡？</h3><p class="treasure-usage">{data.treasure.usage}</p>{#if data.treasure.source}<EntryLink record={data.treasure.source}/>{/if}{/if}
  <h3>{data.isChest?'開箱獎勵':data.record.category==='drop'?'掉落條目':'物品池'}</h3>
  <p class="data-note">{data.isChest?'每次開箱抽出下表的一筆獎勵；物品相同但數量不同，屬於不同的開箱結果。機率依原版抽選邊界計算，與角色掉落倍率無關。':data.record.category==='drop'?'掉落倍率 1 倍時，以 rand()%1001、roll < pro 判定，各項獨立抽選；與地點掉落流程不同。':'下表為此玩法的候選獎勵。「抽選權重」是程式設定的相對值，不是百分比，也不表示每次一定取得；各玩法的抽選及選擇流程仍需分別核對，暫不換算掉落率。'}</p>
  <div class="tablewrap"><table class="item-pool"><thead><tr><th>物品</th><th>{data.isChest?'開出機率':data.record.category==='drop'?'掉落率／次（1 倍）':'抽選權重（不是 %）'}</th></tr></thead><tbody>{#each data.pool as item}<tr><td><EntryLink record={item.item} id={item.id} quantity={item.quantity}/></td><td>{item.rate===null?String(item.weight??'—'):percent(item.rate)}</td></tr>{/each}</tbody></table></div>
 {/if}
 {#if data.record.category==='enemy'}
  <h3>怪物技能</h3>
  {#if data.skills.length}<p class="data-note">倍率與效果為原始設定，實際傷害仍受戰鬥屬性影響。</p><div class="tablewrap"><table class="enemy-skills"><thead><tr><th>技能</th><th>說明</th><th>傷害倍率</th><th>命中次數</th><th>附加效果</th></tr></thead><tbody>{#each data.skills as skill}<tr><td>{#if skill.record}<a class="entry-identity" href={skill.record.href}><Icon src={skill.record.icon}/>{isValue(skill.ownName)?String(skill.ownName):skill.record.name}</a>{:else}{isValue(skill.ownName)?String(skill.ownName):"未命名技能"}（資料待核對）{/if}</td><td class="skill-description">{skill.row?String(skill.row.describe||'—'):'未找到對應技能資料'}</td><td>{Number(skill.row?.hurt)>0?`${skill.row?.hurt}%`:'—'}</td><td>{String(skill.row?.hurtcount??'—')}</td><td>{isValue(skill.row?.buffname)?`${skill.row?.buffname}${Number(skill.row?.buffround)>0?`（${skill.row?.buffround} 回合）`:''}`:'無'}</td></tr>{/each}</tbody></table></div>{:else}<p>未配置特殊技能。</p>{/if}
  {#if data.supported}<DifficultyTable enemy={data.row} minDifficulty={data.minDifficulty}/>{:else}
   <h3>{data.abyssOnly?'深淵敵人屬性':'敵人屬性設定'}</h3><p class="notice">{data.abyssOnly?'以下為此深淵敵人的原始設定，尚未包含品質及深淵戰鬥調整，不套用冒險難度計算。':'此敵人未確認適用一般冒險縮放，以下保留原始屬性，不套用冒險公式。'}</p>
   <div class="tablewrap"><table class="enemy-attributes"><thead><tr><th>屬性</th><th>設定值</th></tr></thead><tbody>{#each ['level','att','hp','def','hit','spo','cri','crihurt','res','burn','lightning','poison','vertigo'] as key}<tr><th scope="row">{labels[key]}</th><td>{String(data.row[key]??0)}</td></tr>{/each}</tbody></table></div>
  {/if}
 {:else if data.record.category==='trial'}
  <h3>結算抽選條件</h3>
  <p>試煉失敗結算時，本次分數至少 {String(data.row.score)} 分、挑戰難度達{['青銅','白銀','黃金'][Number(data.row.hard)-1]}以上，此列才參與抽選；抽中機率為 {trialRewardRate(Number(data.row.itemweight),Number(data.row.hard))}%。</p>
  <p>每列獨立判定，跨過分數不會直接發獎。此列有多個候選時，抽中後再隨機選一項；不是全部取得。<a href="/data/trial/">查看完整結算獎勵池 →</a></p>
 {:else if data.exchange}<ExchangeDetails info={data.exchange} stage={data.exchange.boost?data.exchange.stage:undefined}/>
 {:else if !['treasure','drop','droptip'].includes(data.record.category)}
  <h3>屬性資料</h3><div class="tablewrap"><table class="attribute-table"><thead><tr><th>屬性</th><th>數值</th></tr></thead><tbody>{#each attributes as attribute}<tr><th scope="row">{attribute.label}</th><td>{#if attribute.currency}<Currency kind={attribute.currency} value={attribute.value}/>{:else}{attribute.value}{/if}</td></tr>{/each}</tbody></table></div>
 {/if}
 {#if data.progression}<ItemProgression row={data.row} progression={data.progression}/>{/if}
 {#if data.skinProgression}<SkinProgression data={data.skinProgression}/>{/if}
 <Rewards rewards={data.rewards}/>
 <DropHints hints={data.dropHints}/>
 <h3>相關條目</h3><div class="relations">{#each data.relations as relation}<span><EntryLink record={relation}/><small>· {relation.why}</small></span>{:else}<p>尚無可確認的相關條目。</p>{/each}</div>
 
 <details class="technical-info"><summary>資料來源與技術資訊</summary><p class="entry-id" data-pagefind-weight="0.1">資料 ID：{data.record.id}</p><p class="source" data-pagefind-ignore>來源：{data.source} · 遊戲 {data.version} · <a href="/sources/">來源與驗證</a></p><h3 data-pagefind-ignore>全部原始欄位（含未解讀代碼）</h3><pre data-pagefind-ignore>{JSON.stringify(data.row,null,2)}</pre></details>
</article>

