const { createReadStream, readdirSync, readFileSync, statSync, lstat } = require('fs');
const path = require('path');

module.exports = function pinFromFS(client, sourcePath, options) {
    return new Promise((resolve, reject) => {
        lstat(sourcePath, (err, stats) => {
            if (err) reject(err);

            if (stats.isFile()) {
                //we need to create a single read stream instead of reading the directory recursively
                const readableStream = createReadStream(sourcePath);

                client.pinFileToIPFS(readableStream, options)
                    .then(resolve)
                    .catch(reject);
            } else {
                const getAllFiles = (dir) => {
                    let results = [];

                    results.push(({
                        path: dir.replace(/\\/g, '/'),
                        mtime: statSync(dir).mtime
                    }));

                    const list = readdirSync(dir);

                    list.forEach((file) => {
                        const newPath = path.resolve(dir, file);

                        const stat = statSync(newPath);

                        if (stat && stat.isDirectory()) {
                            /* Recurse into a subdirectory */
                            results = results.concat(getAllFiles(newPath));
                        } else {
                            /* Is a file */
                            results.push({
                                path: newPath.replace(/\\/g, '/'),
                                content: readFileSync(newPath),
                                mtime: stat.mtime
                            });
                        }
                    });

                    return results;
                };

                const files = getAllFiles(sourcePath);

                client.pinFolderToIPFS(files, options)
                    .then(resolve)
                    .catch(reject);
            }
        });
    });
};
