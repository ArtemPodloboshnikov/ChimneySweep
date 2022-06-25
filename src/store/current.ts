import { Writable, writable } from "svelte/store";

export type Current = {
    dependent: string,
    file: string,
    deleted: string[]
}

export const current: Writable<Current> = writable( {
    dependent: '',
    file: '',
    deleted: []
});