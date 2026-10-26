import {writeFile} from 'node:fs/promises';
import {categories,entries,regions,layoutData,listing} from '../src/lib/server/data.ts';
import {mapCategories} from '../src/lib/core/region-navigation.ts';
const origin=layoutData().siteUrl;
if(origin){
 const paths=[...mapCategories.map(tab=>tab.href),'/abyss/','/trial/1/','/trial/2/','/trial/3/','/home/','/formulas/','/sources/',...regions.map(r=>`/regions/${r.key}/`),...Object.keys(categories).flatMap(category=>[`/data/${category}/`,...Array.from({length:Math.max(0,Math.ceil(listing(category).records.length/50)-1)},(_,i)=>`/data/${category}/page/${i+2}/`),...entries(category).map(e=>`/data/${category}/${e.entry}/`)])];
 await writeFile('build/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path=>`<url><loc>${new URL(path,origin).href.replaceAll('&','&amp;')}</loc></url>`).join('')}</urlset>`);
}
await writeFile('build/robots.txt',`User-agent: *\nAllow: /\nDisallow: /search/\n${origin?`Sitemap: ${origin}/sitemap.xml\n`:''}`);
console.log(origin?'Sitemap and robots.txt written.':'robots.txt written; set SITE_URL to generate canonical URLs and sitemap.');
