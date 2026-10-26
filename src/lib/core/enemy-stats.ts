// APK assets/language/cn.xml: enemy_quality1..4; Traditional Chinese display.
export const enemyQualityNames: Record<number, string> = {1:'普通',2:'精英',3:'變異',4:'神話'};
// WarLayer 0x8466ae: five independent draws, then wave growth and quality; no adventure scaling.
export function trialEnemyStats(enemy:GameRecord,difficulty:number,wave:number,quality:number):Record<string,number>{
 if(![1,2,3].includes(difficulty)||![1,2,3].includes(quality)||!Number.isInteger(wave)||wave<1||wave>100000)throw new RangeError('Invalid trial context');
 const growth=55*wave+5*difficulty-5;
 const increments:Record<string,number>={att:150,hp:150,def:68,hit:109,spo:33,cri:41,crihurt:116,res:75};
 const stats:Record<string,number>={level:Math.trunc(Number(enemy.level)||0)};
 for(const [key,increment] of Object.entries(increments))stats[key]=Math.trunc(Number(enemy[key])||0)+increment*growth;
 for(const key of ['att','hp'])stats[key]=Math.trunc(Math.fround(Math.fround(stats[key])*Math.fround([0,1,1.1,1.2][quality])));
 // Quality stage overwrites the earlier trial 20/40/60 resistance setter.
 stats.critResistance=quality*5+15;
 return stats;
}
import type { GameRecord } from './types';
const hardMultipliers = [0, .8, 1.1, 1.3, 1.5, 1.7, 1.95, 2.3, 3, 3.4];
// Native quality/hard stage only; paragon and encounter-specific changes happen later.
export function enemyDifficultyStats(enemy: GameRecord, quality: number, difficulty: number): Record<string, number> {
  if (![1,2,3].includes(quality) || !Number.isInteger(difficulty) || difficulty < 1 || difficulty > 9) throw new RangeError('Invalid enemy quality or difficulty');
  const scale = (value: number, multiplier: number) => Math.trunc(Math.fround(Math.fround(value) * Math.fround(multiplier)));
  const stats: Record<string, number> = {};
  for (const key of ['level','att','hp','def','hit','spo','cri','crihurt','res']) stats[key] = Math.trunc(Number(enemy[key] || 0));
  for (const key of ['att','hp']) stats[key] = scale(stats[key], [0,1,1.1,1.2][quality]);
  for (const key of ['att','hp','def']) stats[key] = scale(stats[key], hardMultipliers[difficulty]);
  stats.critResistance = quality * 5 + 15 + 10 * Math.max(0, difficulty - 3);
  return stats;
}

export function enemyPlayerStats(enemy: GameRecord, quality: number, difficulty: number, playerLevel: number, playerParagon: number): Record<string,number> {
 if (!Number.isInteger(playerLevel)||playerLevel<1||playerLevel>80||!Number.isInteger(playerParagon)||playerParagon<0||playerParagon>1500) throw new RangeError('Invalid player context');
 const stats=enemyDifficultyStats(enemy,quality,difficulty);
 // Ordinary adventures: Copy::isParagonOffset enables only hard4..9.
 if (difficulty<4 || Number(enemy.id)===4320) return stats;
 const f=Math.fround;
 const baseLevel=Number(enemy.level);
 if (!(baseLevel>0)) throw new RangeError('Invalid enemy level');
 const levelFactor=playerLevel>baseLevel?f(f(f(playerLevel-baseLevel)/f(baseLevel))+1):1;
 const paragonFactor=Math.max(1,f(f(f(playerParagon)/1500)*3.125+1));
 const multiplier=f(levelFactor*paragonFactor);
 for (const key of ['att','hp','def','hit','spo','cri','crihurt','res']) stats[key]=Math.trunc(f(f(stats[key])*multiplier));
 return stats;
}
