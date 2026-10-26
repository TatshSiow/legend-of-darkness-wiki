import {error} from '@sveltejs/kit';
import {categories,listing} from '#lib/server/data.ts';
export const entries=()=>Object.keys(categories).flatMap(category=>Array.from({length:Math.max(0,Math.ceil(listing(category)!.records.length/50)-1)},(_,i)=>({category,number:String(i+2)})));
export const load=({params}:{params:{category:string;number:string}})=>{
 const rows=listing(params.category),initialPage=Number(params.number);
 if(!rows||!/^\d+$/.test(params.number)||!Number.isInteger(initialPage)||initialPage<2||initialPage>Math.ceil(rows.records.length/50))error(404,'找不到分頁');
 return {...rows,initialPage};
};
