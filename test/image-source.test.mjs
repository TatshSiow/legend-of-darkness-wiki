import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import assets from '../src/lib/core/image-assets.json' with {type:'json'};
import {imageSource} from '../src/lib/core/image-source.ts';

test('optimized image URLs preserve fallback, external and smaller original assets',()=>{
 assert.equal(imageSource(null),'/icons/fallback.svg');
 assert.equal(imageSource('/icons/fallback.svg'),'/icons/fallback.svg');
 assert.equal(imageSource('https://example.org/image.png'),'https://example.org/image.png');
 for(const file of assets.originals)assert.equal(imageSource('/icons/'+file),'/icons/'+file);
 assert.match(imageSource('/icons/icon/item/5296.png'),/^\/optimized\/[a-f0-9]{16}\/icon\/item\/5296\.webp$/);
 for(const file of assets.thumbnails){
  assert(existsSync(new URL('../static/icons/'+file,import.meta.url)));
  assert(imageSource('/icons/'+file,true).includes('/96/'));
  assert(!imageSource('/icons/'+file).includes('/96/'));
 }
});
