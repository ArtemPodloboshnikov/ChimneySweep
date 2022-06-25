export type TreeDocument = {
    name: string,
    parent: string,
    path: string
}

export type Tree = {
    folders: TreeDocument[],
    files: TreeDocument[]
}