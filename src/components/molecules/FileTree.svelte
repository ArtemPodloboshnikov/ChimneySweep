<script lang="ts">
  import type { Tree, TreeDocument } from "../../typings";
  import { currentFolder } from "../../store/currentFolder";
  import FolderTree from "../atoms/FolderTree.svelte";
  import { isDirectory } from "../../utils";

  const getPureFolderPath = (
    path: string,
    folder: string
  ): { pathSplit: string[]; path: string; indexDel: number } => {
    const path_arr = path.split("/");
    const startDeleteElements = path_arr.indexOf(folder);
    return {
      pathSplit: path_arr.splice(startDeleteElements),
      path,
      indexDel: startDeleteElements,
    };
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

  const getLevelFiles = async (level: number) => {
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
        const originPath =
          allFiles[i].path
            .split("/")
            .filter((p, index) => index < allFiles[i].indexDel)
            .filter(Boolean)
            .join("/") + `/${parent}/${file}`;
        if (await isDirectory(originPath)) {
          if (
            folders.filter(
              (fold) => fold.name === file && fold.parent === parent
            ).length === 0
          ) {
            folders.push(doc);
          }
        } else {
          if (
            files.filter((f) => f.name === file && f.parent === parent)
              .length === 0
          ) {
            files.push(doc);
          }
        }
      }
    }

    level_files = { files, folders };

    return level_files;
  };
  $: levelFiles = async () => {
    let files: Tree[] = [];
    for (let level of levels) {
      files.push(await getLevelFiles(level));
    }

    return files;
  };
</script>

<section>
  {#if $currentFolder.name !== ""}
    {#await levelFiles() then files}
      <ul>
        <li>
          <FolderTree
            levelFiles={files}
            folderPath={files[0].folders.length !== 0
              ? files[0].folders[0].parent
              : files[0].files[0].parent}
            name={$currentFolder.name}
            level={0}
            open
          />
        </li>
      </ul>
    {/await}
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
