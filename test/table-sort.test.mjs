import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compareTableValues} from '../src/lib/core/table-sort.ts';
test('table values compare numbers, percentages, levels and natural text',()=>{
 for(const [a,b] of [['900','1,200'],['2.5%','12.5%'],['Lv. 9','Lv. 80'],['+2','+18'],['第 2 波','第 12 波'],['2～10','12～20'],['1','—']])assert(compareTableValues(a,b)<0,`${a} < ${b}`);
 assert.equal(compareTableValues('2','2'),0);
});
