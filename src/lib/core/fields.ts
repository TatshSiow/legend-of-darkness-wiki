export const labels: Record<string,string> = {id:'ID',name:'名稱',name_en:'英文名稱',level:'等級',quality:'品質代碼',att:'攻擊',hp:'生命',def:'防禦',hit:'命中',spo:'閃避',cri:'暴擊數值',crihurt:'暴擊傷害數值',res:'異常抗性數值',burn:'燃燒抗性',lightning:'電擊抗性',poison:'毒抗性',vertigo:'暈眩抗性',base:'基礎抗性參數',isresi:'抗性開關',offset:'成長參數',skillid1:'技能一',skillid2:'技能二',type:'類型代碼',subtype:'子類型代碼',price:'價格',hurt:'直接傷害倍率（%）',hurtcount:'命中次數',hurttype:'傷害類型代碼',bufftype:'效果代碼',buffvalue:'效果數值',buffround:'效果回合',learnlevel:'學習等級',describe:'原文描述',describe_en:'英文描述',desc:'描述',name1:'屬性一',name2:'屬性二',name3:'屬性三',type1:'屬性一代碼',type2:'屬性二代碼',type3:'屬性三代碼',value1:'屬性一數值',value2:'屬性二數值',value3:'屬性三數值',specialgrow:'成長型',paragon:'巔峰參數',exp:'經驗',gold:'金幣',hard:'難度',score:'積分',itemid:'物品 ID',itemnum:'數量',copyprice:'進入消耗',hpper:'生命（%）',attper:'攻擊（%）',defper:'防禦（%）',hurtper:'傷害（%）',subhurtper:'減傷（%）',crihit:'暴傷'};
export const attrNames: Record<number,string> = {1:'攻擊',2:'防禦',3:'生命',4:'命中',5:'閃避',6:'暴擊數值',7:'暴傷數值',8:'異常抗性',9:'掉落',10:'經驗',11:'回復',12:'基礎攻擊%',13:'基礎防禦%',14:'基礎生命%',16:'傷害%',17:'減傷%',18:'對王傷害%',19:'金幣%',21:'技能釋放率',23:'額外暴擊率',24:'額外暴傷',33:'技能效果',40:'抗暴%',43:'寵物技能率',44:'吸血',45:'燃燒傷害',46:'電擊傷害',47:'燃燒與電擊傷害',52:'毒傷害',53:'降低敵人異常抗性',57:'降低敵人暈眩抗性'};
export const isValue = (value: unknown) => value !== undefined && value !== null && value !== "" && value !== "null";
labels.availability='掉落查核';
labels.titleSource='取得方式';labels.titleRewards='關聯稱號';
export const isReferenceField = (key:string) => /^(?:id|itemid|enemyid|skillid|matid|dropid|droptipid|minid|maxid|subid|preid|needitem|matequipid|hideboss|hideid|war)\d*$/.test(key);
Object.assign(attrNames,{20:'冒險復活次數',22:'隱藏怪物出現率%',24:'額外暴傷%',25:'額外閃避率%',26:'額外命中率%',27:'額外抵抗率%',42:'寵物經驗%'});
// Original language/cn.xml extraattr keys; these describe labels, not verified combat formulas.
Object.assign(attrNames,{15:'吸血',28:'影片廣告魔石',29:'兌換雙倍物品機會',30:'冒險怪物數量',31:'抽獎八折',32:'每回合生命回復%',34:'找到寶藏機率%',35:'熔煉成功率%',36:'試煉積分增加',37:'寵物探險獎勵增加',38:'洗練材料消耗降低',39:'野外首領發現機會',41:'捕捉寵物成功率%',48:'合成寶石成功率提高',49:'分解遠古裝備額外遠古之石',50:'祕境怪物發現機會',54:'降低敵人火焰抗性%',55:'降低敵人電擊抗性%',56:'降低敵人毒素抗性%',59:'所有技能負面傷害%',60:'傳送陣不消耗道具機率%',61:'深淵部分怪物受到詛咒',62:'主寵專屬技能必定觸發',63:'祕境礦工怪物持續存在'});

// Code namespaces differ: item subtype and effecttype need their own mappings.
const equipmentSlots: Record<number,string> = {1:'武器',2:'帽子',3:'鎧甲',4:'護手',5:'鞋子',6:'戒指',7:'項鍊',8:'褲子',9:'特殊',10:'翅膀',11:'冒險徽章',12:'深淵徽章',13:'鐵匠徽章',14:'巔峰徽章',20:'幻化符文',21:'攻擊之石',22:'生命之石'};
const itemKinds: Record<number,string> = {1:'消耗品與材料',2:'裝備'};
Object.assign(labels, {quality:'品質',type:'類型',subtype:'分類',type1:'第一屬性',type2:'第二屬性',type3:'第三屬性',
 value1:'第一屬性數值',value2:'第二屬性數值',value3:'第三屬性數值',
 effecttype:'效果類型',effectvalue:'效果數值',useid:'使用方式',ishas:'內部資料標記',smelt:'可熔煉',
 maintype:'主屬性類型',mainvalue:'主屬性參數',subvalue:'副屬性參數',
 tematt:'攻擊生成參數',temhp:'生命生成參數',temdef:'防禦生成參數',
 moneyper:'金幣加成（%）',dropper:'掉落加成（%）',expper:'經驗加成（%）',rehp:'每回合回復生命',absorbhp:'吸血',
 special:'特殊參數',tem2:'附加屬性類型',tem3:'附加屬性數值',explored:'探險能力',drop:'掉落能力',money:'魔石能力',
 unlocknum:'解鎖需求數量',growvalue:'成長數值',basetype:'基礎屬性類型',basevalue:'基礎屬性數值'});
Object.assign(labels,{needcount:'需求次數',awardspecial:'特殊獎勵參數',awardmoney:'魔石獎勵',isshow:'顯示設定',isspecial:'特殊設定',
 minid:'起始關卡 ID',maxid:'結束關卡 ID',minlevel:'最低等級',maxlevel:'最高等級',levelnum:'關卡數量',hideboss:'隱藏首領關卡',
 attroffset:'戰鬥屬性調整參數',droptipid:'掉落提示 ID',honor:'榮譽',bosstype:'首領類型',num:'數量參數',dropid:'掉落表 ID',
 point:'積分',pagetype:'頁面分類',cheat:'作弊檢查設定',needlevel:'需求等級',achievepoint:'成就點數',needitem:'需求物品 ID',needitemnum:'需求物品數量',
 itemtype:'物品類型',itemweight:'抽選權重',min:'最小值',max:'最大值',offsetmin:'最小調整參數',offsetmax:'最大調整參數',minnum:'最少數量',maxnum:'最多數量',
 time:'時間設定',subid:'子項目 ID',isstart:'起始設定',preid:'前置項目 ID',eprice:'額外價格參數',hidetype:'隱藏條件類型',isend:'結束設定',
 pro:'機率判定參數',itemprice:'物品價格',buffpro:'效果觸發參數',target:'目標類型',awardexp:'經驗獎勵',tem:'備用參數',enemyid:'敵人 ID',enemylevel:'敵人等級',bossdrop:'首領掉落參數'});

export function fieldCurrency(category:string,key:string):'gold'|'money'|undefined {
 if(key==='gold'||(['item','make'].includes(category)&&key==='price'))return 'gold';
 if(key==='awardmoney'||(category==='shop'&&key==='itemprice'))return 'money';
 return undefined;
}
export function fieldLabel(key: string,category=''): string {
 if(category==='trial'&&key==='score')return '結算入池分數條件';
 if(category==='trial'&&key==='hard')return '獎勵來源難度';
 if(['drop','droptip'].includes(category)){
  if(key==='rewardCount')return '道具種類';
  if(key==='usage')return '適用狀態';
  if(key==='sourceCount')return '引用戰鬥數';
 }
 if(category==='level'){
  const names:Record<string,string>={level:'關卡等級（設定值）',ename:'事件／對象名稱',eword:'事件文字',preid:'前置節點 ID',subid:'子項目 ID',eprice:'事件費用參數',eicon:'事件圖示',type:'事件類型代碼'};
  if(names[key])return names[key];
 }
 if(category==='god'&&key==='from')return '資料記載來源（未核實取得）';
 if(category==='god'&&key==='level')return '圖鑑等級參數';
 if(category==='treasure'&&key==='name')return '獎勵池';
 if(category==='treasure'&&key==='usage')return '用途／適用條件';
 if(category==='treasure'&&key==='rewardCount')return '獎勵種類（含不同數量）';
 if(category==='shop'&&key==='itemprice')return '購買價格（魔石）';
 if(category==='make'&&key==='price')return '合成費用（金幣）';
 if(category==='item'&&key==='price')return '出售價格（金幣）';
 if(labels[key])return labels[key];
 const indexed=/^(spetype|spevalue|atttype|attvalue|skillid|skillvalue|enemyid|matid|matnum|itemid|id|pro|min|max|require|hidetype|hideid|war|dropid|droppro|dropnum)(\d+)$/.exec(key);
 if(indexed){const names:Record<string,string>={spetype:'特殊屬性',spevalue:'特殊屬性數值',atttype:'神器屬性',attvalue:'神器屬性數值',skillid:'技能',skillvalue:'技能數值',enemyid:'敵人',matid:'材料',matnum:'材料數量',itemid:'物品 ID',id:'條目 ID',pro:'機率判定參數',min:'最少數量',max:'最多數量',require:'需求條件',hidetype:'隱藏條件類型',hideid:'隱藏關卡 ID',war:'戰鬥關卡 ID',dropid:'掉落表 ID',droppro:'掉落判定參數',dropnum:'掉落數量'};return `${names[indexed[1]]} ${indexed[2]}`;}
 return `待解讀欄位（${key}）`;
}

export function fieldValue(category: string,key: string,value: unknown,row: Record<string,unknown> = {}): string {
 if(!isValue(value))return '—';
 const n=Number(value);
 if(category==='item'&&key==='specialgrow')return n?'成長型':'非成長型';
 if(category==='item'&&key==='ishas')return `${value}（資料標記，實際用途待核對）`;
 if(category==='item'&&key==='special'&&row.type===1&&row.subtype===4)return ({1:'普通',2:'精緻',3:'完美',4:'璀璨'} as Record<number,string>)[n]??`階級 ${value}`;
 if(category==='pet'&&key==='quality')return ({1:'普通',2:'標準',3:'優秀',4:'極品',5:'神獸',6:'遠古神獸'} as Record<number,string>)[n]??'品質待核對';
 if(category==='trial'&&key==='hard')return ({1:'青銅',2:'白銀',3:'黃金'} as Record<number,string>)[n]??'難度待核對';
 // language/cn.xml qulity1..6 applies to items, not enemy/pet/skin quality.
 if(category==='item'&&key==='quality')return ({1:'普通',2:'魔法',3:'精良',4:'傳說',5:'史詩',6:'神器'} as Record<number,string>)[n]||`未確認品質（${value}）`;
 if(category==='item'&&key==='type')return itemKinds[n]||`未確認類型（${value}）`;
 if(category==='item'&&key==='subtype'){
  const kinds:Record<number,string>={1:'藥品',2:'無',3:'材料',4:'寶石',5:'卷軸',6:'特殊',7:'禮包',8:'其他',9:'寵物相關道具'};
  return (row.type===2?equipmentSlots[n]:kinds[n])||`未確認分類（${value}）`;
 }
 if(category==='item'&&key==='smelt')return n?'是':'否';
 if(category==='item'&&key==='maintype')return attrNames[n]||`待解讀主屬性（${value}）`;
 if(category==='item'&&key==='useid')return ({0:'無直接使用效果',1:'開啟寶箱',5:'換取金幣',6:'換取魔石',7:'使用藏寶圖',8:'指定地點傳送',9:'隨機傳送',10:'裝備使用',11:'經驗增益',12:'幸運增益'} as Record<number,string>)[n]||`未確認使用方式（${value}）`;
 if(category==='item'&&key==='effecttype'){
  // Old gem descriptions use a different numbering scheme; do not apply the extraattr labels.
  if(row.type===1&&row.subtype===4&&Number(row.id)>=5013&&Number(row.id)<=5036&&isValue(row.describe))return `${row.describe}（原始描述）`;
  return ({12:'挖礦',13:'掉落增益',14:'經驗增益'} as Record<number,string>)[n]||attrNames[n]||`待解讀效果（${value}）`;
 }
 if(/^(spetype\d+|atttype\d+|basetype)$/.test(key)||(['skin','pet'].includes(category)&&/^(type[123]|tem2)$/.test(key)))return attrNames[n]||`待解讀效果（${value}）`;
 return String(value);
}

export function attributeRows(category: string,row: Record<string,unknown>) {
 const consumed=new Set<string>();
 const paired:{label:string;value:string;currency:ReturnType<typeof fieldCurrency>}[]=[];
 const pairs:[string,string,string][]=[];
 if(category==='skin')for(let i=1;i<=3;i++)pairs.push([`type${i}`,`value${i}`,'']);
 for(let i=1;i<=12;i++)pairs.push([`spetype${i}`,`spevalue${i}`,'']);
 if(category==='god')for(let i=1;i<=7;i++)pairs.push([`atttype${i}`,`attvalue${i}`,'']);
 if(category==='skin')pairs.push(['tem2','tem3','附加屬性：']);
 for(const [type,value,prefix] of pairs){
  consumed.add(type);consumed.add(value);
  if(Number(row[type])>0&&isValue(row[value])&&Number(row[value])!==0)paired.push({label:prefix+(attrNames[Number(row[type])]||`待解讀屬性（${row[type]}）`),value:String(row[value]),currency:undefined});
 }
 return [...Object.entries(row).filter(([key,value])=>typeof value==='number'&&value!==0&&!isReferenceField(key)&&!consumed.has(key))
  .map(([key,value])=>({label:category==='item'&&key==='special'&&row.type===1&&row.subtype===4?'寶石階級':fieldLabel(key,category),value:fieldValue(category,key,value,row),currency:fieldCurrency(category,key)})),...paired];
}

