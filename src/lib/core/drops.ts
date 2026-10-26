import type { GameRecord } from './types';
export interface AvailableDrop {
 copyId: number; itemId: number; field: string; checks: number;
 reward?: 'skin-unlock'; rate: number | null; condition: string; quantity: string;
}
// Native Copy::getDrops 0x76e468; reference multiplier=1 (argument100), rand()%10001, strict <.
const thresholds: Record<string, number> = {percent300:2400,percent100:750,percent10:75,percent2:15,percent1:7};
function itemIds(value: unknown): number[] {
 if (value === undefined || value === null || value === 'null') return [];
 let parsed: unknown = value;
 if (typeof value === 'string') { try { parsed = JSON.parse(value); } catch { return []; } }
 return Array.isArray(parsed) ? parsed.filter((id): id is number => typeof id === 'number' && Number.isInteger(id) && id > 0) : [];
}
export function copyDrops(copy: GameRecord, tips: GameRecord[]): AvailableDrop[] {
 const result: AvailableDrop[]=[];
 const fields=[...Object.keys(thresholds),'paragondrop10','paragondrop8001','specialdrop','specialdrop2'];
 for (const field of fields) {
  const counts=new Map<number,number>();
  for (const id of itemIds(copy[field])) counts.set(id,(counts.get(id)||0)+1);
  for (const [itemId,checks] of counts) {
   let threshold=thresholds[field];let denominator=10001;
   let condition='無（基礎掉落）';
   if (itemId===5100 && ['percent300','percent100','percent10'].includes(field)) condition+='；另需遊戲特殊開關允許';
   if (field==='percent1' && itemId===6865) { denominator=copy.type===1?500001:copy.type===2?20001:10001; }
   if (field==='paragondrop10') {
    threshold=30;
    if (copy.type===1) threshold=[6537,6637,6914].includes(itemId)?4:itemId===6865?0:[5212,6140,6639].includes(itemId)?3:0;
    condition='巔峰100以上';
   }
   if (field==='paragondrop8001') { threshold=1;condition='巔峰800以上'; }
   if (field==='specialdrop') condition='特殊領取獎勵，需符合副本進度及首次領取條件';
   if (field==='specialdrop2') condition=itemId>=8001&&itemId<=8999?'戰鬥結算時隨機解鎖幻化，非背包道具；機率受戰鬥模式、等級差與獎勵倍率影響':'特殊獎勵，取得條件待核對';
   result.push({copyId:Number(copy.id),itemId,field,checks,...(field==='specialdrop2'&&itemId>=8001&&itemId<=8999?{reward:'skin-unlock' as const}:{}),rate:threshold===undefined?null:threshold/denominator*100,condition,quantity:'1／次判定'});
  }
 }
 const tip=tips.find(t=>t.id===copy.droptipid);
 if (tip) for (const [key,value] of Object.entries(tip)) if (/^itemid\d+$/.test(key) && typeof value==='number' && value>0 && !result.some(r=>r.itemId===value)) result.push({copyId:Number(copy.id),itemId:value,field:'droptip',checks:0,rate:null,condition:'遊戲掉落提示，尚未對應實際抽選流程',quantity:'待核對'});
 return result;
}
export function dropsForEnemy(enemyId: number, copies: GameRecord[], tips: GameRecord[]): AvailableDrop[] {
 return copies.filter(copy=>Object.entries(copy).some(([key,value])=>/^enemyid\d*$/.test(key)&&value===enemyId)).flatMap(copy=>copyDrops(copy,tips));
}
export function dropTableRate(parameter: number, multiplier=1): number {
 if (!Number.isFinite(parameter)||parameter<0||!Number.isFinite(multiplier)||multiplier<0) throw new RangeError('Invalid drop parameter');
 // DropManeger::getGoodsDrops/getEquipDrops uses rand()%1001 and strict <.
 return Math.min(1001,Math.max(0,Math.ceil(Math.fround(Math.fround(parameter)*Math.fround(multiplier)))))/1001*100;
}

// Independent per-entry rolls; callers group only rewards with identical eligibility.
export function dropQuantityProbabilities(drops: AvailableDrop[]): number[] {
 let probabilities = [1];
 for (const drop of drops) {
  if (drop.rate === null) continue;
  const p = drop.rate / 100;
  for (let i = 0; i < drop.checks; i++) {
   const next = Array(probabilities.length + 1).fill(0) as number[];
   probabilities.forEach((value, quantity) => { next[quantity] += value * (1-p); next[quantity+1] += value * p; });
   probabilities = next;
  }
 }
 return probabilities;
}

// WarFinishLayer skin branch: mode0, strict roll < float32(base * multiplier), roll1..100000.
export function skinUnlockRate(copyId: number, multiplier=1, specialEligible=false): number {
 if (!Number.isFinite(multiplier) || multiplier<0) throw new RangeError('Invalid reward multiplier');
 const base=copyId===1163?(specialEligible?12000:0):30;
 const threshold=Math.fround(base*Math.fround(multiplier));
 return Math.min(100000,Math.max(0,Math.ceil(threshold)-1))/1000;
}
