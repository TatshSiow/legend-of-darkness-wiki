<script lang="ts">
 import {page} from '$app/state';
 import {goto} from '$app/navigation';
 import Hero from './Hero.svelte';
 import EntryLink from './EntryLink.svelte';
 import {trialEnemyStats,enemyQualityNames} from '#lib/core/enemy-stats.ts';
 import {labels} from '#lib/core/fields.ts';
 import type {trialBattle} from '#lib/server/data.ts';
 let {data}:{data:Omit<NonNullable<ReturnType<typeof trialBattle>>,'rewards'|'rewardSummaries'>}=$props();
 const names=['青銅','白銀','黃金'];
 const keys=['att','hp','def','hit','spo','cri','crihurt','res','critResistance'];
 let requested=$derived(import.meta.env.SSR?1:Number(page.url.searchParams.get('wave')||1));
 let wave=$derived(Number.isInteger(requested)&&requested>=1&&requested<=100000?requested:1);
 let viewingWave=$derived(!import.meta.env.SSR&&page.url.searchParams.get('view')==='wave');
 $effect(()=>{if(page.url.searchParams.get('view')==='rewards')void goto('/data/trial/',{replaceState:true});});
 let start=$derived(Math.floor((wave-1)/12)*12+1);
 let end=$derived(Math.min(start+11,100000));
 let quality=$state(2);
 let waves=$derived.by(()=>{const first=start,last=end,q=quality,difficulty=data.difficulty;return Array.from({length:last-first+1},(_,i)=>{
  const n=first+i,stats=data.enemies.map(e=>trialEnemyStats(e.row,difficulty,n,q));
  return {wave:n,att:[Math.min(...stats.map(s=>s.att)),Math.max(...stats.map(s=>s.att))],hp:[Math.min(...stats.map(s=>s.hp)),Math.max(...stats.map(s=>s.hp))]};
 });});
 let rows=$derived(data.enemies.map(e=>({...e,stats:trialEnemyStats(e.row,data.difficulty,wave,quality)})));
</script>
<svelte:head><title>{names[data.difficulty-1]}試煉關卡 · 黑暗傳說 Wiki</title><meta name="description" content="查詢試煉三種難度、各波候選怪物、品質與原版數值成長規則。每波隨機抽出5隻怪物。"/></svelte:head>
<Hero title="試煉關卡" eyebrow="THE TRIAL" description="依青銅、白銀、黃金難度與波數查詢。每波隨機抽出 5 隻怪物，可重複抽中同一種。"/>
<nav class="map-tabs trial-difficulties" aria-label="試煉難度">{#each names as name,i}<a href={`/trial/${i+1}/?wave=${wave}${viewingWave?'&view=wave':''}`} aria-current={data.difficulty===i+1?'page':undefined} class:active={data.difficulty===i+1}>{name}難度</a>{/each}</nav>
<nav class="map-subtabs" aria-label="試煉內容"><a class="active" aria-current="page" href={`?wave=${wave}`}>關卡與怪物</a><a href="/data/trial/">結算獎勵池</a></nav>
<form class="toolbar" action={`/trial/${data.difficulty}/`} onsubmit={event=>{event.preventDefault();void goto(`?wave=${new FormData(event.currentTarget).get('wave')}&view=wave`);}}><label for="trial-wave">查詢波數</label><input id="trial-wave" name="wave" type="number" min="1" max="100000" value={wave} required/><input type="hidden" name="view" value="wave"/><button class="btn" type="submit">查看</button></form>
{#if !viewingWave}
<p class="notice">每波隨機抽出 5 隻，種類可重複；點進關卡查看候選怪物與數值。勝利後進入下一波，已查分支未見固定終點。</p>
<h2>{names[data.difficulty-1]} · 第 {start}～{end} 波</h2>
<h3>每波共用的候選怪物</h3><div class="trial-pool">{#each data.enemies as enemy}<EntryLink record={enemy.record}/>{/each}</div>
<div class="toolbar"><label for="trial-list-quality">比較品質</label><select id="trial-list-quality" bind:value={quality}>{#each [1,2,3] as q}<option value={q}>{enemyQualityNames[q]}</option>{/each}</select></div>
<p class="data-note">攻擊、生命範圍取自同波數、所選品質的五種候選怪物，並非整波五隻的合計。點擊波數查看個別怪物。</p>
<div class="tablewrap"><table class="trial-wave-list"><thead><tr><th>波數</th><th>怪物等級</th><th>攻擊範圍（{enemyQualityNames[quality]}）</th><th>生命範圍（{enemyQualityNames[quality]}）</th></tr></thead><tbody>{#each waves as row (row.wave)}<tr><td><a href={`?wave=${row.wave}&view=wave`}>第 {row.wave} 波 →</a></td><td>Lv. 80</td><td>{row.att.map(n=>n.toLocaleString('en-US')).join('～')}</td><td>{row.hp.map(n=>n.toLocaleString('en-US')).join('～')}</td></tr>{/each}</tbody></table></div>
<div class="pager">{#if start>1}<a class="btn" href={`?wave=${start-12}`}>← 前 12 波</a>{/if}<span>第 {start}～{end} 波</span>{#if end<100000}<a class="btn" href={`?wave=${start+12}`}>後 12 波 →</a>{/if}</div>
{:else}
<a class="region-entry" href={`?wave=${wave}`}>← 返回{names[data.difficulty-1]}關卡列表</a>
<h2>{names[data.difficulty-1]} · 第 {wave} 波</h2>
<div class="toolbar"><label for="trial-quality">怪物品質</label><select id="trial-quality" bind:value={quality}>{#each [1,2,3] as q}<option value={q}>{enemyQualityNames[q]}</option>{/each}</select><span>每波 5 隻 · 候選種類 5 種 · Lv. 80</span></div>
<p class="data-note">以下列出所選品質的各種可能怪物，不是這一波必定出現的名單。抽選品質的隨機餘數為 0～100：普通 1 個值、精英 69 個值、變異 31 個值。波數增加屬性，怪物等級維持 Lv. 80。</p>
<div class="tablewrap"><table class="trial-enemies"><thead><tr><th>候選怪物</th>{#each keys as key}<th>{key==='critResistance'?'抗暴率':labels[key]}</th>{/each}</tr></thead><tbody>{#each rows as enemy}<tr><td><EntryLink record={enemy.record}/></td>{#each keys as key}<td>{enemy.stats[key].toLocaleString('en-US')}{key==='critResistance'?'%':''}</td>{/each}</tr>{/each}</tbody></table></div>
<div class="pager">{#if wave>1}<a class="btn" href={`?wave=${wave-1}&view=wave`}>← 上一波</a>{/if}{#if wave<100000}<a class="btn" href={`?wave=${wave+1}&view=wave`}>下一波 →</a>{/if}</div>
{/if}
<details><summary>試煉規則與數值來源</summary><p>遊戲說明：回合回血無效，怪物免疫負面效果。這些效果的完整戰鬥處理尚未逐項驗證。</p><p>屬性先加入成長值，再套用普通／精英／變異的品質加成；不套用冒險難度或角色巔峰縮放。此頁計算範圍為第 1～100,000 波，屬於查詢工具範圍，不代表遊戲上限。</p><p>原版說明記載青銅／白銀／黃金抗暴增加 20%／40%／60%，但敵人初始化先設定該值後，又被品質數值處理覆寫為 20%／25%／30%；上表顯示最後初始化結果；已唯讀核對手機青銅第 1 波五隻怪物，25%／30% 抗暴與其餘屬性均符合公式。其他難度與波數仍以原版指令驗證為依據。</p><p>成長參數 = 55 × 波數 + 5 × 難度編號 − 5；各屬性的增加係數不同。原生 ARM 數值分支已核對 375 組案例。</p><a href="/data/trial-native.json" download>下載原生數值核對資料</a> · <a href="/data/trial-live-native.json" download>下載手機實戰核對資料</a> · <a href="/data/trial-waves-native.txt" download>下載波次與隨機抽選證據</a></details>
<style>.trial-difficulties{grid-template-columns:repeat(3,minmax(0,1fr))}.trial-difficulties a:nth-child(1){--difficulty-color:#d49a6a}.trial-difficulties a:nth-child(2){--difficulty-color:#83c988}.trial-difficulties a:nth-child(3){--difficulty-color:#f5a44b}.trial-difficulties a{color:var(--difficulty-color);border-bottom-color:var(--difficulty-color)}.trial-difficulties a.active,.trial-difficulties a:hover{color:var(--difficulty-color);border-color:var(--difficulty-color)}.trial-enemies td,.trial-wave-list td{white-space:nowrap}.toolbar input{max-width:140px}.trial-pool{display:flex;flex-wrap:wrap;gap:10px}.trial-pool{margin-block:14px}</style>




