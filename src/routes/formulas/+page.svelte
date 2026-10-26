<script lang="ts">
 import Hero from '#lib/components/Hero.svelte';
 import {criticalChance} from '#lib/core/combat.ts';
 let rating=$state<number|undefined>(54597),roleLevel=$state<number|undefined>(80),paragonLevel=$state<number|undefined>(1500),bonus=$state<number|undefined>(36),resistance=$state<number|undefined>(90);
 let result=$derived(criticalChance({rating:rating??NaN,roleLevel:roleLevel??NaN,paragonLevel:paragonLevel??NaN,bonus:bonus??NaN,resistance:resistance??NaN}));
</script>
<Hero title="公式與計算" eyebrow="MECHANICS & EVIDENCE" description="依已核對的遊戲流程計算，並列出適用範圍與原始依據。"/>
<div class="formula">
 <span class="tag blue">原生流程已核對</span><h2>暴擊率計算</h2>
 <p>暴擊數值需先依角色有效等級換算。抗暴以乘法降低判定值，計算以攻擊已命中、可觸發暴擊為前提。</p>
 <label>暴擊數值 <input type="number" min="0" bind:value={rating}></label>
 <label>角色等級 <input type="number" min="1" bind:value={roleLevel}></label>
 <label>巔峰等級 <input type="number" min="0" bind:value={paragonLevel}></label>
 <label>額外暴擊率 <input type="number" bind:value={bonus}></label>
 <label>敵人抗暴 % <input type="number" min="0" max="100" bind:value={resistance}></label>
 <div class="result" role="status" aria-live="polite">{result===null?'請輸入有效數值；抗暴須介於 0～100。':`${result.toFixed(2)}% 實際暴擊率`}</div>
 <p>以上為示例輸入，可自行更改；並非即時讀取你的角色。</p>
 <pre>L = 角色等級 + floor(巔峰等級 / 20) + 1
基礎判定 = trunc(100 × 暴擊數值 / (136.6 × L))
門檻 = trunc((基礎判定 + 額外暴擊率) × (1 − 抗暴 / 100))
實際機率 = clamp(門檻, 0, 101) / 101</pre>
 <p class="source">WarRole::attacked · 0x84ccaa–0x84cd6a，隨機值 0～100；0x84d142 判定。</p>
</div>
<div class="formula"><span class="tag blue">生成流程已核對</span><h2>最高難度的一般冒險敵人</h2><p>一般冒險分支把敵人品質覆寫為 1、2 或 3，品質抗暴為 5 × 品質 + 15。難度 ≥3 時，再加 10 ×（難度−3）。巔峰1500 對應難度 9，品質 3 敵人為 90% 抗暴；上方示例為 28.71% 暴擊率。</p><p>資料表的品質 4 不能直接用來宣稱實際存在 95% 抗暴敵人；王怪與特殊模式須依具體流程核對。</p><p class="source">WarLayer::initWarData · 0x846450–0x8464b0；Enemy::resetAttByQuality 0x773e18；resetAttByHard 0x77414c。</p></div>
<div class="formula"><span class="tag warn">適用範圍</span><h2>單次暴擊傷害與平均輸出</h2><p>比較平均輸出時，還要考慮敵人防禦、命中、抗暴、技能觸發及持續傷害。本版未提供全模式傷害排行榜。</p><ul class="known"><li>原始物品屬性不包含所有強化、遠古與洗練結果。</li><li>寵物重複被動的疊加方式尚未量化。</li><li>特殊模式與戰鬥增益未逐一實測。</li></ul></div>
