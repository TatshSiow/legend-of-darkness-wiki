<script lang="ts">import CategoryList from "#lib/components/CategoryList.svelte";import type {PageData} from "./$types";let {data}:{data:PageData}=$props();</script>
<CategoryList {data}/>
