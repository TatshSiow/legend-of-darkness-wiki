<script lang="ts">let {title,eyebrow='THE ARCHIVE',description=''}:{title:string;eyebrow?:string;description?:string}=$props();</script>
<svelte:head><title>{title} · 黑暗傳說 Wiki</title><meta name="description" content={description||`${title}：黑暗傳說遊戲資料、屬性與相關條目。`}><meta property="og:title" content={`${title} · 黑暗傳說 Wiki`}/><meta property="og:description" content={description||`${title}：黑暗傳說遊戲資料。`}/></svelte:head>
<section class="hero"><div class="eyebrow">{eyebrow}</div><h1>{title}</h1>{#if description}<p>{description}</p>{/if}<div class="rune" aria-hidden="true">◈</div></section>

