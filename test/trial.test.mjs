import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {trialBattle} from '../src/lib/server/data.ts';
import {trialEnemyStats} from '../src/lib/core/enemy-stats.ts';
import {trialRewardRate} from '../src/lib/core/rewards.ts';

test('trial settlement rates match all 29 native weight/difficulty combinations',()=>{
 const fixture=JSON.parse(readFileSync(new URL('../static/data/trial-reward-native.json',import.meta.url),'utf8'));
 assert.equal(fixture.cases.length,29);
 for(const row of fixture.cases){
  assert.equal(trialRewardRate(row.weight,row.requiredDifficulty),row.rate);
  assert.deepEqual(row.successfulResidues,Array.from({length:row.rate},(_,i)=>i));
 }
 assert.equal(trialRewardRate(8,2),9);
 assert.equal(trialRewardRate(3,3),4);
 for(const difficulty of [1,2,3])assert.equal(trialBattle(difficulty).rewards.find(r=>r.id===1).rate,60);
});
test('trial formula matches five live monsters after bronze wave one',()=>{
 const live=JSON.parse(readFileSync(new URL('../static/data/trial-live-native.json',import.meta.url),'utf8'));
 assert.equal(live.rows.length,5);
 assert.equal(live.nextWaveCounter,live.completedWave+1);
 assert.equal(live.rows.filter(r=>r.enemyId===4801).length,2);
 for(const actual of live.rows){
  const quality=(actual.critResistance-15)/5;
  const enemy=trialBattle(live.difficulty).enemies.find(e=>e.record.id===actual.enemyId);
  const expected=trialEnemyStats(enemy.row,live.difficulty,live.completedWave,quality);
  for(const [key,value] of Object.entries(expected))assert.equal(actual[key],value,`${actual.enemyId}/${key}`);
 }
});
test('trial waves match 375 original ARM growth and quality cases',()=>{
 const fixture=JSON.parse(readFileSync(new URL('../static/data/trial-native.json',import.meta.url),'utf8'));
 assert.equal(fixture.rows.length,375);
 for(const expected of fixture.rows){
  const battle=trialBattle(expected.difficulty);
  const enemy=battle.enemies.find(e=>e.record.id===expected.enemyId);
  const actual=trialEnemyStats(enemy.row,expected.difficulty,expected.wave,expected.quality);
  for(const [key,value] of Object.entries(actual))assert.equal(value,expected[key],`${expected.enemyId}/${expected.difficulty}/${expected.wave}/${expected.quality}/${key}`);
 }
 for(const difficulty of [1,2,3])assert.deepEqual(trialBattle(difficulty).enemies.map(e=>e.record.id),[4801,4802,4803,4804,4805]);
 assert.equal(trialBattle(4),null);
 assert.deepEqual(trialBattle(1).rewardSummaries.map(r=>r.count),[30,61,91]);
 for(const difficulty of [1,2,3]){
  const rewards=trialBattle(difficulty).rewards;
  assert.equal(rewards.length,[0,30,61,91][difficulty]);
  assert(rewards.every(r=>r.requiredDifficulty<=difficulty&&r.candidates.length>0));
  assert(rewards.every((r,i)=>i===0||r.score>=rewards[i-1].score));
 }
 assert(trialBattle(3).rewards.find(r=>r.id===27).candidates.every(c=>c.record?.category==='pet'));
 const invalidPet=trialBattle(2).rewards.find(r=>r.id===90).candidates[0];
 assert.equal(invalidPet.id,6539);assert.equal(invalidPet.record,null);assert.equal(invalidPet.conflictingItem.id,6539);assert.equal(invalidPet.conflictingItem.category,'item');
 const enemy=trialBattle(1).enemies[0].row;
 for(const wave of [0,-1,1.5,NaN,Infinity,100001])assert.throws(()=>trialEnemyStats(enemy,1,wave,1),RangeError);
 assert.throws(()=>trialEnemyStats(enemy,0,1,1),RangeError);
 assert.throws(()=>trialEnemyStats(enemy,1,1,4),RangeError);
 assert(trialEnemyStats(enemy,1,100000,3).hp>0);
});
