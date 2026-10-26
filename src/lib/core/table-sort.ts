const collator=new Intl.Collator('zh-Hant',{numeric:true,sensitivity:'base'});
export function compareTableValues(a:string,b:string){
 const missing=(value:string)=>/^(?:|—|–|-|待核對|未確認|已達上限)$/.test(value.trim());
 if(missing(a)||missing(b))return Number(missing(a))-Number(missing(b));
 const number=(value:string)=>{
  const match=value.replaceAll(',','').trim().match(/^(?:Lv\.\s*|第\s*)?([+-]?\d+(?:\.\d+)?)(?:\s*(?:%|倍|次|個|件|階|波|層|級))?$/i);
  return match?Number(match[1]):null;
 };
 const x=number(a),y=number(b);
 return x!==null&&y!==null?x-y:collator.compare(a,b);
}

/** Enhance non-paginated tables without changing their Svelte-owned cell contents. */
export function sortableTables(node:HTMLElement){
 const states=new Map<HTMLTableElement,{column:number;descending:boolean}>();
 const text=(cell:HTMLTableCellElement|undefined)=>{
  if(!cell)return '';
  if(cell.dataset.sortValue!==undefined)return cell.dataset.sortValue;
  const copy=cell.cloneNode(true) as HTMLElement;
  copy.querySelectorAll('details,small,.game-icon').forEach(n=>n.remove());
  return copy.textContent?.trim()??'';
 };
 const observe=()=>observer.observe(node,{childList:true,subtree:true,characterData:true});
 function refresh(){
  observer.disconnect();
  for(const table of node.querySelectorAll<HTMLTableElement>('table:not([data-managed-sort])')){
   const headers=Array.from(table.tHead?.rows[0]?.cells??[]);
   for(const header of headers){
    if(header.querySelector(':scope > .table-sort'))continue;
    const button=document.createElement('button');button.type='button';button.className='table-sort';
    while(header.firstChild)button.append(header.firstChild);
    button.setAttribute('aria-label',button.textContent?.trim()??'排序');
    header.append(button);header.setAttribute('scope','col');header.setAttribute('aria-sort','none');
   }
   const state=states.get(table);
   if(!state)continue;
   headers.forEach((header,i)=>header.setAttribute('aria-sort',i===state.column?(state.descending?'descending':'ascending'):'none'));
   for(const body of table.tBodies){
    const rows=Array.from(body.rows);
    // Empty-state / spanning rows retain their original position.
    if(rows.some(row=>row.cells.length!==headers.length||Array.from(row.cells).some(cell=>cell.colSpan>1||cell.rowSpan>1)))continue;
    rows.sort((a,b)=>compareTableValues(text(a.cells[state.column]),text(b.cells[state.column]))*(state.descending?-1:1));
    rows.forEach(row=>body.append(row));
   }
  }
  for(const table of states.keys())if(!node.contains(table))states.delete(table);
  observe();
 }
 const observer=new MutationObserver(refresh);
 function click(event:MouseEvent){
  const button=(event.target as Element).closest<HTMLButtonElement>('button.table-sort');
  const table=button?.closest('table'),header=button?.closest('th');
  if(!table||!header||table.hasAttribute('data-managed-sort'))return;
  const previous=states.get(table);
  states.set(table,{column:header.cellIndex,descending:previous?.column===header.cellIndex?!previous.descending:false});
  refresh();
 }
 node.addEventListener('click',click);refresh();
 return {destroy(){observer.disconnect();node.removeEventListener('click',click);states.clear();}};
}
