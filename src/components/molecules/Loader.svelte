<script lang="ts">
  import { onMount } from "svelte";
  import { loaderType } from "../../constants";
  import { currentFolder, File } from "../../store/currentFolder";
  import { exceptions } from "../../store/exceptions";
  import { FileCheck, filesCheck } from "../../store/filesCheck";
  import DialogWindow from "../atoms/DialogWindow.svelte";

  export let type: loaderType;
  export let value: string;
  export let id: string;

  let errorMessage = "";

  onMount(() => {
    let dropArea = document.getElementById(id);
    dropArea.classList.toggle("drag");
    const classToogle = (add, remove) => {
      dropArea.classList.add(add);
      dropArea.classList.remove(remove);
    };
    dropArea.addEventListener("drop", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      classToogle("drop", "drag");

      for (const f of event.dataTransfer.files) {
        //@ts-ignore
        const path: string[] = f.path.split("\\");
        const name: string = path[path.length - 1];
        const nameSplit = name.split(".");
        if (type === loaderType.BUTTON) {
          if (nameSplit[1] === undefined || nameSplit[0] === "") {
            currentFolder.update((folder) => ({
              name: "",
              files: folder.files,
            }));
            //@ts-ignore
            const files: string[] = await window.electronAPI.getFileStructure(
              path.join("/")
            );

            let folder_files: File[] = [];
            files.forEach((file) => {
              folder_files.push({ path: file, datas: [], dependents: [] });
            });

            currentFolder.set({ name, files: folder_files });
            $exceptions = [];
          } else {
            errorMessage = `"${name}" not a folder`;
          }
        } else if (type === loaderType.MESSAGE) {
          if (nameSplit[1] !== undefined && nameSplit[0] !== "") {
            let files: FileCheck[] = [
              ...$filesCheck,
              { name, path: path.join("/") },
            ];
            filesCheck.set(files);
          } else {
            errorMessage = `"${name}" not a file`;
          }
        }
      }
    });

    dropArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    dropArea.addEventListener("dragenter", (event) => {
      classToogle("drop", "drag");
    });

    dropArea.addEventListener("dragleave", (event) => {
      classToogle("drag", "drop");
    });
  });
</script>

<div class="loader">
  <DialogWindow
    isOpen={Boolean(errorMessage)}
    message={errorMessage}
    noText="Cancel"
    noAction={() => {
      errorMessage = "";
    }}
  />
  {#if type === loaderType.BUTTON}
    <button {id}>{$currentFolder.name ? $currentFolder.name : value}</button>
  {:else if type === loaderType.MESSAGE}
    <button class="message" {id}>
      {value}
    </button>
  {/if}
</div>

<style>
  button {
    background: none;
  }

  button:active {
    background: none;
  }

  .message {
    width: 100%;
    height: 100%;
  }

  .loader {
    margin: var(--margin, 0);
    flex: var(--flex, 0);
  }

  :global(.drag) {
    border: 1px dashed #13a987;
  }

  :global(.drop) {
    border: 1px solid #13a987;
  }
</style>
