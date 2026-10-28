import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {categories,entries,detail,listing,regions,regionDetails,portalGroups,legacyEntries,legacyTarget,sourceData,regionBrowser,recordName,dropHints} from '../src/lib/server/data.ts';
import {enemyDifficultyStats,enemyPlayerStats} from '../src/lib/core/enemy-stats.ts';
import {criticalChance} from '../src/lib/core/combat.ts';
import {skinUnlockRate} from '../src/lib/core/drops.ts';
import {fieldLabel,fieldValue,attributeRows,fieldCurrency,isReferenceField} from '../src/lib/core/fields.ts';
const read=name=>JSON.parse(readFileSync(new URL(`../static/data/${name}.json`,import.meta.url),'utf8'));
const {tables}=JSON.parse(readFileSync(new URL('../src/lib/server/assets/wiki.json',import.meta.url),'utf8'));
const entryFor=(cat,id)=>`row-${tables[cat==='title'?'achievement':cat].findIndex(r=>r.id===id)}`;

test('catalogs show readable names while retaining internal IDs and lookup routes',()=>{
 for(const category of Object.keys(categories)){
  const catalog=listing(category);
  assert(catalog.columns.includes('name'));
  assert(!catalog.columns.some(isReferenceField),category);
  for(const record of catalog.records){
   assert(!/^ID\s|#N\/A/.test(record.name),`${category}/${record.id}`);
   assert.equal(detail(category,record.key).record.id,record.id);
   assert.equal(legacyTarget(category,record.key),`/data/${category}/${record.key}/`);
  }
 }
 assert(!listing('trial').columns.includes('items'));
 assert.equal(legacyTarget('enemy','4001'),listing('enemy').records.find(r=>r.id===4001).href);
 assert.match(recordName({itemid:999999,level:80},'make'),/未命名合成配方/);
 assert.match(recordName({id:999999},'item'),/資料待核對/);
 assert.equal(fieldValue('trial','hard',2),'白銀');
 const attrs=attributeRows('make',{itemid:6002,matequipid:6001,matid1:5038,matnum1:5,price:100,level:8});
 assert(!attrs.some(a=>a.label.includes('ID')));
 assert(attrs.some(a=>a.value==='100'&&a.currency==='gold'));
 assert(attrs.some(a=>a.value==='5'));
});

test('commerce catalogs link directly to resolved rewards and retain service details',()=>{
 for(const category of ['shop','exchange'])for(const record of listing(category).records){
  const row=tables[category][Number(record.key.slice(4))];
  const targetCategory=category==='shop'?'item':({1:'item',2:'item',6:'title',7:'pet',8:'skin'})[row.type];
  const targetIndex=targetCategory?tables[targetCategory==='title'?'achievement':targetCategory].findIndex(r=>r.id===row.itemid):-1;
  assert.equal(record.href,targetIndex>=0?`/data/${targetCategory}/row-${targetIndex}/`:`/data/${category}/${record.key}/`);
 }
 for(const group of listing('exchange').exchangeGroups)for(const entry of group.entries){
  if(entry.info.target)assert.equal(entry.record.href,entry.info.target.href);
 }
});

test('all point exchange names prefer Chinese and retain English as secondary text',()=>{
 for(const row of tables.exchange){
  const result=detail('exchange',entryFor('exchange',row.id)).record;
  assert.match(result.name,/[\u3400-\u9fff]/,`exchange ${row.id}`);
  assert.equal(result.english,row.desc_en);
  if([4,5].includes(row.type))assert.equal(result.name,row.desc);
 }
 assert.equal(detail('exchange',entryFor('exchange',62)).record.name,'背包上限 · 第1階');
 assert.equal(detail('exchange',entryFor('exchange',74)).record.name,'戰鬥速度 · 第1階');
});

test('exchange resolves reward namespaces and six sequential boost chains',()=>{
 const groups=listing('exchange').exchangeGroups;
 assert.equal(groups.filter(g=>g.boost).length,6);
 for(const g of groups.filter(g=>g.boost)){
  const tiers=g.entries[0].info.tiers;
  assert.equal(tiers.length,g.entries.length);
  assert.deepEqual(tiers.map(t=>t.stage),Array.from({length:tiers.length},(_,i)=>i+1));
  assert.equal(tiers.at(-1).totalPoints,g.entries.reduce((sum,e)=>sum+e.info.point,0));
 }
 const bag=detail('exchange',entryFor('exchange',110)).exchange;
 assert.equal(bag.tiers.at(-1).effect,'+40格');assert.equal(bag.tiers.at(-1).totalPoints,2850);
 const speed=detail('exchange',entryFor('exchange',112)).exchange;
 assert.equal(speed.tiers.at(-1).effect,'+40%');assert.equal(speed.tiers.at(-1).totalPoints,4350);
 for(const row of tables.exchange.filter(r=>[6,7,8].includes(r.type)&&r.itemid>0)){
  const d=detail('exchange',entryFor('exchange',row.id)),cat={6:'title',7:'pet',8:'skin'}[row.type];
  assert.equal(d.exchange.target.category,cat);assert.equal(d.exchange.target.id,row.itemid);
  assert(d.relations.some(r=>r.category===cat&&r.id===row.itemid));
  assert(d.record.name.includes(d.exchange.target.name));assert.equal(d.record.stackable,false);
 }
});

test('all nine random equipment offers resolve native fixed pools',()=>{
 const native=read('exchange-pools-native');
 const offers=listing('exchange').exchangeGroups.flatMap(g=>g.entries).filter(e=>e.info.kind==='隨機裝備');
 assert.equal(offers.length,9);
 for(const entry of offers){
  const row=tables.exchange.find(r=>r.id===entry.record.id);
  assert.deepEqual(entry.info.pool.map(r=>r.id),native.pools[row.itemid]);
  assert.equal(entry.info.pool.length,row.itemid===100?4:8);
  assert(entry.info.pool.every(r=>r.icon&&r.href.startsWith('/data/item/')));
  assert.equal(detail('exchange',entry.record.key).exchange.pool.length,entry.info.pool.length);
 }
});

test('recipes exclude operation keys while retaining upgrade details',()=>{
 const records=listing('make').records;
 assert.equal(records.length,tables.make.length-21);
 for(const record of records){
  const row=tables.make[Number(record.key.slice(4))],item=tables.item.find(r=>r.id===row.itemid);
  assert(record.recipeGroup);
  assert(item);
  if(item.type===2&&item.subtype===1)assert.equal(record.recipeGroup,'武器');
  else if(item.type===1&&item.subtype===4)assert.equal(record.recipeGroup,'寶石');
 }
 for(const [index,row] of tables.make.entries())if(!tables.item.some(item=>item.id===row.itemid)){
  assert(!records.some(record=>record.key===`row-${index}`));
  assert(detail('make',`row-${index}`).makeOperation);
 }
 assert.equal(records.filter(r=>r.recipeGroup==='成品待核對').length,0);
});

test('all items are classified and acquisition claims distinguish drops from clues',()=>{
 const items=listing('item').records;
 assert.equal(items.length,561);assert(items.every(item=>item.itemGroup));
 assert.equal(items.filter(item=>item.availability.status==='有掉落設定').length,381);
 assert.equal(items.filter(item=>item.availability.status==='僅有掉落線索').length,9);
 assert.equal(items.filter(item=>item.availability.status==='未找到掉落設定').length,171);
 for(const item of items){
  const data=detail('item',item.key);
  assert.equal(data.availability.status,item.values.availability);
  assert.equal(data.availability.copies.length>0,item.availability.status==='有掉落設定');
  assert.equal(data.availability.sources.includes('打怪掉落'),data.availability.copies.length>0);
  assert.equal(new Set(data.availability.sources).size,data.availability.sources.length);
 }
 assert(items.find(item=>item.id===5124).availability.methods.includes('合成配方'));
 assert.equal(items.find(item=>item.id===6901).itemGroup,'翅膀');
 assert(items.find(item=>item.id===6901).availability.methods.some(method=>method.includes('翅膀頁面購買')));
 assert(items.find(item=>item.id===6911).availability.methods.includes('積分隨機裝備池'));
 assert(items.find(item=>item.id===5002).availability.sources.includes('商店購買'));
 assert(items.find(item=>item.id===5002).availability.sources.includes('幸運寶箱（隨機）'));
});

test('unverified gem records are excluded from catalog and search routes while raw evidence remains',()=>{
 const items=listing('item').records;
 const audit=read('item-missing-icons');
 assert.equal(audit.items.length,26);
 assert(items.every(item=>item.icon));
 for(const item of audit.items){
  const key=entryFor('item',item.id);
  assert(!items.some(record=>record.id===item.id));
  assert(!entries('item').some(record=>record.entry===key));
  const data=detail('item',key);
  assert.equal(data.record.icon,null);
  assert.deepEqual(data.availability.methods,[]);
  assert.deepEqual(data.availability.candidates,[]);
  assert.deepEqual(data.availability.copies,[]);
 }
 for(const id of [5122,5123,5124,5142,5143,5144,6813])assert(items.some(item=>item.id===id));
});

test('item special attributes have official names and legacy gems retain their own descriptions',()=>{
 const language=read('item-attribute-language').labels;
 for(const id of [34,41,54,55,56])assert(language[`extraattr${id}`]);
 for(const row of tables.item){
  const attrs=attributeRows('item',row);
  assert(!attrs.some(attr=>/待解讀屬性/.test(attr.label)),row.name);
 }
 const legacy=tables.item.find(row=>row.id===5022);
 assert.equal(fieldValue('item','effecttype',legacy.effecttype,legacy),`${legacy.describe}（原始描述）`);
 assert.equal(fieldValue('item','special',3,legacy),'完美');
 assert.equal(fieldValue('item','specialgrow',1),'成長型');
});

test('treasure catalog explains uses instead of stringifying arrays, and resolves pets',()=>{
 const catalog=listing('treasure');
 assert.equal(catalog.records.length,14);assert(!catalog.columns.includes('items'));
 for(const record of catalog.records){
  assert.match(record.name,/[\u3400-\u9fff]/);
  assert.equal(typeof record.values.usage,'string');
  const d=detail('treasure',record.key);
  assert.equal(record.values.rewardCount,d.pool.length);
  assert(d.pool.every(r=>r.item));assert(!JSON.stringify(record).includes('[object Object]'));
 }
 const chest=detail('treasure',entryFor('treasure',1));assert(chest.isChest);assert.equal(chest.pool.length,30);assert.equal(chest.treasure.source.id,5012);assert(chest.pool.every(r=>r.rate>0));
 const activity=detail('treasure',entryFor('treasure',200));
 assert.deepEqual(activity.pool.filter(r=>r.item.category==='pet').map(r=>r.id),[4020,4029]);
 assert(activity.pool.every(r=>r.rate===null));assert(activity.relations.some(r=>r.category==='pet'&&r.id===4020));
 assert(detail('treasure',entryFor('treasure',10)).treasure.usage.includes('尚待核對'));
});

test('readable fields keep item code namespaces separate and pair skin/artifact attributes',()=>{
 assert.equal(fieldCurrency('shop','itemprice'),'money');
 assert.equal(fieldCurrency('item','price'),'gold');
 assert.equal(fieldCurrency('make','price'),'gold');
 assert.equal(fieldCurrency('pet','money'),undefined);
 assert.equal(fieldCurrency('exchange','point'),undefined);
 assert.equal(fieldCurrency('treasure','price'),undefined);
 assert.equal(fieldLabel('itemprice','shop'),'購買價格（魔石）');
 assert.equal(fieldLabel('price','make'),'合成費用（金幣）');
 for(const file of ['coin_bg','money_bg'])assert(existsSync(new URL(`../static/icons/currency/${file}.png`,import.meta.url)));
 assert.equal(fieldValue('item','quality',6),'神器');
 assert.deepEqual([1,2,3,4,5,6].map(q=>fieldValue('pet','quality',q)),['普通','標準','優秀','極品','神獸','遠古神獸']);
 assert.equal(fieldValue('item','subtype',3,{type:1}),'材料');
 assert.equal(fieldValue('item','subtype',3,{type:2}),'鎧甲');
 assert.equal(fieldValue('item','maintype',3),'生命');
 assert.equal(fieldValue('item','effecttype',12),'挖礦');
 assert.equal(fieldValue('skin','type1',12),'基礎攻擊%');
 assert.equal(fieldLabel('spetype12'),'特殊屬性 12');
 assert.equal(fieldLabel('mystery'),'待解讀欄位（mystery）');
 assert(fieldValue('item','effecttype',999).includes('待解讀'));
 const warrior=attributeRows('skin',tables.skin[0]);
 assert(warrior.some(a=>a.label==='攻擊'&&a.value==='180'));
 assert(warrior.some(a=>a.label==='附加屬性：攻擊'&&a.value==='280'));
 assert(!warrior.some(a=>a.label.includes('第一屬性')||a.label==='附加屬性類型'));
 const artifact=attributeRows('god',tables.god[0]);
 assert(artifact.some(a=>a.label==='攻擊'&&a.value==='200'));
 for(const category of ['item','skin'])for(const row of tables[category]){
  for(const a of attributeRows(category,row))assert(!a.label.startsWith('待解讀欄位'),`${category}/${row.id}/${a.label}`);
 }
});

test('adventure hidden bosses belong to their chapters and start at paragon 300',()=>{
 for(const [chapter,copy,enemy] of [[19,1201,4137],[20,1202,4138],[21,1203,4139]]){
  const region=regions.find(r=>r.key===`chapter-${chapter}`);
  assert.equal(region.hiddenCopyId,copy);
  assert(region.copyIds.includes(copy));
  assert.equal(regionDetails(region.key).enemies.find(e=>e.id===enemy).minDifficulty,5);
  const page=detail('enemy',entryFor('enemy',enemy));
  assert(page.supported);assert.equal(page.minDifficulty,5);
  assert(page.rewards.every(r=>r.condition.includes('巔峰300')));
  assert(!regions.find(r=>r.key==='extra-adventure')?.copyIds.includes(copy));
 }
 assert.equal(regions.filter(r=>r.hiddenCopyId).length,3);
 assert.equal(detail('enemy',entryFor('enemy',4001)).minDifficulty,1);
});

test('all 15 published categories, 2636 records and downloadable source hashes are retained',()=>{
 assert.equal(categories.exchange,'積分兌換');
 assert.equal(categories.exchange2,undefined);
 assert.equal(listing('exchange2'),null);
 assert.equal(detail('exchange2','row-0'),null);
 assert.equal(sourceData().sources.exchange2,undefined);
 assert(!existsSync(new URL('../static/data/exchange2.json',import.meta.url)));
 assert(!detail('item',entryFor('item',5012)).relations.some(r=>r.category==='exchange2'));
 for(const cat of ['treasure2','treasure222222']){
  assert.equal(listing(cat),null);assert.equal(detail(cat,'row-0'),null);
  assert.equal(sourceData().sources[cat],undefined);
  assert(!existsSync(new URL(`../static/data/${cat}.json`,import.meta.url)));
  assert(!detail('item',entryFor('item',5059)).relations.some(r=>r.category===cat));
 }
 assert.equal(entries('treasure').length,14);
 for(const cat of ['transmit','teach','warenemys','god','level','chapter','copy']){
  assert.equal(categories[cat],undefined);assert.equal(listing(cat),null);assert.deepEqual(entries(cat),[]);
  assert.equal(sourceData().sources[cat],undefined);assert(!existsSync(new URL(`../static/data/${cat}.json`,import.meta.url)));
 }
 assert.equal(fieldLabel('level','level'),'關卡等級（設定值）');assert.equal(fieldLabel('from','god'),'資料記載來源（未核實取得）');
 assert.equal(Object.keys(categories).length,15);
 assert.equal(Object.keys(categories).reduce((n,cat)=>n+entries(cat).length,0),2636);
 for(const cat of Object.keys(categories)){
  if(cat==='title')continue;
  const data=detail(cat,'row-0');assert(data,cat);assert(!['null','undefined',''].includes(data.record.name),cat);
  if(data.record.icon)assert(existsSync(new URL('../static'+data.record.icon,import.meta.url)),cat);
  const bytes=readFileSync(new URL(`../static/data/${cat}.json`,import.meta.url));
  assert.deepEqual(JSON.parse(bytes),tables[cat],cat);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),sourceData().sources[cat].jsonSha256,cat);
 }
});
test('internal drop catalogs are archived and hints retain exact copy membership',()=>{
 for(const category of ['drop','droptip']){
  assert.equal(categories[category],undefined);assert.equal(listing(category),null);
  assert.equal(detail(category,'row-0'),null);assert.deepEqual(entries(category),[]);
  assert(existsSync(new URL(`../static/data/${category}.json`,import.meta.url)));
 }
 let copies=0;
 for(const copy of tables.copy.filter(copy=>Number(copy.droptipid)>0)){
  const tip=tables.droptip.find(tip=>tip.id===copy.droptipid),hints=dropHints([copy]);
  assert.equal(hints.length,1);assert.equal(hints[0].id,tip.id);
  assert.deepEqual(hints[0].sources.map(source=>source.id),[copy.id]);
  assert.deepEqual(hints[0].items.map(item=>item.id),Object.entries(tip).filter(([key,id])=>/^itemid\d+$/.test(key)&&id>0).map(([,id])=>id));
  for(const enemy of tables.enemy.filter(enemy=>Object.entries(copy).some(([key,id])=>/^enemyid\d*$/.test(key)&&id===enemy.id))){
   const page=detail('enemy',entryFor('enemy',enemy.id));
   assert(page.dropHints.some(hint=>hint.id===tip.id&&hint.sources.some(source=>source.id===copy.id)));
   assert(!page.rewards.some(reward=>reward.draws.every(draw=>draw.field==='droptip')));
  }
  copies++;
 }
 assert.equal(copies,187);assert.equal(dropHints(tables.copy).length,31);
 assert(regionDetails('copy-5001').dropHints.length);
 assert.equal(legacyTarget('chapter'),'/regions/');
 assert.equal(legacyTarget('chapter','row-0'),'/regions/chapter-1/');
 assert.equal(legacyTarget('chapter','100'),'/regions/rift/');
 assert.equal(legacyTarget('chapter','row-21'),'/regions/rift/');
 assert.equal(legacyTarget('chapter','row-999'),null);
});

test('all 29889 enemy quality/difficulty combinations match native fixture',()=>{
 const enemies=new Map(tables.enemy.map(r=>[r.id,r]));
 const native=read('enemy-difficulty-native');assert.equal(native.rows.length,29889);
 for(const row of native.rows){
  const stats=enemyDifficultyStats(enemies.get(row.enemyId),row.quality,row.difficulty);
  for(const [key,value] of Object.entries(stats))assert.equal(value,row[key],`${row.enemyId}/${row.quality}/${row.difficulty}/${key}`);
 }
 const wolf=enemies.get(4001);
 assert.equal(enemyPlayerStats(wolf,1,1,80,1500).hp,60);
 assert.equal(enemyPlayerStats(wolf,1,4,80,1500).hp,36960);
 assert.equal(enemyPlayerStats(wolf,1,9,80,1500).hp,84150);
 for(const row of read('enemy-paragon-reference').rows){
  const stats=enemyPlayerStats(enemies.get(row.enemyId),row.quality,row.difficulty,row.playerLevel,row.playerParagon);
  for(const [key,value] of Object.entries(stats))assert.equal(value,row[key],`paragon/${row.enemyId}/${row.playerLevel}/${row.playerParagon}/${key}`);
 }
 assert.throws(()=>enemyPlayerStats(wolf,1,9,0,1500),RangeError);
 assert.throws(()=>enemyDifficultyStats(wolf,4,9),RangeError);
});
test('item and skin pages retain reverse drop sources and recipe links',()=>{
 const item=detail('item',entryFor('item',6002));assert(item.relations.some(r=>r.category==='make'));
 const recipe=detail('make',item.relations.find(r=>r.category==='make').key);
 assert(recipe.product);assert(recipe.materials.length);assert(recipe.relations.some(r=>r.category==='item'));
 const bone=detail('item',entryFor('item',5046));assert(bone.rewards.some(r=>r.copy?.id===1001));
 const skin=detail('skin',entryFor('skin',8010));assert(skin.rewards.some(r=>r.unlock&&r.copy?.id===1001));
 assert.equal(detail('drop','row-0'),null);
 assert(detail('treasure','row-0').pool.every(r=>r.rate>0));
 assert(detail('treasure','row-1').pool.every(r=>r.rate===null));
});
test('independent drops combine exact quantities only for identical eligibility',()=>{
 const wolf=detail('enemy',entryFor('enemy',4001));
 const bone=wolf.rewards.find(r=>r.copy?.id===1001&&r.itemId===5046&&r.rates.length);
 assert(bone);assert.equal(bone.draws.length,2);assert.equal(bone.rates.length,2);
 const [a,b]=bone.draws.map(d=>d.rate/100);
 assert(Math.abs(bone.rates[0].percent-(a*(1-b)+b*(1-a))*100)<1e-9);
 assert(Math.abs(bone.rates[1].percent-a*b*100)<1e-9);
 assert(Math.abs(bone.zeroRate+bone.rates.reduce((n,r)=>n+r.percent,0)-100)<1e-9);
 assert(wolf.rewards.find(r=>r.unlock).rates.length===0);
 assert.equal(skinUnlockRate(1163,1),0);assert.equal(skinUnlockRate(1163,1,true),11.999);
 assert.equal(skinUnlockRate(1001,1),.029);assert.equal(skinUnlockRate(1001,.7),.02);
});
test('drop sources resolve exact monster IDs and levels without multiplying shared rewards',()=>{
 const bone=detail('item',entryFor('item',5046)).rewards.find(r=>r.copy?.id===1001&&r.rates.length);
 assert.deepEqual(bone.enemies.map(e=>[e.id,e.level]),[[4001,1]]);
 assert(bone.locations.some(location=>location.name.includes('勇者平原')&&location.href==='/regions/chapter-1/'));
 assert.equal(bone.enemies[0].href,'/data/enemy/row-0/');
 const shared=detail('copy',entryFor('copy',2070));assert(shared.rewards.length);
 for(const reward of shared.rewards){
  assert.equal(reward.enemies.length,4);
  assert.deepEqual(reward.enemies.map(e=>e.id),[4764,4765,4766,4767]);
  assert(reward.enemies.every(e=>e.level>0&&e.category==='enemy'));
 }
 const deep=detail('copy',entryFor('copy',5001));assert(deep.rewards.length);
 assert(deep.rewards.every(reward=>reward.locations.some(location=>location.name==='深淵 · 第1层'||location.name==='深淵 · 第1層')));
 assert.deepEqual(deep.rewards[0].enemies.map(e=>e.id),[5001,5002,5003,5004]);
 assert(!deep.rewards[0].enemies.some(e=>e.id===4001));
});
test('dungeon families, five-slot daily/ancient encounters and portals remain separate',()=>{
 for(const [category,count] of Object.entries({normal:18,challenge:12,daily:7,ancient:1,random:5,portal:53}))assert.equal(regions.filter(r=>r.dungeonCategory===category).length,count,category);
 assert.equal(regions.filter(r=>r.copyType===5).length,144);
 assert.equal(regionDetails('copy-2070').enemies.length,4);
 assert(regionDetails('copy-2070').randomFive);
 assert(regionDetails('copy-2060').randomFive);
 assert(regionDetails('rift').enemies.length>0);
 const portals=portalGroups();assert(portals.length>1);assert(portals.every(p=>p.regions.length>0));
 for(const portal of portals)assert(portal.regions.every(r=>r.category==='portal'));
 const abyssEnemy=regionDetails(regions.find(r=>r.copyType===5).key).enemies[0];
 const abyss=detail('enemy',abyssEnemy.key);assert(abyss.abyssOnly);assert(!abyss.supported);
});
test('invalid route data never resolves prototype keys or unknown records',()=>{
 for(const category of ['constructor','__proto__','toString','missing']){
  assert.equal(listing(category),null);assert.equal(detail(category,'row-0'),null);assert.deepEqual(entries(category),[]);
 }
 for(const entry of ['row--1','row-01','row-1.5','row-Infinity','row-999999999999999999999','4001'])assert.equal(detail('enemy',entry),null);
 assert.equal(regionDetails('missing'),null);assert.equal(legacyTarget('missing'),null);
});
test('map tabs return only the selected category and preserve return destinations',()=>{
 for(const [category,count] of Object.entries({normal:18,challenge:12,daily:7,ancient:1,random:5,portal:53})){
  const data=regionBrowser(category);assert.equal(data.regions.length,count);
  assert(data.regions.every(region=>region.category===category));
  assert.equal(data.activeGroup,['normal','challenge'].includes(category)?category:'other');
  for(const region of data.regions)assert.equal(region.backHref,`/regions/browse/${category}/`);
 }
 const data=regionBrowser();assert.equal(data.activeGroup,'adventure');assert(data.regions.every(r=>r.category==='adventure'));
 assert.equal(data.extras.length,0);assert.equal(data.portals.length,0);
 assert.equal(regionBrowser('portal').portals.length,8);
 assert.equal(regionBrowser('missing'),null);
 assert.equal(regionDetails(regions.find(r=>r.copyType===5).key).region.backHref,'/abyss/');
});
test('old numeric, row and list links resolve to the new routes',()=>{
 assert.equal(categories.transmit,undefined);assert.equal(listing('transmit'),null);assert.deepEqual(entries('transmit'),[]);
 assert.equal(sourceData().sources.transmit,undefined);assert(!existsSync(new URL('../static/data/transmit.json',import.meta.url)));
 assert.equal(portalGroups().length,8);assert.equal(portalGroups().reduce((sum,g)=>sum+g.regions.length,0),53);
 assert.equal(legacyTarget('transmit'),'/regions/browse/portal/');
 assert.equal(legacyTarget('transmit','row-0'),'/regions/browse/portal/#portal-1');
 assert.equal(legacyTarget('transmit','8'),'/regions/browse/portal/#portal-8');
 assert.equal(legacyTarget('transmit','row-99'),null);
 assert.equal(legacyTarget('enemy','4001'),'/data/enemy/row-0/');
 assert.equal(legacyTarget('enemy','row-0'),'/data/enemy/row-0/');
 assert.equal(legacyTarget('enemy','page-2'),'/data/enemy/page/2/');
 assert.equal(legacyTarget('all'),'/search/');
 for(const params of legacyEntries())assert(legacyTarget(params.legacy,params.entry),JSON.stringify(params));
});
test('critical calculator retains verified example and rejects invalid values',()=>{
 const example={rating:54597,roleLevel:80,paragonLevel:1500,bonus:36,resistance:90};
 assert.equal(criticalChance(example).toFixed(2),'28.71');
 assert.equal(criticalChance({...example,resistance:100}),0);
 assert.equal(criticalChance({...example,rating:NaN}),null);
 assert.equal(criticalChance({...example,resistance:101}),null);
});

test('achievements and titles have separate catalogs and canonical detail links',()=>{
 const achievements=listing('achievement').records,titles=listing('title').records;
 assert(achievements.length>0&&titles.length>0);
 assert.equal(achievements.length+titles.length,tables.achievement.length);
 for(const [category,records,type] of [['achievement',achievements,1],['title',titles,2]]){
  assert.equal(entries(category).length,records.length);
  for(const record of records){
   assert.equal(detail(category,record.key).row.type,type);
   assert.equal(record.category,category);
   assert.equal(record.href,`/data/${category}/${record.key}/`);
  }
 }
 const title=titles[0];
 assert.equal(detail('achievement',title.key).record.href,title.href);
});

test('title acquisition resolves every prerequisite and reciprocal achievement link',()=>{
 for(const title of tables.achievement.filter(row=>row.type===2)){
  const data=detail('title',entryFor('title',title.id));
  const required=[title.require1,title.require2,title.require3].filter(id=>id>0);
  assert.deepEqual(data.titleUnlock.requirements.map(record=>record?.id),required);
  for(const id of required){
   const achievement=detail('achievement',entryFor('achievement',id));
   const reverse=achievement.unlockedTitles.find(record=>record.record.id===title.id);
   assert(reverse);assert.equal(reverse.automatic,title.subtype===52);
   assert.deepEqual(reverse.requirements.map(record=>record.id),required);
  }
  for(const offer of data.titleUnlock.exchanges){
   assert.equal(offer.info.target.category,'title');
   assert.equal(offer.info.target.id,title.id);
  }
  assert(data.titleUnlock.condition||data.titleUnlock.note);
 }
 assert.equal(detail('title',entryFor('title',111)).titleUnlock.requirements.length,3);
 assert.equal(detail('title',entryFor('title',207)).titleUnlock.condition,null);
 assert.equal(detail('title',entryFor('title',144)).titleUnlock.exchanges[0].info.point,500);
 assert(detail('title',entryFor('title',101)).titleUnlock.condition.includes('10'));
 assert(detail('title',entryFor('title',193)).titleUnlock.condition.includes('14'));
});

test('legacy pagination stays within filtered catalogs and excludes archived gem redirects',()=>{
 assert.equal(legacyTarget('make','page-4'),'/data/make/page/3/');
 assert.equal(legacyTarget('title','page-6'),'/data/title/page/3/');
 for(const route of legacyEntries()){
  if(route.legacy==='item'&&'entry' in route&&route.entry.startsWith('row-'))assert(entries('item').some(row=>row.entry===route.entry));
 }
});

test('pet adventure rewards are included in item acquisition sources',()=>{
 for(const reward of tables.explored){
  const data=detail('item',entryFor('item',reward.itemid));
  assert(data.availability.sources.includes('\u5bf5\u7269\u63a2\u96aa'));
 }
 assert(!detail('item',entryFor('item',5001)).availability.sources.includes('\u5bf5\u7269\u63a2\u96aa'));
});

test('triggered hidden encounters stay in their originating adventure regions',()=>{
 for(const [regionKey,copyIds] of [['chapter-1',[3001,3003]],['chapter-2',[3002,3004]]]){
  const region=regions.find(r=>r.key===regionKey);
  for(const copyId of copyIds){
   assert(region.copyIds.includes(copyId));
   const copy=tables.copy.find(c=>c.id===copyId);
   assert(regionDetails(regionKey).enemies.find(e=>e.id===copy.enemyid1).hiddenEncounter);
   assert(!regions.some(r=>r.key==='copy-'+copyId));
  }
 }
 assert(!regionDetails('chapter-1').enemies.find(e=>e.id===4001).hiddenEncounter);
});

test('hidden encounter battle names are not presented as standalone regions',()=>{
 const fireCopies=tables.copy.filter(c=>c.type===4&&c.name.includes('\u706b\u9f99'));
 assert(fireCopies.length>0);
 for(const copy of fireCopies){
  assert(!regions.some(r=>r.key==='copy-'+copy.id));
  const rewards=detail('enemy',entryFor('enemy',copy.enemyid1)).rewards;
  assert(rewards.every(reward=>reward.locations.every(location=>location.href!=='/regions/copy-'+copy.id+'/')));
 }
});
