import raw from './assets/wiki.json' with {type:'json'};
import images from './assets/icons.json' with {type:'json'};
import mechanics from './assets/item-mechanics-native.json' with {type:'json'};
import exchangePools from './assets/exchange-pools-native.json' with {type:'json'};
import {chestRates} from '#lib/core/item-mechanics.ts';
import type { WikiData, GameRecord, JsonValue } from '#lib/core/types.ts';
import { isValue,isReferenceField } from '#lib/core/fields.ts';
import {mapCategories,mapCategoryHref,otherMapTabs} from '#lib/core/region-navigation.ts';
import { buildRegions, enemyIdsInCopies } from '#lib/core/regions.ts';
import { copyDrops, dropQuantityProbabilities, dropTableRate, skinUnlockRate } from '#lib/core/drops.ts';

const { tables:sourceTables, metadata } = raw as unknown as WikiData;
const tables:WikiData['tables']={...sourceTables,title:sourceTables.achievement};
export const categories: Record<string,string> = {
 enemy:'敵人圖鑑',item:'物品與裝備',skill:'技能',skillte:'技能效果',pet:'寵物',skin:'幻化',
 achievement:'成就',title:'稱號',drop:'掉落表',
 droptip:'掉落提示',explored:'探索',trial:'試煉獎勵',task:'任務',
 treasure:'寶箱與寶藏獎勵池',
 make:'合成配方',shop:'商店',exchange:'積分兌換'
};
// Audited gem records without original art or any known acquisition source; retain raw rows for research.
const archivedGemIds=new Set([...Array.from({length:25},(_,i)=>5013+i),5154]);
const publishedRow=(category:string,row:GameRecord)=>(category!=='item'||!archivedGemIds.has(Number(row.id)))&&(category!=='achievement'||row.type===1)&&(category!=='title'||row.type===2);
const mappings = images.records as Record<string,{url:string}>;
const categoryDescriptions:Record<string,string>={drop:'列出掉落表內全部道具、數量與倍率 1 倍的表內機率。這套舊掉落管理器尚未找到現行戰鬥入口，也沒有資料表直接引用其 ID；不能當成目前怪物掉落率。現行怪物掉落請由地區圖鑑或道具詳情查詢。',droptip:'遊戲介面顯示的掉落提示，包含全部提示道具、對應戰鬥與怪物等級。提示本身沒有數量或機率設定，也不保證實際掉落；已核對的機率請到怪物或道具詳情查看。'};
const rowId = (row: GameRecord) => row.id ?? row.dropid ?? row.itemid;
const indexes = Object.fromEntries(Object.entries(tables).map(([key,rows]) =>
 [key,new Map(rows.flatMap((row,index) => rowId(row) === undefined ? [] : [[String(rowId(row)),index]]))]));
export const regions = buildRegions(tables.chapter,tables.copy);
const allDrops = tables.copy.flatMap(copy => copyDrops(copy,tables.droptip));
// Only verified positive-rate drops from the native Divine-conversion copy types.
const divineDropItems=new Set(allDrops.filter(d=>d.rate!==null&&d.rate>0&&Number(tables.copy[indexes.copy.get(String(d.copyId))??-1]?.type)>=1&&Number(tables.copy[indexes.copy.get(String(d.copyId))??-1]?.type)<=6).map(d=>d.itemId));

function exchangeTarget(row:GameRecord){
 const category=({1:'item',2:'item',6:'title',7:'pet',8:'skin'} as Record<number,string>)[Number(row.type)];
 const index=category?indexes[category]?.get(String(row.itemid)):undefined;
 return category&&index!==undefined?{category,index,row:tables[category][index]}:null;
}
const exchangeBoosts:Record<number,{name:string;amount:number;unit:string}>={1:{name:'背包上限',amount:5,unit:'格'},2:{name:'寵物上限',amount:3,unit:'隻'},3:{name:'戰鬥速度',amount:5,unit:'%'},4:{name:'冒險怪物數量',amount:2,unit:'隻'},5:{name:'副本連刷數量',amount:1,unit:'次'},6:{name:'換裝欄位',amount:1,unit:'格'}};
function treasureContext(id:number){
 if(id===1)return {name:'幸運寶箱獎勵',usage:'使用幸運寶箱時，從此池抽出一筆獎勵。',sourceItem:5012};
 if(id>=3&&id<=8){const range=id===3?'Lv. 1～29':id===8?'Lv. 70～80':`Lv. ${(id-1)*10}～${id*10-1}`;return {name:`一般抽獎：${range}`,usage:`一般抽獎依角色等級選用此池；${range}。Lv. 80 且巔峰100以上改用高階池。`,sourceItem:null};}
 if(id===9)return {name:'高階抽獎：巔峰100以上',usage:'角色 Lv. 80、巔峰100以上的一般抽獎池；符合額外進階條件時可能改用進階池10。',sourceItem:null};
 if(id===10)return {name:'進階抽獎',usage:'高階抽獎符合額外條件後使用；該額外開關的遊戲內名稱尚待核對，不可單憑等級判斷。',sourceItem:null};
 if([60,70,80].includes(id)){const range=id===60?'Lv. 1～60':id===70?'Lv. 61～69':'Lv. 70～80';return {name:`戰鬥結算寶藏：${range}`,usage:`戰鬥結算的寶藏選項使用此池，角色等級範圍為 ${range}；Lv. 80、巔峰100以上改用池90。這不是幸運寶箱內容。`,sourceItem:null};}
 if(id===90)return {name:'高階／地圖寶藏',usage:'戰鬥結算在角色 Lv. 80、巔峰100以上使用；地圖寶藏對話也固定讀取此池。',sourceItem:null};
 if(id===200)return {name:'活動抽獎',usage:'活動抽獎介面的獎勵池，包含道具與寵物；目前活動的開放時間與條件未確認。',sourceItem:null};
 return {name:`獎勵池 ${id}`,usage:'使用入口待核對。',sourceItem:null};
}
function makeOperation(row:GameRecord){
 const id=Number(row.itemid),quality=Math.floor((id-7000)/10),step=id%10;
 if(quality>=3&&quality<=6&&step>=1&&step<=5&&id===7000+quality*10+step){
  const rarity=({3:'精良',4:'傳說',5:'史詩',6:'神器'} as Record<number,string>)[quality];
  return {name:`${rarity}特殊飾品：+${step-1} → +${step}`,group:'特殊飾品強化',description:`適用於${rarity}品質的特殊飾品，將既有飾品由 +${step-1} 強化至 +${step}，不會產生另一件道具。下列材料與費用為此階段需求。`};
 }
 if(id===7201)return {name:'特殊裝備附魔',group:'特殊裝備附魔',description:'特殊裝備附魔介面使用的材料與費用設定，作用於既有裝備，不是可合成的背包道具。'};
 return null;
}
export function recordName(row: GameRecord,category=''):string {
 if(category==='make'&&makeOperation(row))return makeOperation(row)!.name;
 if(category==='drop'){
  const names=Array.from({length:6},(_,i)=>tables.item[indexes.item.get(String(row[`id${i+1}`]))??-1]?.name).filter(isValue);
  return names.length?`${names.slice(0,2).join('、')}${names.length>2?'等':''}的掉落表`:'未確認用途的掉落表';
 }
 if(category==='droptip'){
  const copies=tables.copy.filter(c=>c.droptipid===row.id);
  return copies.length?`${copies[0].name}等${copies.length}場戰鬥的掉落提示`:'未確認用途的掉落提示';
 }
 if(category==='treasure')return treasureContext(Number(row.id)).name;
 if(category==='trial'){
  const ids=Number(row.itemid)>0?[Number(row.itemid)]:JSON.parse(String(row.items)) as number[];
  const target=ids.length===1?reference(row.itemtype===3?'pet':'item',ids[0]):null;
  const reward=target?.name??(row.itemtype===3?(ids.length>1?'隨機寵物獎勵':'寵物獎勵（資料待核對）'):'隨機裝備獎勵');
  return `${['青銅','白銀','黃金'][Number(row.hard)-1]} · ${row.score} 分：${reward}`;
 }
 if(category==='exchange'){
  const target=exchangeTarget(row);
  if(target&&[6,7,8].includes(Number(row.type)))return `${row.type===8?'解鎖幻化':row.type===6?'取得稱號':'取得寵物'}：${recordName(target.row)}`;
  if(row.type===9&&exchangeBoosts[Number(row.special)])return `${exchangeBoosts[Number(row.special)].name} · 第${row.num}階`;
 }
 const item = tables.item[indexes.item.get(String(row.itemid)) ?? -1];
 return String([row.name,row.title,item?.name,row.desc,row.describe,row.name_en,row.desc_en,row.describe_en]
  .find(value=>isValue(value)&&value!=='#N/A') ?? (category==='make'?`未命名合成配方${Number(row.level)>0?`（Lv. ${row.level}）`:''}`:`未命名${categories[category]??'項目'}（資料待核對）`));
}
export function summary(category: string,index: number) {
 const row = tables[category][index];
 if(category==='achievement'&&row.type===2)category='title';
 const commerce=['shop','exchange'].includes(category);
 const target=category==='exchange'?exchangeTarget(row):null;
 const item=commerce?(category==='exchange'?(target?.category==='item'?target.row:undefined):tables.item[indexes.item.get(String(row.itemid))??-1]):row;
 const iconKey=target?`${target.category==='title'?'achievement':target.category}:${target.index}`:category==='treasure'&&row.id===1?`item:${indexes.item.get('5012')}`:`${category==='title'?'achievement':category}:${index}`;
 return {key:`row-${index}`,category,id:rowId(row) ?? index,name:recordName(row,category),
  english:isValue(row.name_en) ? String(row.name_en) : isValue(row.desc_en)?String(row.desc_en):'',
  level:typeof row.level === 'number' ? row.level : null,
  quality:typeof row.quality === 'number' ? row.quality : null,
  stackable:(category==='item'||commerce)&&item?.type===1,
  quantity:commerce?Number(row.itemnum??row.num??1):undefined,
  icon:mappings[iconKey] ? '/'+mappings[iconKey].url : null,
  href:category==='copy'?`/regions/${regions.find(region=>region.copyIds.includes(Number(row.id)))?.key??'copy-'+row.id}/`:`/data/${category}/row-${index}/`};
}
export type Summary = ReturnType<typeof summary>;
function trialHasItem(reward:GameRecord,id:number){
 if(reward.itemtype===3)return false;
 if(reward.itemid===id)return true;
 try{const items=JSON.parse(String(reward.items));return Array.isArray(items)&&items.includes(id);}catch{return false;}
}
function itemAvailability(row:GameRecord){
 const id=Number(row.id),drops=allDrops.filter(drop=>drop.itemId===id&&!drop.reward);
 const positive=drops.filter(drop=>drop.rate!==null&&drop.rate>0),clues=drops.some(drop=>drop.rate===null);
 const methods=[
  ...(tables.make.some(recipe=>recipe.itemid===id)?['合成配方']:[]),
  ...(tables.shop.some(offer=>offer.itemid===id)?['商店設定']:[]),
  ...(tables.exchange.some(offer=>exchangeTarget(offer)?.category==='item'&&offer.itemid===id)?['積分兌換']:[]),
  ...(Object.values(exchangePools.pools).some(pool=>pool.includes(id))?['積分隨機裝備池']:[]),
  ...(row.type===2&&row.subtype===10?['翅膀頁面購買（需符合VIP及魔石條件）']:[]),
  ...(tables.treasure.find(pool=>pool.id===1)?.items?.some(item=>item.itemid===id&&Number(item.itemweight)>0)?['幸運寶箱獎勵池']:[])
 ];
 const candidates=[
  ...(tables.trial.some(reward=>trialHasItem(reward,id))?['試煉分數獎勵候選（仍需抽選）']:[]),
  ...(tables.treasure.some(pool=>pool.id!==1&&Array.isArray(pool.items)&&pool.items.some(item=>item.itemtype!==3&&item.itemid===id))?['抽獎／寶藏獎勵池候選（入口及條件見獎勵池）']:[])
 ];
 return {status:positive.length?'有掉落設定':clues?'僅有掉落線索':'未找到掉落設定',methods,candidates,
  copies:[...new Set(positive.map(drop=>drop.copyId))],
  note:positive.length?'已核對原版抽選分支；仍受模式、進度、巔峰等條件限制，詳見掉落表。':clues?'只有提示或特殊獎勵欄位，尚不能確認會經由打怪掉落。':'目前已核對的戰鬥掉落設定未列出此物品；不代表遊戲中絕對無法取得。'};
}
function exchangeInfo(row:GameRecord){
 const target=exchangeTarget(row),boost=row.type===9?exchangeBoosts[Number(row.special)]:null;
 const tiers=boost?tables.exchange.filter(r=>r.type===9&&r.special===row.special).sort((a,b)=>Number(a.num)-Number(b.num)):[];
 return {target:target?summary(target.category,target.index):null,boost,
  pool:row.type===4?((exchangePools.pools as Record<string,number[]>)[String(row.itemid)]??[]).map(id=>reference('item',id)!):[],
  kind:boost?'階段增益':row.type===8?'幻化解鎖':row.type===6?'稱號解鎖':row.type===7?'寵物':row.type===5?'角色改名':row.type===4?'隨機裝備':row.type===1?'材料與消耗品':'裝備與飾品',
  stage:Number(row.num),point:Number(row.point),requiredLevel:Number(row.needlevel),achievementPoints:Number(row.achievepoint),
  material:reference('item',row.needitem),materialCount:Number(row.needitemnum),
  tiers:tiers.map((r,i)=>({record:reference('exchange',r.id)!,stage:Number(r.num),point:Number(r.point),totalPoints:tiers.slice(0,i+1).reduce((sum,t)=>sum+Number(t.point),0),effect:`+${Number(r.num)*boost!.amount}${boost!.unit}`}))};
}
export type ExchangeInfo=ReturnType<typeof exchangeInfo>;
const enemiesByCopy = new Map<number,Summary[]>();
function reference(category: string,id: unknown) {
 const index = indexes[category]?.get(String(id));
 return index === undefined ? null : summary(category,index);
}
function catalogSummary(category:string,index:number){
 const record=summary(category,index),row=tables[category][index];
 const product=category==='make'?tables.item[indexes.item.get(String(row.itemid))??-1]:null;
 const recipeGroup=category!=='make'?null:makeOperation(row)?.group??(!product?'成品待核對':product.type===2?(product.subtype===1?'武器':[2,3,4,5,8].includes(Number(product.subtype))?'防具':[6,7].includes(Number(product.subtype))?'戒指與項鍊':product.subtype===9?'特殊飾品':'其他裝備'):product.subtype===4?'寶石':'材料與消耗品');
 const subtype=Number(row.subtype);
 const itemGroup=category!=='item'?null:row.type===2?(subtype<=8?'裝備':subtype===9?'特殊飾品':subtype===10?'翅膀':subtype>=11&&subtype<=14?'徽章':subtype===20?'幻化符文':'傳奇之石'):subtype===4?'寶石':subtype===5?'卷軸與地圖':subtype===9?'寵物道具':'材料與消耗品';
 const target=category==='exchange'?exchangeTarget(row):category==='shop'?{category:'item',index:indexes.item.get(String(row.itemid))}:null;
 return {...record,recipeGroup,itemGroup,...(target&&target.index!==undefined?{href:`/data/${target.category}/row-${target.index}/`}:{})};
}
export function listing(category: string) {
 if (!Object.hasOwn(categories,category)) return null;
 const preferred: Record<string,string[]> = {
  enemy:['id','name','level','quality'],item:['id','name','type','subtype','quality','level','availability'],
  skill:['id','name','hurt','hurtcount','bufftype','buffvalue'],skin:['id','name','type1','value1','type2','value2'],
  copy:['id','name','level','type'],pet:['id','name','quality','level'],
  shop:['id','name','type','itemprice'],exchange:['id','name','point','achievepoint'],treasure:['id','name','usage','rewardCount'],
  trial:['name','hard','score','itemnum'],make:['name','level','price','pro'],
  achievement:['name','needcount','awardspecial','awardmoney','titleRewards'],title:['name','quality','titleSource'],
  drop:['id','name','rewardCount','usage'],droptip:['id','name','rewardCount','sourceCount']
 };
 const columns = (preferred[category] ?? ['name',...Object.keys(tables[category][0] ?? {}).filter(key =>
  !isReferenceField(key)&&!['name','name_en','describe','describe_en','desc','tem','tem1','tem2','tem3','img','icon'].includes(key)).slice(0,4)]).filter(key=>!isReferenceField(key));
 return {name:categories[category],category,categoryDescription:categoryDescriptions[category]??null,initialPage:1,columns,exchangeGroups:category==='exchange'?[...new Set(tables.exchange.map(r=>r.type===9?`boost:${r.special}`:`type:${r.type}`))].map(key=>{
  const rows=tables.exchange.filter(r=>(r.type===9?`boost:${r.special}`:`type:${r.type}`)===key);
  const info=exchangeInfo(rows[0]);
  return {key,name:info.boost?.name??info.kind,boost:info.boost,entries:rows.map(row=>({record:catalogSummary('exchange',indexes.exchange.get(String(row.id))!),info:exchangeInfo(row)}))};
 }):null,records:tables[category].map((row,index) => ({...catalogSummary(category,index),
  availability:category==='item'?itemAvailability(row):null,
  values:Object.fromEntries(columns.map(key => [key,key==='titleSource'?titleUnlock(row).condition??(titleUnlock(row).exchanges.length?'積分兌換':'取得條件待核對'):key==='titleRewards'?tables.title.filter(title=>title.type===2&&[title.require1,title.require2,title.require3].includes(row.id)).map(title=>recordName(title,'title')).join('、')||'無直接前置關聯':key==='availability'?itemAvailability(row).status:key === 'id' ? rowId(row) : ['drop','droptip'].includes(category)&&key==='rewardCount'?Object.entries(row).filter(([k,v])=>(category==='drop'?/^id\d+$/:/^itemid\d+$/).test(k)&&Number(v)>0).length:category==='droptip'&&key==='sourceCount'?tables.copy.filter(c=>c.droptipid===row.id).length:category==='drop'&&key==='usage'?'現行戰鬥引用未確認':category==='treasure'&&key==='usage'?treasureContext(Number(row.id)).usage:category==='treasure'&&key==='rewardCount'?row.items?.length:row[key]]))})).filter(record=>publishedRow(category,tables[category][Number(record.key.slice(4))])&&(category!=='make'||!makeOperation(tables.make[Number(record.key.slice(4))])))};
}
export function regionSummary(region: typeof regions[number]) {
 return {key:region.key,name:region.name,english:region.englishName,level:region.levelRange || '',
  category:region.dungeonCategory || 'adventure',abyss:region.copyType === 5,
  icon:region.chapterIndex !== undefined ? mappings[`chapter:${region.chapterIndex}`]?.url :
   region.copyIndex !== undefined ? mappings[`copy:${region.copyIndex}`]?.url : undefined,
  href:`/regions/${region.key}/`,backHref:region.copyType===5?abyssHref(Math.floor((region.copyIds[0]-5001)/12)*12+1):mapCategoryHref(region.dungeonCategory||'adventure')};
}
export const abyssHref=(start:number)=>start===1?'/abyss/':`/abyss/range/${start}/`;
export function abyssBrowser(start=1){
 if(!Number.isInteger(start)||start<1||start>133||(start-1)%12)return null;
 return {start,tabs:Array.from({length:12},(_,i)=>({start:i*12+1,label:`${i*12+1}～${i*12+12}`,href:abyssHref(i*12+1)})),
  regions:regions.filter(r=>r.copyType===5&&r.copyIds[0]>=5000+start&&r.copyIds[0]<5012+start).map(regionSummary)};
}
export function regionBrowser(category='adventure') {
 const tab=mapCategories.find(tab=>tab.key===category);
 if(!tab)return null;
 const other=otherMapTabs.some(tab=>tab.key===category);
 return {activeGroup:other?'other':category,activeCategory:category,categoryName:tab.name,
  regions:regions.filter(r=>r.copyType!==5&&(r.dungeonCategory||'adventure')===category).map(regionSummary),
  portals:category==='portal'?portalGroups():[],
  extras:other?regions.filter(r=>r.dungeonCategory==='other-battles').map(regionSummary):[]};
}
export function regionDetails(key: string) {
 const region = regions.find(r => r.key === key);
 if (!region) return null;
 const ids = enemyIdsInCopies(tables.copy.filter(c => region.copyIds.includes(Number(c.id))));
 return {region:regionSummary(region),
  enemies:tables.enemy.flatMap((row,index) => ids.has(Number(row.id)) ? [{...summary('enemy',index),
   minDifficulty:region.hiddenCopyId && enemyIdsInCopies(tables.copy.filter(c=>c.id===region.hiddenCopyId)).has(Number(row.id)) ? 5 : 1}] : []),
  randomFive:region.copyIds.length === 1 && region.copyIds[0] >= 2060 && region.copyIds[0] <= 2070};
}
export function portalGroups() {
 return tables.transmit.map(destination => {
  const ids = Object.entries(destination).filter(([key,value]) => /^war\d+$/.test(key) && typeof value === 'number' && value > 0).map(([,v]) => Number(v));
  return {key:`portal-${destination.id}`,name:recordName(destination),regions:regions.filter(r => r.copyIds.some(id => ids.includes(id))).map(regionSummary)};
 });
}
export function layoutData() {
 const url = process.env.SITE_URL ? new URL(process.env.SITE_URL) : null;
 if (url && (!['http:','https:'].includes(url.protocol) || url.pathname !== '/' || url.username || url.password || url.search || url.hash)) throw new Error('SITE_URL must be an HTTP(S) origin, e.g. https://wiki.example.com');
 return {siteUrl:url?.origin ?? null,version:metadata.version,categories:Object.keys(categories).map(key =>
  ({key,name:categories[key],count:tables[key].filter(row=>publishedRow(key,row)).length,icon:summary(key,0).icon}))};
}
export function sourceData() { return {...metadata,sources:Object.fromEntries(Object.entries(metadata.sources).filter(([key])=>Object.hasOwn(categories,key)))}; }
export function trialBattle(difficulty:number){
 if(![1,2,3].includes(difficulty))return null;
 const copy=tables.copy.find(r=>r.id===3101)!;
 return {difficulty,rewardSummaries:[1,2,3].map(h=>({difficulty:h,count:tables.trial.filter(r=>Number(r.hard)<=h).length})),
  rewards:tables.trial.filter(r=>Number(r.hard)<=difficulty).map(r=>{
   const ids=Number(r.itemid)>0?[Number(r.itemid)]:JSON.parse(String(r.items)) as number[];
   const category=r.itemtype===3?'pet':'item';
   return {id:Number(r.id),requiredDifficulty:Number(r.hard),score:Number(r.score),quantity:Number(r.itemnum),candidates:ids.map(id=>({id,record:reference(category,id),conflictingItem:category==='pet'&&!reference(category,id)?reference('item',id):null,kind:category==='pet'?'寵物':'物品'}))};
  }).sort((a,b)=>a.score-b.score||a.id-b.id),
  enemies:[...enemyIdsInCopies([copy])].map(id=>({record:reference('enemy',id)!,row:tables.enemy[indexes.enemy.get(String(id))!]}))};
}
export function entries(category: string) {
 return Object.hasOwn(categories,category) ? tables[category].flatMap((row,i) => publishedRow(category,row)?[{entry:`row-${i}`}]:[]) : [];
}

export function legacyEntries() {
 return [{legacy:'all'},{legacy:'design'},...[...Object.keys(categories),'transmit','chapter','copy'].flatMap(legacy => [
  {legacy},...tables[legacy].flatMap((row,i) => (legacy==='item'&&!publishedRow(legacy,row))||(legacy==='title'&&row.type!==2)?[]:[{legacy,entry:`row-${i}`},...(row.id === undefined ? [] : [{legacy,entry:String(row.id)}])]),
  ...Array.from({length:Math.max(0,Math.ceil((Object.hasOwn(categories,legacy)?catalogCount(legacy):tables[legacy].length)/50)-1)},(_,i) => ({legacy,entry:`page-${i+2}`}))
 ]),...regions.filter(r=>r.copyType === 5).map(r=>({legacy:'abyss',entry:String(r.copyIds[0])}))];
}
function catalogCount(category:string){return tables[category].filter(row=>publishedRow(category,row)&&(category!=='make'||!makeOperation(row))).length;}
export function legacyTarget(category: string,entry?: string) {
 if(category==='copy'){
  if(!entry||entry.startsWith('page-'))return '/regions/';
  const copy=/^row-(0|[1-9]\d*)$/.test(entry)?tables.copy[Number(entry.slice(4))]:tables.copy.find(row=>String(row.id)===entry);
  return copy?reference('copy',copy.id)?.href??null:null;
 }
 if(category==='chapter'){
  if(!entry)return mapCategoryHref('adventure');
  const chapter=/^row-(0|[1-9]\d*)$/.test(entry)?tables.chapter[Number(entry.slice(4))]:tables.chapter.find(r=>String(r.id)===entry);
  const region=chapter?regions.find(r=>r.chapterIndex===tables.chapter.indexOf(chapter)):null;
  return region?`/regions/${region.key}/`:null;
 }
 if(category==='transmit'){
  if(!entry)return '/regions/browse/portal/';
  const destination=/^row-(0|[1-9]\d*)$/.test(entry)?tables.transmit[Number(entry.slice(4))]:tables.transmit.find(r=>String(r.id)===entry);
  return destination?`/regions/browse/portal/#portal-${destination.id}`:null;
 }
 if (category === 'all' && !entry) return '/search/';
 if (category === 'design' && !entry) return '/regions/';
 if (category === 'abyss') return regions.find(r=>r.copyType===5 && String(r.copyIds[0])===entry)?.key ? `/regions/copy-${entry}/` : null;
 if (!Object.hasOwn(categories,category)) return null;
 if (!entry) return `/data/${category}/`;
 const page = /^page-([1-9]\d*)$/.exec(entry);
 if (page) {
  if(Number(page[1])>Math.ceil(tables[category].length/50))return null;
  const current=Math.min(Number(page[1]),Math.ceil(catalogCount(category)/50));
  return current>1?`/data/${category}/page/${current}/`:`/data/${category}/`;
 }
 const record = entry.startsWith('row-') ? detail(category,entry)?.record : reference(category,entry);
 return record?.href ?? null;
}

function related(category: string,row: GameRecord) {
 const links: (Summary & {why:string})[] = [];
 const seen = new Set<string>();
 function add(cat: string,id: unknown,why: string) {
  if(!Object.hasOwn(categories,cat)&&cat!=='copy')return;
  const record = reference(cat,id);
  if (!record || seen.has(record.href) || (cat === category && String(rowId(row)) === String(id))) return;
  seen.add(record.href); links.push({...record,why});
 }
 for (const [key,value] of Object.entries(row)) {
  if (/^skillid\d*$/.test(key)) add('skill',value,'技能');
  else if (/^enemyid\d*$/.test(key)) add('enemy',value,'敵人');
  else if (category==='exchange'&&key==='itemid') {const target=exchangeTarget(row);if(target)add(target.category,value,row.type===8?'解鎖幻化':row.type===6?'取得稱號':row.type===7?'取得寵物':'物品');}
  else if (/^itemid\d*$/.test(key) || /^matid\d+$/.test(key) || ['matequipid','useid'].includes(key) || (category === 'drop' && /^id\d+$/.test(key))) add('item',value,'物品');
  else if (/^dropid\d*$/.test(key)) add('drop',value,'掉落表');
  else if (/^hideid\d*$/.test(key)) add('copy',value,'隱藏區域');
 }
 if (Array.isArray(row.items)) for (const item of row.items) add(item.itemtype===3?'pet':'item',item.itemid,item.itemtype===3?'池內寵物':'池內物品');
 if (category === 'enemy') for (const copy of tables.copy)
  if (enemyIdsInCopies([copy]).has(Number(row.id))) add('copy',copy.id,'出現區域');
 if (category === 'item') for (const cat of ['make','shop','exchange','drop','treasure'])
  for (const other of tables[cat]) if (Object.entries(other).some(([key,value]) =>
   (/^itemid\d*$/.test(key) || /^matid\d+$/.test(key) || (cat === 'drop' && /^id\d+$/.test(key))) && value === row.id) ||
   (Array.isArray(other.items) && other.items.some(item => item.itemid === row.id))) add(cat,rowId(other),categories[cat]);
 if(category==='item')for(const reward of tables.trial)if(trialHasItem(reward,Number(row.id)))add('trial',reward.id,'試煉獎勵候選（需抽選）');
 return links;
}

function rewardDetails(category: string,row: GameRecord) {
 const copyIds = category === 'enemy' ? new Set(tables.copy.filter(c => enemyIdsInCopies([c]).has(Number(row.id))).map(c => Number(c.id))) : null;
 const drops = allDrops.filter(d => category === 'enemy' ? copyIds!.has(d.copyId) : category === 'copy' ? d.copyId === row.id :
  ['item','skin','pet'].includes(category) && d.itemId === row.id);
 const grouped = new Map<string,typeof drops>();
 for (const drop of drops) {
  const key = JSON.stringify([drop.copyId,drop.itemId,drop.condition,drop.reward,drop.rate === null]);
  const group = grouped.get(key);
  if (group) group.push(drop); else grouped.set(key,[drop]);
 }
 return [...grouped.values()].map(group => {
  const d = group[0], copy = tables.copy[indexes.copy.get(String(d.copyId)) ?? -1];
  if(!enemiesByCopy.has(d.copyId))enemiesByCopy.set(d.copyId,copy?[...enemyIdsInCopies([copy])].flatMap(id=>{const enemy=reference('enemy',id);return enemy?[enemy]:[]}):[]);
  const probabilities = d.rate === null ? [] : dropQuantityProbabilities(group);
  return {item:reference('item',d.itemId) ?? reference('skin',d.itemId) ?? reference('pet',d.itemId),
   enemies:enemiesByCopy.get(d.copyId)!,
   locations:regions.filter(region=>region.copyIds.includes(d.copyId)).map(region=>({href:`/regions/${region.key}/`,name:region.copyType===5?`深淵 · ${region.name}`:region.adventure?`冒險地圖 · ${region.name}`:`${mapCategories.find(category=>category.key===region.dungeonCategory)?.name??'區域'} · ${region.name}`})),
   itemId:d.itemId,copy:reference('copy',d.copyId),copyLevel:Number(copy?.level) || 1,
   condition:[regions.some(r=>r.hiddenCopyId===d.copyId)?'隱藏首領：巔峰300起，需符合章節進度':'',d.condition].filter(Boolean).join('；'),unlock:d.reward === 'skin-unlock',
   unlockRate:d.reward === 'skin-unlock' ? skinUnlockRate(d.copyId,1,d.copyId === 1163) : null,
   checks:d.checks,draws:group,zeroRate:probabilities[0] === undefined ? null : probabilities[0]*100,
   rates:probabilities.slice(1).map((p,i) => ({quantity:i+1,percent:p*100}))};
 });
}
export type Reward = ReturnType<typeof rewardDetails>[number];

function itemProgression(row:GameRecord){
 if(row.type!==2)return null;
 const subtype=Number(row.subtype);
 const kind=subtype<=8?'equipment':subtype===9?'accessory':subtype===10?'wing':subtype>=11&&subtype<=14?'badge':subtype===20?'rune':subtype===21||subtype===22?'legend':null;
 if(!kind)return null;
 const recipes=kind==='accessory'?Array.from({length:5},(_,step)=>{
  const recipe=tables.make.find(r=>r.itemid===7001+Number(row.quality)*10+step);
  return {step,gold:Number(recipe?.price)||0,recipe:recipe?reference('make',recipe.itemid):null,
   materials:recipe?Array.from({length:6},(_,i)=>({id:Number(recipe[`matid${i+1}`]),quantity:Number(recipe[`matnum${i+1}`])})).filter(m=>m.id>0&&m.quantity>0):[]};
 }):kind==='wing'?mechanics.wingCosts.map(r=>({...r,recipe:null})):[];
 const ids=new Set([5003,5086,5004,5118,5218,...recipes.flatMap(r=>r.materials.map(m=>m.id))]);
 const qualities=kind==='equipment'&&row.quality===5&&divineDropItems.has(Number(row.id))?[5,6]:[Number(row.quality)||1];
 return {kind,qualities,recipes,materials:[...ids].map(id=>({id,record:reference('item',id)})),
  multipliers:kind==='equipment'?mechanics.strengthMultipliers:kind==='accessory'?mechanics.accessoryMultipliers:kind==='wing'?mechanics.wingMultipliers:[],
  scoreMultipliers:kind==='equipment'?mechanics.scoreMultipliers:[],wingUnlockLevels:kind==='wing'?mechanics.wingUnlockLevels:[],legendNeedExp:kind==='legend'?mechanics.legendNeedExp:[],
  randomAttributes:kind==='equipment'&&row.paragon?Object.values(mechanics.attributePools.equipment):kind==='badge'?Object.values(mechanics.attributePools.badge):kind==='rune'?Object.values(mechanics.attributePools.rune):[]};
}
export type ItemProgression=NonNullable<ReturnType<typeof itemProgression>>;

function titleUnlock(row:GameRecord){
 const requirements=[row.require1,row.require2,row.require3].filter(id=>Number(id)>0).map(id=>reference('achievement',id));
 const exchanges=tables.exchange.filter(offer=>offer.type===6&&offer.itemid===row.id).map(offer=>({record:summary('exchange',indexes.exchange.get(String(offer.id))!),info:exchangeInfo(offer)}));
 const specialSources:Record<number,string>={166:'鐵匠鋪打造／熔煉流程中有機會取得（機率及適用配方待核對）',152:'寵物融合或遠古神獸餵養時有機會取得（機率待核對）',174:'戰鬥結算的出售流程中有機會取得（機率及適用對象待核對）'};
 const condition=row.subtype===51?`成就點數達到 ${row.needcount} 點`:row.subtype===52?'完成下列全部前置成就':row.subtype===55?`VIP 等級達到 ${row.needcount}`:specialSources[Number(row.id)]??null;
 return {condition,requirements,exchanges,note:condition?null:exchanges.length?'透過下列積分兌換取得。':requirements.length?'資料列有前置成就，但此特殊稱號的額外授予條件尚未確認。':'尚未確認現行取得入口；不能僅憑稱號名稱或特殊標記推定活動、掉落或解鎖條件。'};
}

export function detail(category: string,entry: string) {
 if ((!Object.hasOwn(categories,category)&&category!=='copy') || !/^row-(0|[1-9]\d*)$/.test(entry)) return null;
 const index = Number(entry.slice(4)),row = tables[category][index];
 if (!row) return null;
 const origins = category === 'enemy' ? tables.copy.filter(c => enemyIdsInCopies([c]).has(Number(row.id))) : [];
 const supported = category === 'enemy' && regions.some(region => region.adventure && origins.some(c => region.copyIds.includes(Number(c.id))));
 const abyssOnly = origins.some(c => c.type === 5) && !origins.some(c => c.type !== 5);
 const minDifficulty = supported && origins.every(c=>regions.some(r=>r.hiddenCopyId===c.id)) ? 5 : 1;
 const skills = category === 'enemy' ? Object.entries(row).filter(([key,value]) => /^skillid\d+$/.test(key) && typeof value === 'number' && value > 0).map(([key,id]) => {
  const record = reference('skill',id);
  return {id,record,row:record ? tables.skill[indexes.skill.get(String(id))!] : null,ownName:row[`skill${key.slice(7)}name`]};
 }) : [];
 const materials = category === 'make' ? Array.from({length:6},(_,i) => ({id:row[`matid${i+1}`],quantity:row[`matnum${i+1}`]}))
  .filter(mat => typeof mat.id === 'number' && mat.id > 0).map(mat => ({...mat,item:reference('item',mat.id)})) : [];
 const pool: {id:JsonValue|undefined;item:Summary|null;quantity:string;rate:number|null;weight:JsonValue|undefined}[] = [];
 if (category === 'drop') for (let i=1;i<=6;i++) if (Number(row[`id${i}`]) > 0) pool.push({
  id:row[`id${i}`],item:reference('item',row[`id${i}`]),quantity:`${row[`min${i}`]}～${row[`max${i}`]}`,
  rate:dropTableRate(Number(row[`pro${i}`])),weight:undefined});
 const isChest=(category==='item'&&row.useid===1&&row.id===5012)||(category==='treasure'&&row.id===1);
 if (!isChest&&Array.isArray(row.items)) for (const item of row.items) pool.push({id:item.itemid,item:reference(item.itemtype===3?'pet':'item',item.itemid),
  quantity:String(item.itemnum ?? '—'),rate:null,weight:item.itemweight});
 if(isChest)for(const item of chestRates(tables.treasure.find(r=>r.id===1)!.items!))pool.push({id:item.itemid,item:reference('item',item.itemid),quantity:String(item.itemnum),rate:item.rate,weight:item.itemweight});
 const dropInfo=['drop','droptip'].includes(category)?{
  hints:category==='droptip'?Object.entries(row).filter(([key,id])=>/^itemid\d+$/.test(key)&&Number(id)>0).map(([key,id])=>({id,item:reference('item',id),name:String(row[`itemname${key.slice(6)}`]??'')})):[],
  sources:category==='droptip'?tables.copy.filter(c=>c.droptipid===row.id).map(c=>({copy:reference('copy',c.id)!,enemies:[...enemyIdsInCopies([c])].flatMap(id=>{const e=reference('enemy',id);return e?[e]:[];})})):[]
 }:null;
 return {record:summary(category,index),row,categoryName:categories[category==='achievement'&&row.type===2?'title':category],source:metadata.sources[category==='title'?'achievement':category].path,dropInfo,
  titleUnlock:['title','achievement'].includes(category)&&row.type===2?titleUnlock(row):null,
  unlockedTitles:category==='achievement'&&row.type===1?tables.title.flatMap((title,i)=>title.type===2&&[title.require1,title.require2,title.require3].includes(row.id)?[{record:summary('title',i),automatic:title.subtype===52,requirements:titleUnlock(title).requirements}]:[]):[],
  version:metadata.version,categoryDescription:categoryDescriptions[category]??null,supported,minDifficulty,abyssOnly,skills,rewards:rewardDetails(category,row),
  availability:category==='item'?itemAvailability(row):null,materials,makeOperation:category==='make'?makeOperation(row):null,treasure:category==='treasure'?{...treasureContext(Number(row.id)),source:reference('item',treasureContext(Number(row.id)).sourceItem)}:null,exchange:category==='exchange'?exchangeInfo(row):null,product:category === 'make' ? reference('item',row.itemid) : null,pool,isChest,progression:category==='item'?itemProgression(row):null,
  skinProgression:category==='skin'?{stats:(mechanics.skinStats as Record<string,{type:number;value:number}[][]>)[String(row.id)],costs:mechanics.skinCosts,materials:[5121,5201,5211].map(id=>({id,record:reference('item',id)}))}:null,relations:related(category,row)};
}
