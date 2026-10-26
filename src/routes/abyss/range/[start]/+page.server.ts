import {error} from '@sveltejs/kit';
import {abyssBrowser} from '#lib/server/data.ts';
export const entries=()=>Array.from({length:11},(_,i)=>({start:String(i*12+13)}));
export const load=({params}:{params:{start:string}})=>{
 const data=/^[1-9]\d*$/.test(params.start)?abyssBrowser(Number(params.start)):null;
 if(!data)error(404,'找不到此樓層範圍');return data;
};
