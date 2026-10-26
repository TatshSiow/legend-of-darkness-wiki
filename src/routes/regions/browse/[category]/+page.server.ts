import {error} from '@sveltejs/kit';
import {regionBrowser} from '#lib/server/data.ts';
import {mapCategories} from '#lib/core/region-navigation.ts';
export const entries=()=>mapCategories.filter(tab=>tab.key!=='adventure').map(tab=>({category:tab.key}));
export const load=({params}:{params:{category:string}})=>{
 const data=regionBrowser(params.category);
 if(!data||params.category==='adventure')error(404,'找不到地圖分類');
 return data;
};
