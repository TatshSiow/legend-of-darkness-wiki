import {error,redirect} from '@sveltejs/kit';
import {legacyEntries,legacyTarget} from '#lib/server/data.ts';
export const entries=legacyEntries;
export const load=({params}:{params:{legacy:string;entry?:string}})=>{
 const target=legacyTarget(params.legacy,params.entry);
 if(!target)error(404,'找不到條目');
 redirect(308,target);
};
