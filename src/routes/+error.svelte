<script lang="ts">import {page} from '$app/state';import Hero from '#lib/components/Hero.svelte';</script>
<Hero title={String(page.status)} description={page.error?.message||'此頁面目前無法使用。'}/><a class="btn" href="/regions/">返回地區圖鑑</a>

