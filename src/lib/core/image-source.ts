import assets from './image-assets.json' with {type:'json'};
const originals=new Set(assets.originals),thumbnails=new Set(assets.thumbnails);

export function imageSource(src:string|null|undefined,thumbnail=false):string {
 if(!src)return '/icons/fallback.svg';
 if(!src.startsWith('/icons/')||!src.endsWith('.png'))return src;
 const file=src.slice('/icons/'.length);
 if(originals.has(file))return src;
 return `/optimized/${assets.version}/${thumbnail&&thumbnails.has(file)?'96/':''}${file.replace(/\.png$/,'.webp')}`;
}
