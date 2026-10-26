import {regionBrowser,abyssBrowser,trialBattle} from '#lib/server/data.ts';
export const load=()=>({routeIcons:{
 '/regions/':'/'+regionBrowser()!.regions[0].icon,
 '/abyss/':'/'+abyssBrowser()!.regions[0].icon,
 '/trial/':trialBattle(1)!.enemies[0].record.icon
} as Record<string,string|null>});
