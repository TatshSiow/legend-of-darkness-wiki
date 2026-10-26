import {test} from 'node:test';
import assert from 'node:assert/strict';
import {navigationGroups} from '../src/lib/core/navigation.ts';
import {categories} from '../src/lib/server/data.ts';

test('navigation groups cover every published category exactly once',()=>{
 const keys=navigationGroups.flatMap(group=>group.categories);
 assert.equal(new Set(keys).size,keys.length);
 assert.deepEqual([...keys].sort(),Object.keys(categories).sort());
 assert.deepEqual(navigationGroups.find(group=>group.name==='寵物養成').categories,['pet']);
});
