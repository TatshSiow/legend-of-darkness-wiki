import {defineConfig} from 'vite';
// Preview the deployable static output, including Pagefind's post-build files.
export default defineConfig({appType:'mpa',build:{outDir:'build'},preview:{host:'127.0.0.1',port:4174,strictPort:true}});
