import { Writable, writable } from "svelte/store";

export type FileCheck = {
    name: string,
    path: string
}

export const filesCheckReset: FileCheck[] = [];

export const filesCheck: Writable<FileCheck[]> = writable(filesCheckReset);