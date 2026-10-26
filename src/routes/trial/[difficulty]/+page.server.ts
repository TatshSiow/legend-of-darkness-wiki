import {trialBattle,legacyEntries,legacyTarget} from '#lib/server/data.ts';
import {error,redirect} from '@sveltejs/kit';
export const entries=()=>[...new Set(['1','2','3',...legacyEntries().flatMap(entry=>entry.legacy==='trial'&&'entry' in entry?[entry.entry]:[])])].map(difficulty=>({difficulty}));
export const load=({params}:{params:{difficulty:string}})=>{
 if(!/^[1-3]$/.test(params.difficulty)){const target=legacyTarget('trial',params.difficulty);if(target)redirect(308,target);}
 const data=/^[1-3]$/.test(params.difficulty)?trialBattle(Number(params.difficulty)):null;
 if(!data)error(404,'找不到試煉難度');
 return {...data,rewards:trialBattle(3)!.rewards};
};
