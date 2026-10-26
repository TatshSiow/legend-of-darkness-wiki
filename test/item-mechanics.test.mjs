import {test} from 'node:test';
import assert from 'node:assert/strict';
import native from '../src/lib/server/assets/item-mechanics-native.json' with {type:'json'};
import {equipmentCosts,strengthCost,equipmentStat,chestRates,randomAttributeRange,refineCost} from '../src/lib/core/item-mechanics.ts';
import {abyssBrowser,regionDetails,detail} from '../src/lib/server/data.ts';
import raw from '../src/lib/server/assets/wiki.json' with {type:'json'};
const item=id=>detail('item',`row-${raw.tables.item.findIndex(r=>r.id===id)}`);

test('Divine variants require epic main gear and a verified drop source',()=>{
 assert.deepEqual(item(6007).progression.qualities,[5,6]);
 assert.deepEqual(item(6043).progression.qualities,[5,6]);
 assert.deepEqual(item(6019).progression.qualities,[5]);
 for(const row of raw.tables.item.filter(r=>r.type===2&&r.subtype>=1&&r.subtype<=8&&r.quality<5))assert.deepEqual(item(row.id).progression.qualities,[row.quality]);
 assert.deepEqual(item(6814).progression.qualities,[raw.tables.item.find(r=>r.id===6814).quality]);
 assert.equal(raw.tables.item.filter(r=>item(r.id)?.progression?.qualities.length===2).length,155);
 assert.notDeepEqual(equipmentCosts({level:80,quality:5,paragon:0,ancient:false}),equipmentCosts({level:80,quality:6,paragon:0,ancient:false}));
});
test('costs match 192 original native UI cases including level/paragon/ancient boundaries',()=>{
 for(const row of native.costs)assert.deepEqual(equipmentCosts({...row,ancient:!!row.ancient}),{reset:row.reset,enchantGold:row.enchantGold,enchantMoney:row.enchantMoney},JSON.stringify(row));
 for(const row of native.strengthCosts){const cost=strengthCost({...row,quality:5,ancient:!!row.ancient},row.step);assert.equal(cost.primary,row.primary,JSON.stringify(row));assert.equal(cost.supplement,row.supplement,JSON.stringify(row));}
});
test('every strength/score/paragon stat matches original ARM float operations',()=>{
 for(const row of native.strengthStats)assert.equal(equipmentStat(row.main,row.step,row.grade,row.score,row.paragon,native.strengthMultipliers,native.scoreMultipliers),row.value,JSON.stringify(row));
 for(const row of native.baseStats)assert.equal(equipmentStat(row.main,0,row.grade,row.score,0,native.strengthMultipliers,native.scoreMultipliers),row.value);
 assert.throws(()=>strengthCost({level:80,quality:6,paragon:0,ancient:false},18),RangeError);
 assert.throws(()=>equipmentCosts({level:NaN,quality:6,paragon:0,ancient:false}),RangeError);
});
test('lucky chest uses only verified pool 1, preserves quantity outcomes and inclusive first boundary',()=>{
 const chest=item(5012);assert(chest.isChest);assert.equal(chest.pool.length,30);
 const rates=chestRates(raw.tables.treasure[0].items),sum=raw.tables.treasure[0].items.reduce((n,r)=>n+r.itemweight,0)+1;
 assert.equal(rates[0].rate,21/sum*100);assert.equal(rates[1].rate,15/sum*100);
 assert(Math.abs(rates.reduce((n,r)=>n+r.rate,0)-100)<1e-10);
 assert(chest.pool.every(r=>r.item?.icon&&r.rate>0));
 assert(!item(5003).isChest);assert.throws(()=>chestRates([{itemweight:-1}]),RangeError);
});
test('640 random attribute boundaries match native functions for main gear and badges',()=>{
 for(const r of native.randomRanges)assert.deepEqual(randomAttributeRange(native.attributePools[r.kind][r.type],r.level,r.paragon,!!r.ancient,r.kind==='badge'),{min:r.min,max:r.max},JSON.stringify(r));
});
test('badge and rune refining costs match native counters, caps and discounts',()=>{
 for(const r of native.refineCosts)assert.deepEqual(refineCost(r.kind,r.level,r.quality,r.paragon,r.refines,!!r.discount),{price:r.price,material1:r.material1,material2:r.material2},JSON.stringify(r));
 assert.throws(()=>refineCost('badge',80,6,1499,-1,false),RangeError);
});
test('all 23 skins have 20 native levels, with correct upgrade materials and legend cap',()=>{
 for(const row of raw.tables.skin){const p=detail('skin',`row-${raw.tables.skin.indexOf(row)}`).skinProgression;assert.equal(p.stats.length,20);assert.equal(p.costs.length,19);assert(p.materials.every(m=>m.record?.icon));}
 assert.equal(native.skinStats['8001'][0][0].value,180);assert.equal(native.skinStats['8001'][19][0].value,3600);
 assert.equal(native.skinCosts[8].materials.length,1);assert.equal(native.skinCosts[9].materials.length,2);assert.equal(native.skinCosts[14].materials.length,3);
 assert.equal(native.legendCap,15);assert.equal(native.legendNeedExp[14],197);
 assert.equal(item(6930).progression.legendNeedExp[14],197);
});
test('upgrade systems keep their own caps, recipes and material links',()=>{
 const main=item(6043).progression,accessory=item(6814).progression,wing=item(6909).progression;
 assert.equal(main.kind,'equipment');assert.equal(main.multipliers.length,19);
 assert.equal(accessory.kind,'accessory');assert.equal(accessory.recipes.length,5);assert.equal(accessory.recipes[0].recipe.id,7061);assert.equal(accessory.recipes[0].gold,1875000);
 assert.equal(wing.recipes.length,60);assert.equal(wing.wingUnlockLevels.length,12);
 for(const p of [main,accessory,wing])for(const m of p.materials)assert(m.record?.icon);
 assert.equal(wing.recipes[0].gold,120000);assert.equal(wing.recipes[59].gold,432000000);
});
test('abyss is divided into twelve-layer pages and returns to its correct tab',()=>{
 for(let start=1;start<=133;start+=12){const data=abyssBrowser(start);assert.equal(data.regions.length,12);assert.equal(data.tabs.length,12);for(const region of data.regions)assert.equal(regionDetails(region.key).region.backHref,start===1?'/abyss/':`/abyss/range/${start}/`);}
 assert.equal(abyssBrowser(2),null);assert.equal(abyssBrowser(145),null);
});
