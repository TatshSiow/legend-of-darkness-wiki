import type { GameRecord } from './types';
export interface Region { key: string; name: string; englishName: string; copyIds: number[]; hiddenCopyId?: number; chapterIndex?: number; copyType?: number; dungeonCategory?: string; copyIndex?: number; adventure: boolean; levelRange?: string }
export const difficulties = [
  {id:0,name:'基礎資料'}, {id:1,name:'簡單'}, {id:2,name:'困難'}, {id:3,name:'噩夢'},
  {id:4,name:'巔峰100'}, {id:5,name:'巔峰300'}, {id:6,name:'巔峰500'},
  {id:7,name:'巔峰800'}, {id:8,name:'巔峰1200'}, {id:9,name:'巔峰1500'},
] as const;
export function buildRegions(chapters: GameRecord[], copies: GameRecord[]): Region[] {
  const assigned = new Set<number>();
  const regions: Region[] = [];
  for (const [chapterIndex, chapter] of chapters.entries()) {
    // Rift reads the runtime list at GameLogic+0x24c, rather than chapter minid/maxid.
    if (chapter.id === 100) {
      // inityRiftData 0x7be31c: two random pools plus conditional activity 1168.
      [1158,1159,1160,1161,1162,1163,1164,1165,1166,1167,1168].forEach(id=>assigned.add(id));
      regions.push({key:'rift',name:'祕境',englishName:chapter.name_en||'Rift',copyIds:[1158,1159,1160,1161,1164,1165,1166,1167,4001,4002,4010,4018,1162,1163,1168].filter(id=>copies.some(copy=>copy.id===id)),chapterIndex,adventure:false,levelRange:`Lv. ${chapter.minlevel}～${chapter.maxlevel}`});
      continue;
    }
    const copyIds = copies.filter(copy => copy.type === 1 && typeof copy.id === 'number' && !assigned.has(copy.id) && copy.id >= Number(chapter.minid) && copy.id <= Number(chapter.maxid)).map(copy => copy.id!);
    if (!copyIds.length) continue;
    const hiddenCopyId = Number(chapter.hideboss) || undefined;
    // SubMapLayer::refreshView 0x836f4a: hideboss appears at hard >= 5 (巔峰300).
    if (hiddenCopyId && copies.some(copy=>copy.id===hiddenCopyId)) copyIds.push(hiddenCopyId);
    copyIds.forEach(id => assigned.add(id));
    regions.push({ key:`chapter-${chapter.id}`, name:chapter.name || `地區 ${chapter.id}`, englishName:chapter.name_en || '', copyIds, hiddenCopyId, chapterIndex, adventure:true, levelRange:`Lv. ${chapter.minlevel}～${chapter.maxlevel}` });
  }
  const extra = copies.filter(copy => copy.type === 1 && typeof copy.id === 'number' && !assigned.has(copy.id)).map(copy => copy.id!);
  if (extra.length) regions.push({key:'extra-adventure',name:'未分類冒險與活動關卡',englishName:'尚未確認所屬遊戲入口',copyIds:extra,dungeonCategory:'other-battles',adventure:false});
  for (const [copyIndex,copy] of copies.entries()) {
    if (copy.type===1 || typeof copy.id!=='number') continue;
    regions.push({key:`copy-${copy.id}`,name:copy.name||`副本 ${copy.id}`,englishName:copy.name_en||'',copyIds:[copy.id],copyType:Number(copy.type),copyIndex,dungeonCategory:copy.type===5?'abyss':copy.id>=2001&&copy.id<=2018?'normal':copy.id>=2101&&copy.id<=2112?'challenge':copy.id>=2060&&copy.id<=2066?'daily':copy.id===2070?'ancient':copy.id>=2050&&copy.id<=2054?'random':copy.id>=2201&&copy.id<=2253?'portal':'other-battles',adventure:false});
  }
  for (const region of regions.filter(region => !region.adventure)) {
    const levels = copies.filter(copy => region.copyIds.includes(Number(copy.id))).map(copy => Number(copy.level)).filter(level => Number.isFinite(level) && level > 0);
    if (levels.length) region.levelRange = `地點 Lv. ${Math.min(...levels)}～${Math.max(...levels)}`;
  }
  return regions;
}
export function enemyIdsInCopies(copies: GameRecord[]): Set<number> {
  const ids = new Set<number>();
  for (const copy of copies) for (const [key,value] of Object.entries(copy)) {
    if (/^enemyid\d*$/.test(key) && typeof value === 'number' && value > 0) ids.add(value);
  }
  return ids;
}
export function adventureCritResistance(quality: number, difficulty: number): number | null {
  if (![1,2,3].includes(quality) || !Number.isInteger(difficulty) || difficulty < 1 || difficulty > 9) return null;
  return 5 * quality + 15 + (difficulty >= 3 ? 10 * (difficulty - 3) : 0);
}
