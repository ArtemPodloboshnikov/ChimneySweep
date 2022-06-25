<script lang="ts">
  export let isOpen: boolean;
  export let message: string;
  export let yesText: string = "";
  export let noText: string;
  export let yesAction: () => void = () => {};
  export let noAction: () => void;

  const delay = async (ms: number) =>
    await new Promise((resolve) => setTimeout(resolve, ms));
</script>

{#if isOpen}
  <div class="curtains">
    {#await delay(500) then value}
      <section>
        <h1>{message}</h1>
        {#if yesText !== ""}
          <button on:click={yesAction} class="yes">
            {yesText}
          </button>
        {/if}
        <button class={yesText === "" ? "no_one" : "no"} on:click={noAction}>
          {noText}
        </button>
      </section>
    {/await}
  </div>
{/if}

<style>
  .curtains {
    backdrop-filter: blur(16px) saturate(180%);
    background-color: rgba(17, 25, 40, 0.4);
    position: fixed;
    width: 100%;
    height: 100%;
    z-index: 100;
    left: 0;
    top: 0;
    animation: showCurtains 0.5s linear;
  }

  section {
    position: absolute;
    z-index: 101;
    top: 50%;
    left: 50%;
    width: 50%;
    height: auto;
    display: grid;
    opacity: 1;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: 2fr 1fr;
    transform: translate(-50%, -50%);
    animation: showQuestion 0.3s linear;
  }

  section > h1 {
    grid-column: 1 / 3;
    grid-row: 1 / 2;
    padding: 25px;
    justify-self: stretch;
  }

  section > button {
    align-self: end;
  }

  .yes {
    border-radius: 9px 0 0 9px;
  }

  .no,
  .no_one {
    background: var(--red);
  }

  .no {
    border-radius: 0 9px 9px 0;
  }

  .no_one {
    grid-column: 1 / 3;
  }

  @keyframes showCurtains {
    0% {
      backdrop-filter: blur(0px) saturate(180%);
      background-color: rgba(17, 25, 40, 0);
    }
    50% {
      backdrop-filter: blur(8px) saturate(180%);
      background-color: rgba(17, 25, 40, 0.2);
    }
    100% {
      backdrop-filter: blur(16px) saturate(180%);
      background-color: rgba(17, 25, 40, 0.4);
    }
  }

  @keyframes showQuestion {
    0% {
      opacity: 0;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }
</style>
