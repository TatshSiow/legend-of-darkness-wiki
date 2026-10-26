import {regions,regionDetails} from '#lib/server/data.ts';
import {error} from '@sveltejs/kit';
export const entries=()=>regions.map(r=>({key:r.key}));
export const load=({params}:{params:{key:string}})=>{const data=regionDetails(params.key);if(!data)error(404,'找不到地區');return data;};

