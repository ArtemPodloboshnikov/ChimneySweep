<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { FileInfoType } from "../../constants";
  import { current } from "../../store/current";

  export let name: string;
  export let path: string;
  export let index: number;
  export let type: FileInfoType = null;
  const dispatch = createEventDispatcher();

  const makeActive = (id: number) => {
    dispatch("active", id);
  };
  const recoverDependent = (currentPath: string) => {
    $current.deleted = $current.deleted.filter((path) => path !== currentPath);
  };
  const showFileInFileManager = (filePath) => {
    //@ts-ignore
    window.electronAPI.showFile(filePath);
  };
</script>

<div class={type === FileInfoType.DANGER ? "info_delete" : "info"}>
  <span class={type + " name"} on:click={() => makeActive(index)}>{name}</span>
  {#if type === FileInfoType.DANGER}
    <div class="recover">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="752pt"
        height="752pt"
        version="1.1"
        viewBox="0 0 752 752"
        on:click={() => recoverDependent(path)}
        class="recover_icon"
      >
        <g>
          <path
            d="m485.32 450.2 37.395-6.1172c-26.641 60.086-86.629 99.648-153.32 99.648v19.734c76.266 0 144.74-46.469 173.35-116.42l34.73 20.523c-14.504-24.664-25.453-62.059-30.488-91.559-15.391 25.648-39.168 56.531-61.664 74.191z"
          />
          <path
            d="m200.28 295.39-25.848-23.977 17.363 104.58 60.875-86.824-32.461 10.164c28.613-55.742 85.84-91.066 149.18-91.066v-19.73c-72.715 0-138.13 41.637-169.11 106.85z"
          />
          <path
            d="m369.39 484.53c-59.887 0-108.53-48.641-108.53-108.53h-19.734c0 70.742 57.52 128.26 128.26 128.26z"
          />
          <path
            d="m477.92 376h19.734c0-70.742-57.52-128.26-128.26-128.26v19.734c59.883 0 108.53 48.641 108.53 108.53z"
          />
          <path
            d="m428.59 376c0-32.656-26.539-59.199-59.199-59.199-32.656 0-59.199 26.539-59.199 59.199 0 32.656 26.539 59.199 59.199 59.199 32.656 0 59.199-26.539 59.199-59.199zm-98.664 0c0-21.805 17.66-39.465 39.465-39.465s39.465 17.66 39.465 39.465-17.66 39.465-39.465 39.465-39.465-17.66-39.465-39.465z"
          />
        </g>
      </svg>
    </div>
  {/if}
  <span class="path" on:click={() => showFileInFileManager(path)}>{path}</span>
</div>
<hr />

<style>
  .info,
  .info_delete {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    justify-items: center;
    align-items: center;
  }

  .info_delete {
    grid-template-columns: 45% 10% 45%;
  }

  .recover {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .recover_icon {
    fill: var(--yellow);
    width: 45px;
    height: 45px;
    position: absolute;
    left: 0;
    bottom: -9.5px;
    cursor: pointer;
  }

  .info > span:first-child {
    cursor: pointer;
  }

  .path,
  .name {
    width: 151px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    cursor: pointer;
    -webkit-user-select: none;
  }

  .name {
    text-align: center;
  }

  .path {
    color: var(--grey);
  }

  :global(.active) {
    color: var(--blue);
  }

  :global(.danger) {
    color: var(--red);
  }
</style>
