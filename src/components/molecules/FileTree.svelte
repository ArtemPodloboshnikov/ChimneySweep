<script lang="ts">
  import type { Tree, TreeDocument } from "../../typings";

  import { currentFolder } from "../../store/currentFolder";
  import FolderTree from "../atoms/FolderTree.svelte";
  import { exceptions } from "../../store/exceptions";

  const getPureFolderPath = (
    path: string,
    folder: string
  ): { pathSplit: string[]; path: string } => {
    const path_arr = path.split("/");
    const startDeleteElements = path_arr.indexOf(folder);
    return { pathSplit: path_arr.splice(startDeleteElements), path };
  };

  $: endLevelOfPath =
    Number(
      Math.max.apply(
        null,
        $currentFolder.files.map(
          (file) =>
            getPureFolderPath(file.path, $currentFolder.name).pathSplit.length
        )
      )
    ) - 1;
  $: levels = Array(endLevelOfPath)
    .fill(1)
    .map((e, i) => i + 1);

  const getLevelFiles = (level: number) => {
    let level_files: Tree = null;

    const allFiles = $currentFolder.files.map((file) =>
      getPureFolderPath(file.path, $currentFolder.name)
    );
    let folders: TreeDocument[] = [];
    let files: TreeDocument[] = [];

    for (let i = 0; i < allFiles.length; i++) {
      const file = allFiles[i].pathSplit[level];
      if (file !== undefined) {
        const parent = allFiles[i].pathSplit.slice(0, level).join("/");
        const doc = { name: file, parent, path: allFiles[i].path };
        if (file.split(".")[1] === undefined) {
          if (
            folders.filter(
              (fold) => fold.name === file && fold.parent === parent
            ).length === 0
          ) {
            folders.push(doc);
          }
        } else {
          files.push(doc);
        }
      }
    }

    level_files = { files, folders };

    return level_files;
  };
  $: levelFiles = levels.map((level) => getLevelFiles(level));
</script>

<section>
  {#if $currentFolder.name !== ""}
    <ul>
      <li>
        <FolderTree
          {levelFiles}
          folderPath={levelFiles[0].folders.length !== 0
            ? levelFiles[0].folders[0].parent
            : levelFiles[0].files[0].parent}
          name={$currentFolder.name}
          level={0}
          open
        />
      </li>
    </ul>
  {/if}
</section>

<style>
  section {
    position: relative;
    padding: 30px;
    line-height: 1.5;
    color: var(--white);
    grid-column: span 3;
    overflow-x: hidden;
  }
</style>
