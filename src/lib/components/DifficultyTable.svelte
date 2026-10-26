<script lang="ts">
 import {enemyPlayerStats,enemyQualityNames} from '#lib/core/enemy-stats.ts';
 import {difficulties} from '#lib/core/regions.ts';
 import type {GameRecord} from '#lib/core/types.ts';
 let {enemy,minDifficulty=1}:{enemy:GameRecord;minDifficulty?:number}=$props();
 let level=$state(80),paragon=$state(1500),quality=$state(1);
 let valid=$derived(Number.isInteger(level)&&level>=1&&level<=80&&Number.isInteger(paragon)&&paragon>=0&&paragon<=1500);
 let rows=$derived(valid?difficulties.filter(d=>d.id>=minDifficulty).flatMap(d=>(quality?[quality]:[1,2,3]).map(q=>({name:d.name,quality:q,stats:enemyPlayerStats(enemy,q,d.id,level,paragon)}))):[]);
</script>
{#if minDifficulty===5}<p class="notice">隱藏首領只在巔峰300起開放，以下只列出可出現的難度。</p>{/if}
<h3>各難度數值對照</h3><p class="data-note">一般冒險、關卡調整倍率 1 倍的參考值。預設範例為角色 80 級／巔峰1500，並非讀取你的角色。簡單、困難、噩夢不套用角色等級與巔峰縮放；特殊副本與深淵不適用。</p>
<div class="toolbar"><label>角色等級 <input id="player-level" type="number" min="1" max="80" step="1" bind:value={level}></label><label>角色巔峰 <input id="player-paragon" type="number" min="0" max="1500" step="1" bind:value={paragon}></label><label>怪物品質 <select aria-label="怪物品質" bind:value={quality}><option value={0}>全部品質</option><option value={1}>普通</option><option value={2}>精英</option><option value={3}>變異</option></select></label></div>
{#if !valid}<p role="alert">請輸入角色等級 1～80、巔峰 0～1500 的整數。</p>{:else}<div class="tablewrap"><table class="difficulty-comparison"><thead><tr><th>難度</th><th>等級</th><th>生命</th><th>攻擊</th><th>防禦</th><th>命中</th><th>閃避</th><th>暴擊</th><th>暴傷</th><th>抗暴</th><th>生成品質</th><th>異常抗性數值</th></tr></thead><tbody>{#each rows as row}<tr><th scope="row">{row.name}</th><td>{row.stats.level}</td><td>{row.stats.hp.toLocaleString()}</td><td>{row.stats.att.toLocaleString()}</td><td>{row.stats.def.toLocaleString()}</td><td>{row.stats.hit.toLocaleString()}</td><td>{row.stats.spo.toLocaleString()}</td><td>{row.stats.cri.toLocaleString()}</td><td>{row.stats.crihurt.toLocaleString()}</td><td>{row.stats.critResistance}%</td><td><span class={`enemy-quality enemy-quality-${row.quality}`}>{enemyQualityNames[row.quality]}</span></td><td>{row.stats.res.toLocaleString()}</td></tr>{/each}</tbody></table></div>{/if}
<p class="data-note">原始元素／異常抗性（未套戰鬥調整）：燃燒 {String(enemy.burn??0)}、電擊 {String(enemy.lightning??0)}、毒 {String(enemy.poison??0)}、暈眩 {String(enemy.vertigo??0)}。</p>
<p class="source"><a href="/data/enemy-difficulty-native.json" download>下載品質／難度階段資料（未套角色調整）</a> · <a href="/data/enemy-difficulties.csv" download>下載 CSV（含技能與抗性）</a></p>
