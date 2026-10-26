import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync,unlinkSync,rmdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

test('deployment origin generates canonical sitemap paths and rejects unsafe config',()=>{
 const dir=mkdtempSync(join(tmpdir(),'legend-wiki-seo-')),build=join(dir,'build');mkdirSync(build);
 const run=(site,production='')=>spawnSync(process.execPath,[fileURLToPath(new URL('../scripts/seo.mjs',import.meta.url))],{
  cwd:dir,env:{...process.env,SITE_URL:site,VERCEL_PROJECT_PRODUCTION_URL:production},encoding:'utf8'
 });
 try{
  const result=run('https://wiki.example.test');assert.equal(result.status,0,result.stderr);
  const xml=readFileSync(join(build,'sitemap.xml'),'utf8');
  assert(xml.includes('<loc>https://wiki.example.test/data/enemy/row-0/</loc>'));
  assert(xml.includes('<loc>https://wiki.example.test/data/enemy/page/2/</loc>'));
  assert(xml.includes('<loc>https://wiki.example.test/regions/browse/portal/</loc>'));
  assert(!xml.includes('/enemy/4001/'));assert(!xml.includes('/search/'));
  assert(readFileSync(join(build,'robots.txt'),'utf8').includes('Sitemap: https://wiki.example.test/sitemap.xml'));
  assert.equal(run('', 'legend-wiki.vercel.app').status,0);
  assert(readFileSync(join(build,'sitemap.xml'),'utf8').includes('https://legend-wiki.vercel.app/regions/'));
  assert.equal(run('https://custom.example.test','legend-wiki.vercel.app').status,0);
  assert(readFileSync(join(build,'sitemap.xml'),'utf8').includes('https://custom.example.test/regions/'));
  for(const origin of ['https://wiki.example.test/subpath','https://user:pass@wiki.example.test','file:///tmp/wiki'])assert.notEqual(run(origin).status,0,origin);
 }finally{
  unlinkSync(join(build,'sitemap.xml'));unlinkSync(join(build,'robots.txt'));rmdirSync(build);rmdirSync(dir);
 }
});
