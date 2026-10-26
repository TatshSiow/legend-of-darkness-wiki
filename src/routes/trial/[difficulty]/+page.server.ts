import {trialBattle} from '#lib/server/data.ts';
import {error} from '@sveltejs/kit';
export const entries=()=>[1,2,3].map(difficulty=>({difficulty:String(difficulty)}));
export const load=({params}:{params:{difficulty:string}})=>{
 const data=/^[1-3]$/.test(params.difficulty)?trialBattle(Number(params.difficulty)):null;
 if(!data)error(404,'找不到試煉難度');
 return data;
};
