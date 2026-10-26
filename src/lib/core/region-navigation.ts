export const mapTabs = [
 {key:'adventure',name:'冒險地圖',href:'/regions/'},
 {key:'normal',name:'普通副本',href:'/regions/browse/normal/'},
 {key:'challenge',name:'挑戰副本',href:'/regions/browse/challenge/'},
 {key:'other',name:'其他副本',href:'/regions/browse/daily/'}
];
export const otherMapTabs = [
 {key:'daily',name:'日常副本',href:'/regions/browse/daily/'},
 {key:'ancient',name:'遠古副本',href:'/regions/browse/ancient/'},
 {key:'random',name:'隨機副本',href:'/regions/browse/random/'},
 {key:'portal',name:'傳送陣',href:'/regions/browse/portal/'}
];
export const mapCategories = [...mapTabs.filter(tab=>tab.key!=='other'),...otherMapTabs];
export function mapCategoryHref(category:string) {
 return mapCategories.find(tab=>tab.key===category)?.href ?? '/regions/browse/daily/';
}
