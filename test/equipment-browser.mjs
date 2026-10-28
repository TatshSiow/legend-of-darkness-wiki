import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {chromium} from 'playwright';
import raw from '../src/lib/server/assets/wiki.json' with {type:'json'};
import uiNative from '../static/data/equipment-ui-native.json' with {type:'json'};
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const url=id=>(process.env.BASE_URL||'http://127.0.0.1:5174')+`/data/item/row-${raw.tables.item.findIndex(r=>r.id===id)}/`;
 for(const id of [6333,6045,6046,6136,6536]){
  await page.goto(url(id));await page.waitForLoadState('networkidle');await page.waitForSelector('.equipment-attributes');
  assert.equal(await page.locator('.attribute-table').count(),0);
  assert.equal(await page.locator('h1').count(),1);
  assert.equal(await page.locator('.enchant-values thead th').count(),8);
  assert.equal(await page.locator('.enchant-values tbody tr').count(),8);
  const panel=await page.locator('.equipment-tooltip').boundingBox(),expenses=await page.locator('.equipment-expenses').boundingBox();
  assert(expenses.x>=panel.x+panel.width);
  assert.equal(await page.locator('.equipment-tooltip .action-cost').count(),0);
  assert.equal(await page.locator('.equipment-tooltip table').count(),0);
  await page.locator('.preview-settings summary').click();
  assert.equal(await page.locator('.strength-stat').count(),0);
  assert((await page.locator('.sub-stat').innerText()).includes('+12'));
  const frame=page.locator('.equipment-tooltip .quality-frame');assert.equal(await frame.count(),1);
  assert.equal(await frame.getAttribute('src'),`/ui/quality/${raw.tables.item.find(r=>r.id===id).quality}.png`);
  assert(await frame.evaluate(e=>e.complete&&e.naturalWidth===75));
  const expectedColor=`rgb(${uiNative.qualityColors.find(q=>q.quality===raw.tables.item.find(r=>r.id===id).quality).rgb.join(', ')})`;
  assert.equal(await page.locator('.equipment-tooltip h1').evaluate(e=>getComputedStyle(e).color),expectedColor);
  assert.equal(await page.locator('.sub-stat dd').innerText(),raw.tables.item.find(r=>r.id===id).subvalue.toLocaleString('zh-TW'));
  if(id===6333){
   const fixed=await page.locator('.fixed-attributes').innerText();
   for(const value of ['265','81','283'])assert(fixed.includes(value));
   assert(!fixed.includes('364'));
   assert.equal(await page.locator('.fixed-attributes li>span').first().evaluate(e=>getComputedStyle(e).color),'rgb(121, 180, 255)');
   assert.equal(await page.locator('.sub-stat dt').evaluate(e=>getComputedStyle(e).color),'rgb(168, 153, 154)');
   const base=await page.locator('.main-stat dd').innerText();
   await page.getByLabel('預覽強化',{exact:true}).selectOption('18');
   await page.waitForFunction(base=>document.querySelector('.main-stat dd').textContent!==base,base);
   await page.waitForSelector('.sub-stat.unlocked');
   assert.equal(await page.locator('.socket-costs').count(),0);
   await page.getByLabel('評分點數',{exact:true}).fill('101');assert(await page.getByRole('alert').count());
   await page.getByLabel('評分點數',{exact:true}).fill('100');
  }
  if(id===6045){
   assert((await page.locator('.fixed-attributes').innerText()).includes('+8%'));
   await page.getByLabel('\u88dd\u5099\u5dd4\u5cf0\u7b49\u7d1a',{exact:true}).fill('300');
   await page.waitForFunction(()=>document.querySelector('.tooltip-level').textContent.includes('80(300)'));
   await page.getByLabel('\u88dd\u5099\u5dd4\u5cf0\u7b49\u7d1a',{exact:true}).fill('0');
   assert(await page.locator('.random-attributes').count());
   assert.equal(await page.locator('.fixed-attributes li').count(),5);
   assert.equal(await page.locator('.random-attributes tbody tr').count(),17);
   assert.equal(await page.locator('.socket-costs [data-currency]').count(),0);
   assert.deepEqual(await page.locator('.socket-costs .stack-count').allTextContents(),['1','2','3']);
   assert.equal(await page.locator('.socket-costs tbody tr a').count(),3);
   assert.equal(await page.locator('.socket-costs thead th').count(),2);
   assert.deepEqual(await page.locator('.gem-costs [data-currency="money"]').allTextContents(),['100','200','300','40','60','80']);
   await page.locator('.progression-controls select').filter({has:page.locator('option[value="6"]')}).last().selectOption('6');
   await page.waitForSelector('.equipment-tooltip[data-item-quality="6"]');
  }
  if(id===6046){assert.equal(await page.locator('.random-attributes tbody tr').count(),16);assert((await page.locator('.random-attributes tbody tr').first().innerText()).includes('6.25%'));}
  if(id===6136||id===6536){assert.equal(await page.locator('.fixed-attributes li').filter({hasText:'隨機屬性'}).count(),5);}
 }
 for(const subtype of [9,10,11]){
  const item=raw.tables.item.find(r=>r.type===2&&r.subtype===subtype);
  await page.goto(url(item.id));await page.waitForLoadState('networkidle');
  assert.equal(await page.locator('h1').count(),1);
  assert.equal(await page.locator('.equipment-tooltip .quality-frame').count(),1);
  assert(await page.locator('.special-attributes li').count()>0);
  if(subtype!==11){
   await page.locator('.preview-settings summary').click();
   await page.locator('.preview-settings select').selectOption(subtype===9?'5':'60');
   await page.waitForFunction(()=>document.querySelector('h1').textContent.includes('+'));
  }
  await page.setViewportSize({width:390,height:844});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.setViewportSize({width:1440,height:1000});
 }
 for(const {quality,rgb} of uiNative.qualityColors){
  const goods=raw.tables.item.find(r=>r.type===1&&r.quality===quality&&!(r.id>=5013&&r.id<=5037)&&r.id!==5154);
  if(!goods)continue;
  await page.goto(url(goods.id));await page.waitForLoadState('networkidle');
  assert.equal(await page.locator('.detailhead .quality-frame').count(),0);
  assert.equal(await page.locator('.detailhead h1').evaluate(e=>getComputedStyle(e).color),`rgb(${rgb.join(', ')})`);
 }
 for(const link of await page.locator('.entry-identity[data-item-quality]').all()){
  const q=Number(await link.getAttribute('data-item-quality'));
  assert.equal(await link.locator('.item-name').evaluate(e=>getComputedStyle(e).color),`rgb(${uiNative.qualityColors.find(c=>c.quality===q).rgb.join(', ')})`);
 }
 mkdirSync('artifacts',{recursive:true});await page.goto(url(6046));await page.waitForSelector('.equipment-attributes');
 await page.screenshot({path:'artifacts/equipment-attributes.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:'artifacts/equipment-attributes-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('Five screenshot gear types: stat groups, fixed affixes, strength preview, variants, validation and mobile passed.');
}finally{await browser.close();}
