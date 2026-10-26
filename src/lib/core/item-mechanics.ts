import type {GameRecord} from './types.ts';
const f=Math.fround,t=Math.trunc;
export const scoreNames=['普通','標準','優秀','極品'];
export interface EquipmentContext {level:number;quality:number;paragon:number;ancient:boolean}
function integer(n:number,min:number,max:number){if(!Number.isInteger(n)||n<min||n>max)throw new RangeError('超出遊戲資料範圍');}
function context(c:EquipmentContext){integer(c.level,1,80);integer(c.quality,1,6);integer(c.paragon,0,1500);}
export function equipmentCosts(c:EquipmentContext){
 context(c);const {level:l,quality:q,paragon:p,ancient:a}=c;
 const common=f(f(f(l*l)*f(1+f(q*.5)))*8+80*l);
 let resetGold=t(f(f(common*.25)*3)),materials=t(l/10)+1,gold=t(common),money=2*t(l/10)+q+2;
 if(l>=71){resetGold=t(f(resetGold*f(1.3)));materials=t(f(materials*f(1.3)));gold=t(f(gold*f(1.3)));money=t(f(money*f(1.3)));}
 if(p>=501){resetGold=t(f(resetGold*f(1.4)));materials=t(f(materials*f(1.4)));gold=t(gold*1.4);}
 if(p>=1001){resetGold=t(f(resetGold*5));materials=t(f(materials*2));gold=t(f(gold*5));money=t(f(money*2));}
 if(a){resetGold=t(resetGold*1.5);materials=t(materials*1.5);gold=t(gold*1.5);money=t(money*1.5);}
 return {reset:{gold:resetGold,materials},enchantGold:gold,enchantMoney:money};
}
export function strengthCost(c:EquipmentContext,step:number){
 context(c);integer(step,0,17);
 const n=t((step+1)**3/(step+t(c.level/-3)+51))+t(c.level/8);
 const stone=(advanced:boolean)=>{let value=advanced?3*(step-15)**2+t(n/4)-5:n;if(c.level>=71)value=t(f(value*f(1.3)));return Math.max(1,value);};
 let primary=stone(step>=15),supplement=stone(false);
 if(c.paragon>=501&&c.level>=80){primary=t(primary*1.5);supplement=t(primary*1.5);}
 if(c.paragon>=1001){primary=t(f(primary*2));supplement=t(f(supplement*2));}
 if(c.ancient){primary=t(primary*1.5);supplement=t(supplement*1.5);}
 return {primary,supplement,id:step<15?5003:5086};
}
export function equipmentStat(main:number,step:number,grade:number,score:number,paragon:number,multipliers:number[],scoreMultipliers:number[]){
 integer(step,0,18);integer(grade,1,4);integer(score,1,100);integer(paragon,0,1500);
 const rating=f(scoreMultipliers[grade-1]+f(f(score/100)*f(grade===4?.15:.1)));
 let p=paragon>=1001?f(f((paragon-1000)/500)+f(3.3333332538604736)):f(paragon/300);
 const scale=p<0||p>7?1:f(p+1);
 return t(f(f(f(f(main)*multipliers[step])*rating)*(paragon?scale:1)));
}
export function scaledStat(value:number,multiplier:number){return t(f(f(value)*multiplier));}
export function randomAttributeRange(descriptor:number[],level:number,paragon:number,ancient:boolean,badge:boolean){
 integer(level,1,80);integer(paragon,0,1500);
 const [,min,max,scaled]=descriptor;
 if(!scaled)return {min:min+(ancient?t((max-min)/2):0),max};
 const effective=t(paragon>=1001?f(f(level+f(166.6666717529297))+f(f((paragon-1000)/6)/f(1.5))):f(level+f(paragon/6)));
 const base=f(f(effective*min)*f(badge?.015:.03));
 const at=(roll:number)=>Math.max(1,t(f(base*f(1+f(roll*f(.01))))));
 return {min:at(ancient?10:1),max:at(20)};
}
export function specialAttributes(row:GameRecord){return Array.from({length:12},(_,i)=>({type:Number(row[`spetype${i+1}`]),value:Number(row[`spevalue${i+1}`])})).filter(a=>a.type>0&&Number.isFinite(a.value)&&a.value!==0);}
export function refineCost(kind:string,level:number,quality:number,paragon:number,refines:number,discount:boolean){
 integer(level,1,80);integer(quality,1,6);integer(paragon,0,1500);integer(refines,0,999);
 const rune=kind==='rune',effective=t(f(level+f(paragon/6)));
 const price=rune?Math.min(2000,t(f(f((refines+1)**2*.5)*f(quality+1)))):Math.min(100000000,t(f(f((refines+1)**2*f(.8))*f(effective*effective*(quality+1)))));
 const discounted=(n:number)=>Math.max(1,discount?t(f(n*f(.8))):n);
 return {price,material1:discounted(t(price/(rune?10:2000000))+1),material2:rune?discounted(t(price/100)+1):0};
}
export function chestRates(items:NonNullable<GameRecord['items']>){
 const weights=items.map(item=>Number(item.itemweight));
 if(!weights.length||weights.some(w=>!Number.isInteger(w)||w<0))throw new RangeError('寶箱權重無效');
 const total=weights.reduce((a,b)=>a+b,0)+1;
 return items.map((item,i)=>({itemid:item.itemid,itemnum:item.itemnum,itemweight:item.itemweight,rate:(weights[i]+(i===0?1:0))/total*100}));
}
