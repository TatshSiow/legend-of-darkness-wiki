import {regions,regionDetails} from '#lib/server/data.ts';
import {error,redirect} from '@sveltejs/kit';
export const entries=()=>regions.map(r=>({key:r.key}));
export const load=({params}:{params:{key:string}})=>{const data=regionDetails(params.key);if(!data){const copyId=/^copy-(\d+)$/.exec(params.key)?.[1];const parent=copyId&&regions.find(region=>region.copyIds.includes(Number(copyId)));if(parent)redirect(308,`/regions/${parent.key}/`);error(404,'找不到地區');}return data;};

