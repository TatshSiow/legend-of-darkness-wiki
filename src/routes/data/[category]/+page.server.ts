import {categories,listing,legacyTarget} from '#lib/server/data.ts';
import {error,redirect} from '@sveltejs/kit';
export const entries=()=>[...Object.keys(categories),'transmit','chapter'].map(category=>({category}));
export const load=({params}:{params:{category:string}})=>{if(['transmit','chapter','copy'].includes(params.category))redirect(308,legacyTarget(params.category)!);const rows=listing(params.category);if(!rows)error(404,'找不到分類');return rows;};

