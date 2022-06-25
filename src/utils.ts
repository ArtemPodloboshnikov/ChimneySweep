export async function isFile(path: string): Promise<boolean> {
    //@ts-ignore
    return await window.electronAPI.documentOrientation(path, false);
}

export async function isDirectory(path: string): Promise<boolean> {
    //@ts-ignore
    return await window.electronAPI.documentOrientation(path, true);
}