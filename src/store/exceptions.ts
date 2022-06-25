import { Writable, writable } from "svelte/store";

export const exceptions: Writable<string[]> = writable([]);