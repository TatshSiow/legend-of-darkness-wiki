import sharp from 'sharp';
import {createHash} from 'node:crypto';
import {mkdir,readFile,readdir,writeFile} from 'node:fs/promises';
import {dirname} from 'node:path';

const files=(await readdir('static/icons',{recursive:true})).filter(file=>file.endsWith('.png')).map(file=>file.replaceAll('\\','/')).sort();
const sources=await Promise.all(files.map(async file=>({file,input:await readFile(`static/icons/${file}`)})));
const hash=createHash('sha256').update('lossless-webp-96-v1');
for(const {file,input} of sources)hash.update(file).update(input);
const version=hash.digest('hex').slice(0,16),originals=[],thumbnails=[];
let originalBytes=0,optimizedBytes=0;
async function save(file,buffer){await mkdir(dirname(file),{recursive:true});await writeFile(file,buffer);}
for(const {file,input} of sources){
 const image=sharp(input),metadata=await image.metadata();
 const full=await image.webp({lossless:true}).toBuffer();
 originalBytes+=input.length;
 if(full.length>=input.length){originals.push(file);optimizedBytes+=input.length;continue;}
 optimizedBytes+=full.length;
 const output=`static/optimized/${version}/${file.replace(/\.png$/,'.webp')}`;
 await save(output,full);
 if(Math.max(metadata.width,metadata.height)>96){
  const thumbnail=await sharp(input).resize({width:96,height:96,fit:'inside',withoutEnlargement:true}).webp({lossless:true}).toBuffer();
  if(thumbnail.length<full.length){thumbnails.push(file);await save(output.replace(`/${version}/`,`/${version}/96/`),thumbnail);}
 }
}
await writeFile('src/lib/core/image-assets.json',JSON.stringify({version,originals,thumbnails})+'\n');
console.log(JSON.stringify({images:files.length,originalBytes,optimizedBytes,savedPercent:Math.round((1-optimizedBytes/originalBytes)*100),thumbnails:thumbnails.length,retainedPng:originals.length}));
