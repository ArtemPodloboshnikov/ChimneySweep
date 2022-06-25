<script lang="ts">
  import { afterUpdate } from "svelte";

  import { current } from "../../store/current";
  import { currentFolder } from "../../store/currentFolder";
  import { exceptions } from "../../store/exceptions";
  import CodeViewer from "../atoms/CodeViewer.svelte";

  $: text = [""];
  const spanRegExp = "<span class='attention'[^>]*>(.+?)</span>";
  $: isException = () =>
    $exceptions.filter((exc) => new RegExp(exc).test($current.file)).length !==
    0;

  const toggleException = () => {
    if (isException()) {
      $exceptions = $exceptions.filter((exc) => $current.file !== exc);
    } else {
      $exceptions = [...$exceptions, $current.file];
    }
  };

  const getSpanAttention = (str: string) => {
    if (str) {
      const res = str.match(new RegExp(spanRegExp, "m"));
      const dependent = res ? res[0] : "";
      if (dependent) {
        const index = str.indexOf(dependent);
        const left_str = Array.from(str)
          .map((char, i) => (i < index ? char : undefined))
          .filter(Boolean)
          .join("");
        const right_str = Array.from(str)
          .map((char, i) =>
            i >= (left_str + dependent).length ? char : undefined
          )
          .filter(Boolean)
          .join("");
        return [left_str, dependent, getSpanAttention(right_str)];
      }

      return str;
    }
    return [];
  };

  $: current.subscribe((value) => {
    const filePath = value.file;

    if (filePath !== "") {
      $currentFolder.files.forEach((file) => {
        if (file.path === filePath) {
          for (let dep_index in file.dependents) {
            if (file.dependents[dep_index] === $current.dependent) {
              const data = file.datas[dep_index].replaceAll("\n", " _<br>_ ");
              text = getSpanAttention(data);
              break;
            }
          }
        }
      });
    } else {
      text = [""];
    }
  });

  afterUpdate(() => {
    const code = document.getElementsByTagName("code")[0];
    const lines = document.getElementsByClassName("lines")[0];
    if (code && lines) {
      const scrollLine = (e) => {
        lines.scrollTo(0, code.scrollTop);
      };
      code.addEventListener("scroll", scrollLine);

      return () => code.removeEventListener("scroll", scrollLine);
    }
  });
</script>

<section>
  {#if text.length > 1}
    <button on:click={toggleException}>
      {isException() ? "Remove from exceptions" : "Add to exception"}
    </button>
    <div class="viewer">
      <span class="lines">
        {#each text.join(" ").split("<br>") as str, line}
          {++line}
          <br />
        {/each}
      </span>
      <code>
        <CodeViewer {text} />
      </code>
    </div>
  {/if}
</section>

<style>
  section {
    grid-column: span 3;
    display: flex;
    flex-direction: column;
    overflow-y: hidden;
  }

  section > button {
    border-radius: 9px 9px 0 0;
  }

  code,
  .lines {
    font-size: 15px;
    line-height: 1.47;
  }

  code {
    white-space: nowrap;
    overflow-x: auto;
    overflow-y: auto;
    height: 100%;
  }

  .lines {
    color: var(--grey);
    text-align: center;
    overflow: hidden;
  }

  .viewer {
    display: grid;
    grid-template-columns: 10% 90%;
    grid-template-rows: 98%;
    padding: 20px;
    overflow-y: hidden;
  }

  :global(.attention) {
    color: var(--yellow);
  }
</style>
