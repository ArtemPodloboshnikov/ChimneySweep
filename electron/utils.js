const fs = require('fs');
const { join } = require('path');
const { shell } = require('electron');

function getFileStructure(event, currentDirPath) {
    let files = [];
    if (currentDirPath !== undefined) {
        fs.readdirSync(currentDirPath).forEach(name => {
            let filePath = join(currentDirPath, name);
            let stat = fs.statSync(filePath);
            if (stat.isFile()) {
                files.push(filePath.split('\\').join('/'));
            } else if (stat.isDirectory()) {
                files = [...files, ...getFileStructure(event, filePath)];
            }
        });
        return files;
    }
}

function searchDependencies(event, dependentFile, folderFiles) {
    let datas = [];
    let dependentFiles = [];
    let dependent = dependentFile.split('/');
    dependent = dependent[dependent.length - 1];
    let regexpDependent = `(\\/|"|'){1}${dependent.replaceAll('.', '\\.')}`;
    let regexp = new RegExp(regexpDependent, 'gm');
    folderFiles.forEach(file => {
        const data = fs.readFileSync(file, 'utf8');
        const isDependent = regexp.test(data);
        if (isDependent) {
            regexpDependent = `${dependent.replaceAll('.', '\\.')}`;
            regexp = new RegExp(regexpDependent, 'gm');
            const new_data = data.replaceAll(regexp, `<span class='attention'>${dependent}</span>`);
            datas.push(new_data);
            dependentFiles.push(file);
        }
    })
    return {dependent: dependentFile, datas, dependentFiles};
}

function replaceDataDependent(event, filesPath, dependentPath, oldName, newName, isOnlyFolder) {
    let filesData = [];

    let pathDependentArr = dependentPath.split('/');
    pathDependentArr[pathDependentArr.length - 1] = newName;
    const newDependentPath = pathDependentArr.join('/');

    filesPath.forEach(path => {
        let data = fs.readFileSync(path, 'utf8');
        const new_data = data.replaceAll(oldName, newName);
        fs.writeFileSync(path, new_data);
        data = new_data.replaceAll(new RegExp(newName, 'gm'), `<span class='attention'>${newName}</span>`);
        filesData.push({path, data, dependent: isOnlyFolder ? dependentPath : newDependentPath});
    })
    if (!isOnlyFolder) {
        fs.rename(dependentPath, newDependentPath, err => {
            if(err) throw err;
        });
    }

    return filesData;
}

function deleteDependents(event, dependents) {
    dependents.forEach(dependent => {
        fs.unlinkSync(dependent);
    })
}

function showFileInFileManager(event, filePath) {
    shell.showItemInFolder(filePath.replaceAll('/', '\\'));
}

module.exports = Object.freeze({getFileStructure,
    searchDependencies,
    replaceDataDependent,
    deleteDependents,
    showFileInFileManager
});