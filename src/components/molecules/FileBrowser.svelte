<script lang="ts">
  import { BrowserType } from "../../constants";
  import { FileInfoType } from "../../constants";
  import { ids } from "../../constants";
  import { loaderType } from "../../constants";
  import { currentFolder } from "../../store/currentFolder";
  import { filesCheck } from "../../store/filesCheck";
  import FileInfo from "../atoms/FileInfo.svelte";
  import Loader from "./Loader.svelte";
  import { current } from "../../store/current";
  import { exceptions } from "../../store/exceptions";

  export let title: string;
  export let type: BrowserType;

  $: currentIndex = 0;
  $: isDependent = (
    dependents: string[],
    currentDependet: string = $current.dependent
  ) => dependents.includes(currentDependet);
  $: currentDependentsFiles = () =>
    $currentFolder.files.filter((file) => isDependent(file.dependents));

  const changeCurrentElement = (event) => {
    const index = Number(event.detail);
    if (currentIndex !== index && $current.dependent !== "") {
      currentIndex = index;
      if (type === BrowserType.DEPENDENT) {
        $current.dependent = $filesCheck[index].path;
        const dependentsFiles = currentDependentsFiles();
        if (dependentsFiles.length !== 0) {
          $current.file = dependentsFiles[0].path;
        } else {
          $current.file = "";
        }
      } else if (type === BrowserType.FOLDER) {
        $current.file = currentDependentsFiles()[index].path;
      }
    }
  };

  $: getTypeFolderFile = (index: number, path: string, listLength: number) => {
    let result: FileInfoType = null;
    if (listLength <= currentIndex) {
      currentIndex = 0;
    }
    if ($exceptions.filter((exc) => new RegExp(exc).test(path)).length !== 0) {
      result = FileInfoType.ATTENTION;
    } else if (currentIndex === index) {
      result = FileInfoType.ACTIVE;
    }
    if (currentIndex === index && $current.file !== path) {
      $current.file = path;
    }
    return result;
  };

  $: getTypeDependentFile = (index: number, path: string) => {
    if ($current.deleted.includes(path)) {
      return FileInfoType.DANGER;
    }
    let result: FileInfoType = null;

    if (
      $currentFolder.files.filter((file) => file.datas.length !== 0).length !==
      0
    ) {
      if (currentIndex === index) {
        result = FileInfoType.ACTIVE;
      }
    }

    return result;
  };
</script>

<div class="files">
  <h1>{title}</h1>
  <section>
    {#if $filesCheck.length === 0 && type === BrowserType.DEPENDENT}
      <Loader
        type={loaderType.MESSAGE}
        value="Drag and drop the files whose dependency you want to check here"
        id={ids.FILE_CHECK_LOADER}
        --margin="5px 30px 5px 30px"
        --flex="100%"
      />
    {:else if type === BrowserType.DEPENDENT}
      {#each $filesCheck as file, index}
        <FileInfo
          {index}
          on:active={changeCurrentElement}
          name={file.name}
          path={file.path}
          type={getTypeDependentFile(index, file.path)}
        />
      {/each}
    {:else if type === BrowserType.FOLDER}
      {#each currentDependentsFiles() as file, index}
        <FileInfo
          {index}
          on:active={changeCurrentElement}
          name={file.path.split("/")[file.path.split("/").length - 1]}
          path={file.path}
          type={getTypeFolderFile(
            index,
            file.path,
            currentDependentsFiles().length
          )}
        />
      {/each}
    {/if}
  </section>
</div>

<style>
  section {
    display: flex;
    flex-direction: column;
    height: 287px;
    padding-top: 12px;
    padding-bottom: 12px;
  }

  .files {
    display: flex;
    flex-direction: column;
    grid-column: span 2;
  }

  .files > h1 {
    text-align: center;
  }
</style>
