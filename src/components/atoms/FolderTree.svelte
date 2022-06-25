<script lang="ts">
  import type { Tree } from "../../typings";
  import { exceptions } from "../../store/exceptions";

  export let open = false;
  export let name: string;
  export let level: number;
  export let disabled: boolean = false;
  export let levelFiles: Tree[];
  export let folderPath: string;

  const documents = levelFiles[level];
  $: isException = (title: string) => $exceptions.includes(title);

  let exceptionFlags = { [name]: disabled };

  const toggleException = (title: string, isFolder: boolean) => {
    exceptions.update((except) => {
      if (!isException(title)) {
        if (isFolder) {
          exceptionFlags[name] = true;
        }
        return [...except, title];
      }
      if (isFolder) {
        exceptionFlags[name] = false;
      }

      return except.filter((exc) => title !== exc);
    });
  };

  $: exceptionContent = (title: string) => {
    if (isException(title)) {
      return "&#11199;";
    } else {
      return "&#128504;";
    }
  };

  const toggleFolder = () => {
    open = !open;
  };
</script>

<li>
  <span
    on:click={toggleFolder}
    class:disabled={disabled || exceptionFlags[name]}
  >
    {name}
    {#if open}
      &#128449;
    {:else}
      &#128448;
    {/if}
  </span>
  <button {disabled} on:click={() => toggleException(folderPath, true)}>
    {@html exceptionContent(folderPath)}
  </button>
</li>

{#if open}
  <ul>
    {#each documents.files as file}
      {#if file.parent === folderPath}
        <li
          class:disabled={disabled ||
            exceptionFlags[name] ||
            isException(file.path)}
        >
          {file.name}
          <button
            disabled={disabled || exceptionFlags[name]}
            on:click={() => toggleException(file.path, false)}
          >
            {@html exceptionContent(file.path)}
          </button>
        </li>
      {/if}
    {/each}
    {#each documents.folders as folder}
      {#if folder.parent === folderPath}
        <svelte:self
          {levelFiles}
          name={folder.name}
          folderPath={`${folder.parent}/${folder.name}`}
          level={level + 1}
          disabled={disabled || exceptionFlags[name]}
        />
      {/if}
    {/each}
  </ul>
{/if}

<style>
  span {
    letter-spacing: 0.4px;
    color: var(--green);
    cursor: pointer;
    user-select: none;
  }

  button {
    font-size: 15px;
    width: fit-content;
    height: fit-content;
  }

  .disabled {
    color: var(--grey) !important;
  }

  :global(ul) {
    padding-left: 5px;
    list-style: none;
  }

  :global(ul li) {
    position: relative;
    padding-top: 5px;
    padding-bottom: 5px;
    padding-left: 15px;
    user-select: text;
    -webkit-app-region: no-drag;
    font-size: 15px;
  }

  :global(ul li::before) {
    position: absolute;
    top: 15px;
    left: 0px;
    width: 10px;
    height: 1px;
    margin: auto;
    content: "";
    background-color: var(--blue);
  }

  :global(ul li::after) {
    position: absolute;
    top: 0px;
    bottom: 0px;
    left: 0px;
    width: 1px;
    height: 100%;
    content: "";
    background-color: var(--blue);
  }

  :global(ul li:last-child) {
    height: 30px;
  }
</style>
