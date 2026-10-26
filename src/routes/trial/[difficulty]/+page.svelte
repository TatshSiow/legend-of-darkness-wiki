<script lang="ts">import TrialBrowser from '#lib/components/TrialBrowser.svelte';import type {PageData} from './$types';let {data}:{data:PageData}=$props();</script>
<TrialBrowser {data}/>
