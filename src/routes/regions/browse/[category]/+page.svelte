<script lang="ts">import MapBrowser from '#lib/components/MapBrowser.svelte';import type {PageData} from './$types';let {data}:{data:PageData}=$props();</script>
<MapBrowser {data}/>
