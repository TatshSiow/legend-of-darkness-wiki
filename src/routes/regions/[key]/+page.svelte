<script lang="ts">import Hero from '#lib/components/Hero.svelte';import Icon from '#lib/components/Icon.svelte';import DropHints from '#lib/components/DropHints.svelte';import type {PageData} from './$types';let {data}:{data:PageData}=$props();</script>
<div data-pagefind-ignore="all"><a class="region-entry" href={data.region.backHref}>← 返回{data.region.abyss?'深淵樓層':'地區圖鑑'}</a>
<Hero title={data.region.name} eyebrow={data.region.abyss?'THE ABYSS':'ENEMIES'} description="點擊怪物，查看技能、難度與掉落資訊。"/>
<div class="region-summary"><p>{data.region.english} · {data.region.level} · {data.enemies.length} 種敵人{data.randomFive?' · 每場隨機出現 5 隻（種類可重複）':''}</p></div>
{#if data.region.key==='rift'}<p class="notice">以下是祕境可能出現的敵人，並非每場全部出現；麒麟為條件活動關卡。</p>{/if}
{#if data.region.key==='copy-3101'}<p class="notice">試煉每波隨機抽出 5 隻，屬性隨難度與波數成長。<a href="/trial/">查看三難度與各波候選怪物數值 →</a></p>{/if}
{#if data.enemies.some(enemy=>enemy.minDifficulty===5)}<p class="notice">隱藏首領於巔峰300～1500開放，並需符合遊戲章節進度；時空之巔另需開啟對應解鎖旗標。</p>{/if}
{#if data.enemies.some(enemy=>enemy.hiddenEncounter)}<p class="notice">隱藏遭遇需觸發才會出現，仍歸屬本區域；觸發條件與機率待核對。</p>{/if}
<div class="enemy-card-grid">{#each data.enemies as enemy}<a class="enemy-card" href={enemy.href}><Icon src={enemy.icon} large/><span>{enemy.name}<small>{enemy.english}</small><small>Lv. {enemy.level}</small>{#if enemy.hiddenEncounter}<small>隱藏遭遇 · 觸發後出現</small>{/if}{#if enemy.minDifficulty===5}<small>隱藏首領 · 巔峰300起</small>{/if}</span></a>{/each}</div><DropHints hints={data.dropHints}/></div>

