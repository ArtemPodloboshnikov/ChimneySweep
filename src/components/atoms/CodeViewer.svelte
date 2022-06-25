<script lang="ts">
  export let text: string | string[];
  const isBrTag = (str: string) => {
    return new RegExp("_<br>_", "gm").test(str);
  };

  const getArrayLines = (str: string) => {
    let words: string[] = [];
    let word: string[] = [];
    let space: string[] = [];
    for (let char of str) {
      if (char === " ") {
        if (word.length !== 0) {
          words.push(word.join(""));
          word = [];
        }
        space.push(char);
      } else if (char !== " " && char !== "") {
        if (space.length !== 0) {
          words.push(space.join(""));
          space = [];
        }
        word.push(char);
      }
    }

    if (word.length !== 0) {
      words.push(word.join(""));
    } else if (space.length !== 0) {
      words.push(space.join(""));
    }

    let line = "";
    let lines: string[] = [];
    for (let w of words) {
      if (!isBrTag(w)) {
        line += w;
      } else {
        lines.push(line);
        line = "";
      }
    }

    if (line !== "") {
      lines.push(line);
    }

    return lines;
  };
</script>

{#if !Array.isArray(text)}
  {#each getArrayLines(text) as line, index}
    {#if index !== getArrayLines(text).length - 1}
      {line}<br />
    {:else}{line}{/if}
  {/each}
{:else if text.length === 3}
  {#each getArrayLines(text[0]) as line, index}
    {#if index !== getArrayLines(text[0]).length - 1}
      {line}<br />
    {:else}{line}{/if}{/each}{@html text[1]}<svelte:self text={text[2]} />
{/if}
<!-- The structure above is due to the fact that spaces are displayed between the keyword and the rest of the test.
  This happens because spaces are escaped in the code itself.
  So I removed the indents in the code itself to get rid of extra spaces  -->
