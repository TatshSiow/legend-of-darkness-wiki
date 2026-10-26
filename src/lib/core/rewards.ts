export const dropPoolNames: Record<string,string> = {
 percent300:'基礎抽選組 1',percent100:'基礎抽選組 2',percent10:'基礎抽選組 3',
 percent2:'基礎抽選組 4',percent1:'基礎抽選組 5',paragondrop10:'巔峰追加組',paragondrop8001:'巔峰800追加組'
};
export const skinLevelBands = [
 {min:0,max:4,multiplier:1,label:'低於、等於關卡，或高出1～4級'},
 {min:5,max:9,multiplier:.7,label:'高出5～9級'},
 {min:10,max:19,multiplier:.5,label:'高出10～19級'},
 {min:20,max:29,multiplier:.3,label:'高出20～29級'},
 {min:30,max:39,multiplier:.2,label:'高出30～39級'},
 {min:40,max:null,multiplier:.15,label:'高出40級以上'}
];
export const percent = (value:number) => value.toFixed(4).replace(/\.?0+$/,'')+'%';
