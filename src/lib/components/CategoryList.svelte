<script lang="ts">
 import TrialRewards from './TrialRewards.svelte';
 import Currency from './Currency.svelte';
 import {imageSource} from '#lib/core/image-source.ts';
 import ExchangeCatalog from './ExchangeCatalog.svelte';
 import Hero from '#lib/components/Hero.svelte';
 import EntryLink from '#lib/components/EntryLink.svelte';
 import {enemyQualityNames} from '#lib/core/enemy-stats.ts';
 import {fieldLabel,fieldValue,fieldCurrency} from '#lib/core/fields.ts';
 import type {listing} from '#lib/server/data.ts';
 import {untrack} from 'svelte';
 let {data}:{data:NonNullable<ReturnType<typeof listing>>}=$props();
 let query=$state(''),min=$state<number|undefined>(),max=$state<number|undefined>(),quality=$state(''),sort=$state('id'),desc=$state(false),current=$state(untrack(()=>data.initialPage-1));
 let qualities=$derived([...new Set(data.records.map(r=>r.quality).filter(q=>q!==null))].sort((a,b)=>a-b));
 let selectedPet=$state<number|null>(null);
 let recipeGroup=$state('');
 let availability=$state('');
 let recipeGroups=$derived([...new Set(data.records.map(r=>r.recipeGroup??r.itemGroup).filter((g):g is string=>!!g))]);
 let rows=$derived(data.records.filter(r=>(!query||`${r.name} ${r.english} ${r.id}`.toLowerCase().includes(query.toLowerCase()))&&
  (!recipeGroup||(r.recipeGroup??r.itemGroup)===recipeGroup)&&(!availability||r.availability?.status===availability)&&(quality===''||String(r.quality)===quality)&&(min===undefined||(r.level!==null&&r.level>=min))&&(max===undefined||(r.level!==null&&r.level<=max)))
  .sort((a,b)=>{const x=sort==='id'?a.id:sort==='name'?a.name:a.values[sort],y=sort==='id'?b.id:sort==='name'?b.name:b.values[sort];const cmp=typeof x==='number'&&typeof y==='number'?x-y:String(x??'').localeCompare(String(y??''),'zh-Hant');return desc?-cmp:cmp}));
 $effect(()=>{data.category;const requested=data.initialPage;query='';min=undefined;max=undefined;quality='';sort='id';desc=false;current=requested-1;selectedPet=null;recipeGroup='';availability='';});
 let petGroups=$derived([...new Set(rows.slice(current*50,current*50+50).map(row=>row.quality))].sort((a,b)=>(a??0)-(b??0)).map(q=>({quality:q,records:rows.slice(current*50,current*50+50).filter(row=>row.quality===q)})));
 let activePet=$derived(petGroups.find(g=>g.quality===selectedPet)?.quality??petGroups[0]?.quality);
 function movePetTab(event:KeyboardEvent,index:number){
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();
  const next=event.key==='Home'?0:event.key==='End'?petGroups.length-1:(index+(event.key==='ArrowRight'?1:-1)+petGroups.length)%petGroups.length;
  selectedPet=petGroups[next].quality;
  (event.currentTarget as HTMLElement).parentElement?.querySelectorAll<HTMLButtonElement>('[role=tab]')[next]?.focus();
 }
</script>
{#if data.exchangeGroups}<ExchangeCatalog groups={data.exchangeGroups}/>{:else if data.trialRewards}<div data-pagefind-ignore="all"><Hero title={data.name} eyebrow="THE TRIAL" description="查看試煉失敗結算時，各難度的獎勵池、抽中率與分數條件。"/><a class="region-entry" href="/trial/">查看試煉關卡與怪物 →</a><TrialRewards rewards={data.trialRewards}/></div>{:else}
<div data-pagefind-ignore="all"><Hero title={data.name} eyebrow="THE DATABASE" description={data.categoryDescription??`收錄 ${data.records.length} 筆條目，點擊名稱查看詳細資料。`}/>
{#if ['make','item'].includes(data.category)}<div class="recipe-tabs" role="group" aria-label={`${data.name}分類`}>{#each ['',...recipeGroups] as group}<button type="button" class:active={recipeGroup===group} aria-pressed={recipeGroup===group} onclick={()=>{recipeGroup=group;current=0}}>{group||'全部'}<small>{data.records.filter(r=>!group||(r.recipeGroup??r.itemGroup)===group).length}</small></button>{/each}</div>{#if recipeGroup==='成品待核對'}<p class="data-note">這些配方的成品 ID 在目前物品資料中沒有對應記錄，暫不推定分類或可用性。</p>{/if}{/if}
<div class="toolbar"><span class="count">找到 <b>{rows.length}</b> 筆</span>
 {#if data.category==='item'}<select aria-label="掉落狀態" bind:value={availability} onchange={()=>current=0}><option value="">所有掉落狀態</option>{#each ['有掉落設定','僅有掉落線索','未找到掉落設定'] as status}<option value={status}>{status}</option>{/each}</select>{/if}
 <input class="category-search" type="search" aria-label="搜尋此分類" placeholder="名稱或 ID" bind:value={query} oninput={()=>current=0}>
 {#if qualities.length&&!['skin','pet'].includes(data.category)}<select aria-label="品質篩選" bind:value={quality} onchange={()=>current=0}><option value="">所有品質</option>{#each qualities as q}<option value={String(q)}>{data.category==='enemy'?(enemyQualityNames[q]||'未標示'):data.category==='item'?fieldValue(data.category,'quality',q):`品質代碼 ${q}`}</option>{/each}</select>{/if}
 {#if !['skin','pet'].includes(data.category)}
 <input type="number" aria-label="最低等級" placeholder="最低等級" bind:value={min} oninput={()=>current=0}>
 <input type="number" aria-label="最高等級" placeholder="最高等級" bind:value={max} oninput={()=>current=0}>
 {/if}
 <select aria-label="排序欄位" bind:value={sort} onchange={()=>current=0}><option value="id">預設順序</option>{#each data.columns as key}<option value={key}>{fieldLabel(key,data.category)}排序</option>{/each}</select>
 <button class="btn" onclick={()=>{desc=!desc;current=0}}>{desc?'↓ 由高至低':'↑ 由低至高'}</button>
</div>
{#if data.category==='enemy'}<p class="data-note">品質為原始設定；實際品質依戰鬥模式覆寫。點擊怪物查看各難度數值。異常抗性 res 並非抗暴百分比，<a href="/formulas/">查看抗暴計算</a>。</p>{/if}
{#if data.category==='item'}<p class="data-note">掉落查核以原版戰鬥抽選設定為依據；「未找到掉落設定」不等於無法取得，物品可能來自合成、兌換或其他功能。點進物品查看取得方式與條件；神器變體不另算一種物品。</p>{/if}
{#if data.category==='treasure'}<p class="data-note">獎勵池是各玩法可抽出的獎勵清單，不是另一種背包道具。點擊名稱查看道具／寵物圖示、數量及抽選資料；不同玩法不共用同一套機率算法。</p>{/if}
{#if data.category==='pet'}
<p class="data-note">依基礎品質分類；神獸與遠古神獸為進化後品質，請點入查看寵物資料。</p>
{#if petGroups.length}<div class="pet-tabs" role="tablist" aria-label="寵物品質">{#each petGroups as group,i}<button type="button" role="tab" id={`pet-tab-${group.quality}`} aria-controls={`pet-panel-${group.quality}`} aria-selected={activePet===group.quality} tabindex={activePet===group.quality?0:-1} data-quality={group.quality} class:active={activePet===group.quality} onclick={()=>selectedPet=group.quality} onkeydown={event=>movePetTab(event,i)}>{fieldValue('pet','quality',group.quality)}<small>{group.records.length} 種</small></button>{/each}</div>{/if}
{#each petGroups.filter(g=>g.quality===activePet) as group}<div class="pet-group" role="tabpanel" tabindex="0" id={`pet-panel-${group.quality}`} aria-labelledby={`pet-tab-${group.quality}`}><div class="pet-grid">{#each group.records as row}<a class="pet-card" href={row.href}><span class="pet-portrait"><img src={imageSource(row.icon)} alt={row.icon?'':'無原圖，使用備用圖示'} width="160" height="160" loading="lazy" decoding="async"/></span><span class="catalog-name">{row.name}<small>{row.english}</small></span></a>{/each}</div></div>{/each}
{#if !rows.length}<p class="empty">沒有符合的寵物，請調整搜尋條件。</p>{/if}
{:else if data.category==='skin'}
<div class="skin-grid">{#each rows.slice(current*50,current*50+50) as row}<a class="skin-card" href={row.href}><span class="skin-portrait"><img src={imageSource(row.icon)} alt={row.icon?'':'無原圖，使用備用圖示'} width="136" height="216" loading="lazy" decoding="async"/></span><span class="catalog-name">{row.name}<small>{row.english}</small></span></a>{/each}</div>
{#if !rows.length}<p class="empty">沒有符合的幻化，請調整搜尋條件。</p>{/if}
{:else}
<div class="tablewrap"><table data-managed-sort><thead><tr>{#each data.columns as key}<th aria-sort={sort===key?(desc?'descending':'ascending'):'none'}><button type="button" class="table-sort" aria-label={fieldLabel(key,data.category)} onclick={()=>{desc=sort===key?!desc:false;sort=key;current=0}}>{fieldLabel(key,data.category)}</button></th>{/each}</tr></thead><tbody>{#each rows.slice(current*50,current*50+50) as row}<tr>{#each data.columns as key}<td>{#if key==='name'}<EntryLink record={row} showLevel={false}/>{:else if key==='quality'&&data.category==='enemy'}<span class={`enemy-quality enemy-quality-${row.quality??0}`}>{enemyQualityNames[row.quality??0]||'未標示'}</span>{:else if fieldCurrency(data.category,key)}<Currency kind={fieldCurrency(data.category,key)!} value={String(row.values[key]??0)}/>{:else}{fieldValue(data.category,key,row.values[key],row.values)}{/if}</td>{/each}</tr>{/each}</tbody></table>{#if !rows.length}<p class="empty">沒有符合的條目，請調整篩選條件。</p>{/if}</div>
{/if}
<div class="pager">{#if current>0}<a class="btn" href={current<=1?`/data/${data.category}/`:`/data/${data.category}/page/${current}/`} onclick={event=>{event.preventDefault();current--}}>← 上一頁</a>{:else}<span class="btn" aria-disabled="true">← 上一頁</span>{/if}<span>{rows.length?current+1:0} / {Math.ceil(rows.length/50)} 頁</span>{#if (current+1)*50<rows.length}<a class="btn" href={`/data/${data.category}/page/${current+2}/`} onclick={event=>{event.preventDefault();current++}}>下一頁 →</a>{:else}<span class="btn" aria-disabled="true">下一頁 →</span>{/if}</div></div>

{/if}
<style>.recipe-tabs{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}.recipe-tabs button{flex:1 0 auto;padding:10px 12px;border:1px solid var(--line);background:var(--panel);color:var(--gold)}.recipe-tabs button.active{border-color:var(--gold);background:#b48d3420}.recipe-tabs small{margin-left:8px;color:var(--muted)}
 .skin-grid,.pet-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:16px;margin:20px 0}
 .skin-card,.pet-card{display:flex;flex-direction:column;min-width:0;border:1px solid var(--line);background:var(--panel);color:var(--gold);transition:border-color .15s,background .15s}
 .skin-card:hover,.skin-card:focus-visible,.pet-card:hover,.pet-card:focus-visible{border-color:var(--gold);background:#302417}
 .skin-portrait,.pet-portrait{display:flex;align-items:center;justify-content:center;aspect-ratio:3/4;padding:12px;background:radial-gradient(ellipse at 50% 65%,#9c783526,transparent 70%);overflow:hidden}
 .skin-portrait img,.pet-portrait img{display:block;width:100%;height:100%;object-fit:contain}
 .catalog-name{padding:12px;text-align:center;border-top:1px solid var(--line);overflow-wrap:anywhere}
 .catalog-name small{display:block;margin-top:4px;color:var(--muted);font-size:11px}
 .pet-portrait{aspect-ratio:1}
 .pet-group{margin-block:16px}.pet-tabs{display:flex;gap:8px}.pet-tabs button{flex:1;padding:10px 8px;border:1px solid var(--line);background:var(--panel);color:var(--gold)}.pet-tabs button.active{border-color:var(--gold);background:#b48d3420}.pet-tabs small{margin-left:8px;color:var(--muted);font-size:11px}
 .pet-tabs [data-quality="2"]{color:#a6cfea}.pet-tabs [data-quality="3"]{color:#d8a7e5}.pet-tabs [data-quality="4"]{color:#efbd62}
 @media(max-width:1200px){.skin-grid,.pet-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}
 @media(max-width:850px){.skin-grid,.pet-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
 @media(max-width:520px){.skin-grid,.pet-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}}
 .pet-grid{grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:12px;margin:14px 0}
 .pet-portrait{padding:7px}
 .pet-card .catalog-name{padding:7px 5px;font-size:12px}
 .pet-card .catalog-name small{margin-top:2px;font-size:10px}
 @media(max-width:520px){.pet-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}}
 @media(max-width:340px){.pet-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
</style>
