<script lang="ts">
 let {kind,value}:{kind:'gold'|'money';value:number|string}=$props();
 const names={gold:'金幣',money:'魔石'};
</script>
<span class="currency" data-currency={kind} aria-label={`${names[kind]} ${value}`} title={names[kind]}><img src={`/icons/currency/${kind==='gold'?'coin':'money'}_bg.png`} alt={names[kind]} width="22" height="22" loading="lazy"/><span>{typeof value==='number'?value.toLocaleString('zh-TW'):value}</span></span>
<style>.currency{display:inline-flex;align-items:center;gap:5px;white-space:nowrap;font-variant-numeric:tabular-nums}.currency img{width:22px;height:22px;object-fit:contain;flex-shrink:0}</style>
