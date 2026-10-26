<script lang="ts">
 import Currency from './Currency.svelte';
 import EntryLink from './EntryLink.svelte';
 import {attrNames} from '#lib/core/fields.ts';
 import type {detail} from '#lib/server/data.ts';
 let {data}:{data:NonNullable<NonNullable<ReturnType<typeof detail>>['skinProgression']>}=$props();
</script>
<section class="skin-progression" aria-label="幻化逐級升級資料">
 <h2>每級屬性與升級需求</h2>
 <p class="data-note">幻化上限 20 級。下表為未裝幻化符文的屬性；魔石與素材是目前等級升至下一級的需求，並非累計數量。降低敵人抗性的屬性已依原版規則除以 10 取整。</p>
 <div class="tablewrap"><table class="skin-levels"><thead><tr><th>等級</th>{#each data.stats[0] as a}<th>{attrNames[a.type]||`效果 ${a.type}`}</th>{/each}<th>升下一級魔石</th><th>升下一級素材</th></tr></thead><tbody>{#each data.stats as attrs,i}<tr><th>Lv. {i+1}</th>{#each attrs as a}<td>{a.value.toLocaleString('zh-TW')}</td>{/each}<td>{#if i===19}—{:else}<Currency kind="money" value={data.costs[i].money}/>{/if}</td><td>{#if i===19}已達上限{:else}{#each data.costs[i].materials as m}<span class="material-line"><EntryLink record={data.materials.find(item=>item.id===m.id)?.record??null} id={m.id} quantity={m.quantity}/></span>{/each}{/if}</td></tr>{/each}</tbody></table></div>
 <p class="source">公式核對：遊戲 11.01 原版程式 · <a href="/data/item-mechanics-native.json">計算核對資料</a></p>
</section>
<style>.material-line{display:block;margin:.35rem 0}.skin-progression h2{margin-top:2rem}</style>
