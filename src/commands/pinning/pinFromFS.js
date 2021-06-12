const { createReadStream, readdirSync, readFileSync, statSync, lstatSync } = require('fs');
const path = require('path');

export default function pinFromFS(client, sourcePath, options) {
    return new Promise((resolve, reject) => {
        lstatSync
            .then((stats) => {
                if (stats.isFile()) {
                    //we need to create a single read stream instead of reading the directory recursively
                    const readableStream = createReadStream(sourcePath);

                    client.pinFileToIPFS(readableStream, options)
                        .then(resolve)
                        .catch(reject);
                } else {
                    const getAllFiles = (dirPath, OriginalPath, ArrayOfFiles) => {
                        const files = readdirSync(dirPath);
                        const arrayOfFiles = ArrayOfFiles || [];
                        const originalPath = OriginalPath || path.resolve(dirPath, '..');
                        const folder = path.relative(originalPath, path.join(dirPath, '/'));

                        arrayOfFiles.push({
                            path: folder.replace(/\\/g, '/'),
                            mtime: statSync(folder).mtime
                        });

                        files.forEach(function (file) {
                            if (statSync(dirPath + '/' + file).isDirectory()) {
                                arrayOfFiles = getAllFiles(dirPath + '/' + file, originalPath, arrayOfFiles);
                            } else {
                                file = path.join(dirPath, '/', file);

                                arrayOfFiles.push({
                                    path: path.relative(originalPath, file).replace(/\\/g, '/'),
                                    content: readFileSync(file),
                                    mtime: statSync(file).mtime
                                });
                            }
                        });

                        return arrayOfFiles;
                    };

                    const files = getAllFiles(sourcePath);

                    client.pinFolderToIPFS(files, options)
                        .then(resolve)
                        .catch(reject);
                }
            })
            .catch(reject);
    });
}
