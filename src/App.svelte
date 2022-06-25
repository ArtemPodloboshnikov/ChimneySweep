<script lang="ts">
  import FileBrowser from "./components/molecules/FileBrowser.svelte";
  import Controllers from "./components/molecules/Controllers.svelte";
  import { BrowserType } from "./constants";
  import FileViewer from "./components/molecules/FileViewer.svelte";
  import FileTree from "./components/molecules/FileTree.svelte";
</script>

<main>
  <FileBrowser title="Files for check" type={BrowserType.DEPENDENT} />
  <Controllers />
  <FileBrowser title="Dependent files" type={BrowserType.FOLDER} />
  <FileViewer />
  <FileTree />
</main>

<style>
</style>
