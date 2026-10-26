<script lang="ts">
 import Icon from './Icon.svelte';
 import type {Summary} from '#lib/server/data.ts';
 let {record,id,showLevel=true,quantity=record?.quantity}:{record:Summary|null;id?:unknown;showLevel?:boolean;quantity?:number|string}=$props();
</script>
{#if record}<a class="entry-identity" href={record.href}><Icon src={record.icon} quantity={record.stackable?quantity:undefined}/><span>{record.name}{#if quantity!==undefined&&!record.stackable} × {quantity}{/if}{#if showLevel&&record.category==='enemy'}<small class="enemy-level">{record.level!==null&&record.level>0?`Lv. ${record.level}`:'等級待核對'}</small>{/if}</span></a>{:else}<span>未命名項目（資料待核對）{#if quantity!==undefined} × {quantity}{/if}</span>{#if id!==undefined}<details class="entry-technical" data-pagefind-ignore><summary>技術資訊</summary><span>參照 ID：{String(id)}</span></details>{/if}{/if}
