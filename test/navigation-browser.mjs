import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE});
try{
 const page=await browser.newPage();
 const base=process.env.BASE_URL||'http://127.0.0.1:5174';
 const errors=[],requests=[];
 page.on('pageerror',error=>errors.push(error.message));
 page.on('request',request=>requests.push(request));
 await page.goto(base+'/home/');
 await page.waitForLoadState('networkidle');
 await page.mouse.move(0,0);
 const initialDocuments=requests.filter(request=>request.resourceType()==='document').length;
 const target='/data/item/';
 const response=page.waitForResponse(response=>response.url().includes(target+'__data.json'));
 await page.locator(`nav a[href="${target}"]`).hover();
 await (await response).finished();
 const dataRequests=requests.filter(request=>request.url().includes(target+'__data.json')).length;
 assert.equal(new URL(page.url()).pathname,'/home/','hover must not navigate');
 const started=Date.now();
 await page.locator(`nav a[href="${target}"]`).click();
 await page.waitForURL('**'+target);
 await page.locator('main h1').waitFor();
 const clickMs=Date.now()-started;
 assert.equal(requests.filter(request=>request.url().includes(target+'__data.json')).length,dataRequests,'click must reuse preloaded data');
 assert.equal(requests.filter(request=>request.resourceType()==='document').length,initialDocuments,'navigation must retain the document');
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({preloadedBeforeClick:true,duplicateDataRequests:0,documentReloads:0,clickMs,errors}));
}finally{await browser.close();}
