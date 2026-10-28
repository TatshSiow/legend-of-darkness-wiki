import enchantNative from '../static/data/enchant-native.json' with {type:'json'};
import {test} from 'node:test';
import assert from 'node:assert/strict';
import native from '../src/lib/server/assets/item-mechanics-native.json' with {type:'json'};
import {equipmentCosts,strengthCost,equipmentStat,chestRates,randomAttributeRange,refineCost,fixedEquipmentAttributes,equipmentAffixes,socketCost,gemInsertionCost,gemRemovalCost,enchantValue} from '../src/lib/core/item-mechanics.ts';
import uiNative from '../static/data/equipment-ui-native.json' with {type:'json'};
import {abyssBrowser,regionDetails,detail} from '../src/lib/server/data.ts';
import raw from '../src/lib/server/assets/wiki.json' with {type:'json'};
const item=id=>detail('item',`row-${raw.tables.item.findIndex(r=>r.id===id)}`);

test('fixed gear affixes match screenshot items and exclude generation parameters',()=>{
 const row=id=>raw.tables.item.find(r=>r.id===id);
 assert.deepEqual(fixedEquipmentAttributes(row(6333)),[{type:4,value:265},{type:5,value:81},{type:7,value:283}]);
 assert.deepEqual(fixedEquipmentAttributes(row(6045)),[{type:9,value:8}]);
 assert.deepEqual(fixedEquipmentAttributes(row(6046)),[{type:47,value:6}]);
 assert.deepEqual(fixedEquipmentAttributes(row(6136)),[]);
 assert.deepEqual(fixedEquipmentAttributes(row(6536)),[]);
 assert.deepEqual(fixedEquipmentAttributes({attper:12,hpper:8,tematt:900}),[{type:12,value:12},{type:14,value:8}]);
});
test('paragon affix slots preserve fixed types and select remaining types without replacement',()=>{
 const pool=Object.values(native.attributePools.equipment),row=id=>raw.tables.item.find(r=>r.id===id);
 assert.deepEqual(pool.map(a=>a[0]).sort((a,b)=>a-b),[...uiNative.affixTypes].sort((a,b)=>a-b));
 const arcane=equipmentAffixes(row(6046),pool);
 assert.equal(arcane.fixed.length,1);assert.equal(arcane.randomCount,4);
 assert.equal(arcane.candidates.length,16);assert(!arcane.candidates.some(a=>a[0]===47));
 assert.equal(arcane.slotRate,6.25);assert.equal(arcane.itemRate,25);
 const dark=equipmentAffixes(row(6136),pool);assert.equal(dark.randomCount,5);assert.equal(dark.candidates.length,17);
 const lucky=equipmentAffixes(row(6045),pool);assert.equal(lucky.randomCount,4);assert.equal(lucky.candidates.length,17);
 assert.equal(equipmentAffixes(row(6333),pool).randomCount,0);
 for(const row of raw.tables.item.filter(r=>r.type===2&&r.subtype<=8&&r.paragon)){
  const a=equipmentAffixes(row,pool);assert.equal(a.fixed.length+a.randomCount,5);assert(a.candidates.length>=a.randomCount);
 }
 for(const row of uiNative.socketCosts)assert.equal(socketCost(row.opened),row.quantity);
 assert.throws(()=>socketCost(3),RangeError);
});

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

test('gem insertion and removal charge by current occupied count',()=>{
 for(const row of uiNative.gemInsertionCosts)assert.equal(gemInsertionCost(row.opened),row.money);
 for(const row of uiNative.gemRemovalCosts){
  assert.equal(gemRemovalCost(row.occupied),row.money);
  assert.equal((Math.imul(row.occupied*3,0x5555555c)+20)>>>0,row.money);
 }
 assert.throws(()=>gemInsertionCost(3),RangeError);
 assert.throws(()=>gemRemovalCost(0),RangeError);
 assert.throws(()=>gemRemovalCost(4),RangeError);
 assert.equal([1,2,3].reduce((sum,n)=>sum+gemRemovalCost(n),0),180);
});

test('all eight enchant attributes and seven ranks match native ARM samples',()=>{
 for(const row of enchantNative.samples)for(let rank=1;rank<=7;rank++)assert.equal(enchantValue(row.type,rank,row.level),row.values[rank-1],JSON.stringify({level:row.level,type:row.type,rank}));
 assert.throws(()=>enchantValue(0,1,80),RangeError);
 assert.throws(()=>enchantValue(1,8,80),RangeError);
 assert.throws(()=>enchantValue(1,1,81),RangeError);
});
