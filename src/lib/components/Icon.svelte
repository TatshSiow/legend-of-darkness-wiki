<script lang="ts">let {src,large=false,quantity}:{src:string|null|undefined;large?:boolean;quantity?:number|string}=$props();</script>
<span class="game-icon" class:large><img src={src||'/icons/fallback.svg'} alt={src?'':'無原圖，使用備用圖示'} loading="lazy" width={large?96:44} height={large?96:44}>{#if quantity!==undefined}<span class="stack-count" aria-label={`數量 ${quantity}`}>{quantity}</span>{/if}</span>
<style>.game-icon{position:relative}.stack-count{position:absolute;right:2px;bottom:1px;z-index:3;color:#fff;font:bold 11px/1.2 'Segoe UI',sans-serif;text-shadow:0 1px 2px #000,1px 0 2px #000,-1px 0 2px #000;background:#100d08b3;padding:1px 2px;max-width:100%;white-space:nowrap}</style>

