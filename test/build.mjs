import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
const root=resolve('build');
const files=readdirSync(root,{recursive:true,withFileTypes:true}).filter(f=>f.isFile()&&f.name.endsWith('.html'));
const targets=new Set();let indexed=0;
for(const file of files){
 const path=join(file.parentPath,file.name),html=readFileSync(path,'utf8');
 if(html.includes('data-pagefind-body'))indexed++;
 const pageUrl='http://wiki.test/'+path.slice(root.length+1).replaceAll('\\','/').replace(/index\.html$/,'');
 for(const [,attr] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  const url=new URL(attr.replaceAll('&amp;','&'),pageUrl);
  if(url.origin==='http://wiki.test')targets.add(decodeURIComponent(url.pathname));
 }
}
for(const target of targets){
 const path=resolve(root,'.'+target);
 assert(path.startsWith(root),target);
 assert(existsSync(path)&&(target.endsWith('/')?existsSync(join(path,'index.html')):true),`Missing built asset/page: ${target}`);
}
assert.equal(indexed,3171);
const clientFiles=readdirSync(join(root,'_app'),{recursive:true,withFileTypes:true}).filter(f=>f.isFile()&&f.name.endsWith('.js'));
for(const file of clientFiles){const text=readFileSync(join(file.parentPath,file.name),'utf8');assert(!text.includes('assets/data/enemy.json'),`Raw dataset leaked into ${file.name}`);}
console.log(`${files.length} HTML files, ${targets.size} internal link/asset targets, ${indexed} searchable records: valid.`);
