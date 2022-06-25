import { Writable, writable } from "svelte/store";

export type File = {
    path: string,
    datas: string[],
    dependents: string[]
}

type CurrentFolder = {
    name: string,
    files: File[],
}

export const currentFolderReset: CurrentFolder = {
    name: '',
    files: [{path: '', datas: [], dependents: []}]
}

export const currentFolder: Writable<CurrentFolder> = writable(currentFolderReset);