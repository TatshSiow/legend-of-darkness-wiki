<script lang="ts">
 import {page} from '$app/state';
 import {browser} from '$app/env';
 import Hero from '#lib/components/Hero.svelte';
 import type {PageData} from './$types';
 interface Result{url:string;meta:{title?:string;level?:string};excerpt:string;}
 interface Match{data:()=>Promise<Result>;}
 interface SearchIndex{search:(query:string,options:{filters:Record<string,string>})=>Promise<{results:Match[]}>;}
 let {data}:{data:PageData}=$props();
 let index:SearchIndex|undefined,matches:Match[]=[],sequence=0;
 let results=$state<Result[]>([]),busy=$state(false),message=$state(''),count=$state(0),current=$state(0),category=$state('');
 async function search(query:string,filter:string){
  const ticket=++sequence;results=[];count=0;current=0;matches=[];
  if(!query.trim()){busy=false;message='輸入怪物、裝備、技能名稱或 ID。';return;}
  busy=true;message='';
  try{
   if(!index){const path='/pagefind/pagefind.js';index=await import(/* @vite-ignore */path) as SearchIndex;}
   const response=await index.search(query,{filters:filter?{category:filter}:{}});
   const records=await Promise.all(response.results.slice(0,30).map(result=>result.data()));
   if(ticket!==sequence)return;
   matches=response.results;results=records;count=matches.length;message=count?'':'沒有符合的條目。';
  }catch{if(ticket===sequence)message='搜尋索引載入失敗，請重新整理再試。';}
  finally{if(ticket===sequence)busy=false;}
 }
 async function showPage(next:number){
  const ticket=++sequence;busy=true;message='';
  try{const records=await Promise.all(matches.slice(next*30,next*30+30).map(result=>result.data()));if(ticket===sequence){results=records;current=next;}}
  catch{if(ticket===sequence)message='搜尋結果載入失敗，請再試一次。';}
  finally{if(ticket===sequence)busy=false;}
 }
 $effect(()=>{const query=page.url.searchParams.get('q')||'';if(browser)void search(query,category);});
 const plain=(text:string)=>text.replace(/<[^>]+>/g,'');
</script>
<svelte:head><meta name="robots" content="noindex,follow"/></svelte:head>
<div data-pagefind-ignore="all"><Hero title="全站搜尋" eyebrow="SEARCH THE ARCHIVE" description="查找怪物、裝備、技能、寵物與其他遊戲資料。"/>
<div class="toolbar"><label>資料分類 <select aria-label="搜尋分類" bind:value={category}><option value="">所有分類</option>{#each data.categories as cat}<option value={cat.name}>{cat.name}</option>{/each}</select></label></div>
<p role="status" aria-live="polite">{busy?'搜尋中…':message||`找到 ${count} 筆，第 ${current+1} / ${Math.ceil(count/30)} 頁。`}</p>
<div class="search-results">{#each results as result}<a class="search-result" href={result.url}><h2>{result.meta.title||result.url}</h2>{#if result.meta.level}<span class="search-enemy-level">{result.meta.level}</span>{/if}<p>{plain(result.excerpt)}</p></a>{/each}</div>
{#if count>30}<div class="pager"><button class="btn" disabled={busy||current===0} onclick={()=>showPage(current-1)}>← 上一頁</button><span>{current+1} / {Math.ceil(count/30)} 頁</span><button class="btn" disabled={busy||(current+1)*30>=count} onclick={()=>showPage(current+1)}>下一頁 →</button></div>{/if}
<noscript><p class="notice">全文搜尋需要 JavaScript；你仍可從左側分類查詢所有條目。</p></noscript></div>
