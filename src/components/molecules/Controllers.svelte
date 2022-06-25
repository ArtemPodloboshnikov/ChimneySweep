<script lang="ts">
  import { loaderType } from "../../constants";
  import { ids } from "../../constants";
  import { current } from "../../store/current";
  import { currentFolder, File } from "../../store/currentFolder";
  import { exceptions } from "../../store/exceptions";
  import {
    FileCheck,
    filesCheck,
    filesCheckReset,
  } from "../../store/filesCheck";
  import DialogWindow from "../atoms/DialogWindow.svelte";
  import Loader from "./Loader.svelte";

  let pathReplace: string = "";
  let pathForReplace: string = "";
  let isDeleteQuestion = false;
  $: isCheck = $filesCheck.length === 0 || $currentFolder.name === "";
  $: isReset = $filesCheck.length === 0;
  $: isReplace = !Boolean(pathReplace) || isCheck;
  $: isDelete = $current.deleted.length === 0;
  $: isOnlyFolderReplace = false;
  $: isException = (path: string) =>
    $exceptions.filter((exc) => new RegExp(exc).test(path)).length === 0;

  const extractPaths = (
    files: File[],
    condition: (file: File) => boolean = (file) => true
  ) => {
    let paths = [];
    files.forEach((file) => {
      if (condition(file)) {
        paths.push(file.path);
      }
    });

    return paths;
  };

  const deleteDialogToggle = () => {
    isDeleteQuestion = !isDeleteQuestion;
  };

  const checkFiles = async () => {
    let files: File[] = [];
    type Result = {
      dependent: string;
      datas: string[];
      dependentFiles: string[];
    };
    let result: Result[] = [];
    const folderFilesForCheck =
      $exceptions.length !== 0
        ? $currentFolder.files.filter((file) => isException(file.path))
        : $currentFolder.files;
    for (let dependent of $filesCheck) {
      //@ts-ignore
      const res: Result = await window.electronAPI.getIndexDependent(
        dependent.path,
        extractPaths(folderFilesForCheck)
      );
      result.push(res);
    }

    $currentFolder.files.forEach((file) => {
      let folderFile: File = { path: file.path, datas: [], dependents: [] };
      result.forEach((res) => {
        if (res.dependentFiles.length === 0) {
          $current.deleted.push(res.dependent);
        } else {
          res.dependentFiles.forEach((depFile, index) => {
            if (file.path === depFile) {
              folderFile.datas.push(res.datas[index]);
              folderFile.dependents.push(res.dependent);
              folderFile.path = file.path;
            }
          });
        }
      });

      files.push(folderFile);
    });

    currentFolder.set({
      ...$currentFolder,
      files,
    });

    $current.dependent = $filesCheck[0].path;
    const folderFileDependent = $currentFolder.files.filter((file) =>
      file.dependents.includes($filesCheck[0].path)
    )[0];
    $current.file = folderFileDependent ? folderFileDependent.path : "";
  };

  const replacePath = async () => {
    let filesPath = extractPaths($currentFolder.files, (file: File) =>
      file.dependents.includes($current.dependent)
    );

    filesPath = filesPath
      .map((filePath) => {
        if (isException(filePath)) {
          return filePath;
        }
      })
      .filter(Boolean);
    const dependentPath = $current.dependent;
    const oldName =
      pathForReplace ||
      dependentPath.split("/")[dependentPath.split("/").length - 1];
    let newCheckFiles: FileCheck[] = [];
    let checkFilesNames: string[] = [];
    $filesCheck.forEach((file) => {
      if (file.path === dependentPath && !isOnlyFolderReplace) {
        let newPath: string | string[] = file.path.split("/");
        newPath[newPath.length - 1] = pathReplace;
        newPath = newPath.join("/");
        newCheckFiles.push({ name: pathReplace, path: newPath });
        checkFilesNames.push(pathReplace);

        $current.dependent = newPath;
      } else {
        newCheckFiles.push(file);
        checkFilesNames.push(file.name);
      }
    });

    const filesData: { path: string; data: string; dependent: string }[] =
      //@ts-ignore
      await window.electronAPI.replaceDependent(
        filesPath,
        dependentPath,
        oldName,
        pathReplace,
        isOnlyFolderReplace
      );
    for (let fileName of checkFilesNames) {
      const duplicateFirstIndex = checkFilesNames.indexOf(fileName);
      const duplicateSecondIndex = checkFilesNames.lastIndexOf(fileName);

      if (duplicateFirstIndex !== duplicateSecondIndex) {
        newCheckFiles.splice(duplicateSecondIndex, 1);
      }
    }
    filesCheck.set(newCheckFiles);

    let newFolderFiles: File[] = [...$currentFolder.files];
    $currentFolder.files.forEach((file, index) => {
      const filesDataFilters = filesData.filter(
        (new_file) => file.path === new_file.path
      );
      filesDataFilters.forEach((new_file) => {
        const index_dep = file.dependents.indexOf(dependentPath);
        let dependents = [...file.dependents];
        let datas = [...file.datas];
        dependents[index_dep] = new_file.dependent;
        datas[index_dep] = new_file.data;
        newFolderFiles[index] = {
          path: file.path,
          datas: datas,
          dependents: dependents,
        };
      });
    });

    currentFolder.set({
      ...$currentFolder,
      files: newFolderFiles,
    });
  };

  const deleteUnusableDependents = async () => {
    const newCheckFiles = $filesCheck.filter(
      (file) => !$current.deleted.includes(file.path)
    );
    //@ts-ignore
    window.electronAPI.deleteDependents($current.deleted);
    filesCheck.set(newCheckFiles);
    $current.deleted = [];
    await checkFiles();
    deleteDialogToggle();
  };

  const closeApp = () => {
    //@ts-ignore
    window.electronAPI.closeApp();
  };

  const dataReset = () => {
    filesCheck.set(filesCheckReset);
    $current.dependent = "";
    $current.file = "";
    $current.deleted = [];
    $exceptions = [];
    pathReplace = "";
    pathForReplace = "";
  };
</script>

<div class="controllers">
  <DialogWindow
    isOpen={isDeleteQuestion}
    message="Do you want to delete these files?"
    yesText="Delete"
    yesAction={deleteUnusableDependents}
    noText="Cancel"
    noAction={deleteDialogToggle}
  />
  <div class="double">
    <button disabled={isReset} on:click={dataReset}>Reset</button>
    <button class="close_app" on:click={closeApp}>Close</button>
  </div>
  <Loader
    type={loaderType.BUTTON}
    value="Folder for check"
    id={ids.FOLDER_LOADER}
  />
  <div class="double">
    <input placeholder="New path" bind:value={pathReplace} />
    <input placeholder="Path to replace" bind:value={pathForReplace} />
  </div>
  <div class="double">
    <button disabled={isReplace} on:click={() => replacePath()}>
      Replace paths
    </button>
    <button
      disabled={isReplace}
      class:isOnlyFolderReplace
      on:click={() => (isOnlyFolderReplace = !isOnlyFolderReplace)}
    >
      (only folder)
      {@html isOnlyFolderReplace ? "&#128504;" : "&#11199;"}
    </button>
  </div>
  <button disabled={isDelete} on:click={deleteDialogToggle}>
    Delete unused files
  </button>
  <button disabled={isCheck} on:click={checkFiles}>Check</button>
</div>

<style>
  .controllers {
    display: flex;
    flex-direction: column;
    grid-column: 3 / 5;
    row-gap: 20px;
    justify-content: end;
  }

  .isOnlyFolderReplace,
  .close_app {
    background: var(--red);
  }

  .double {
    column-gap: 10px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    place-items: center center;
  }
</style>
