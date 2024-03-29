const fs = require('fs-extra');
const concat = require('concat');
const path = require('path');
const buildFolder = `./build/static/`;
const componentBuildFolder = 'componentLibrary';
const componentBuiltFile = 'components';
function fromDir(startPath, filter) {
    var _files = [];
    console.log(startPath);
    if (!fs.existsSync(startPath)) {
        console.log("Wrong Folder Path!", startPath);
        return;
    }
    var files = fs.readdirSync(startPath);
    for (var i = 0; i < files.length; i++) {
        var filename = path.join(startPath,files[i]);
        if (filename.endsWith(filter)) {
            _files.push(filename);
            console.log('-- found: ', filename);
        };
    }
    return _files;
};

(async function build() {

    const js_files = fromDir(`${buildFolder}/js`,'.js');

    const css_files = fromDir(`${buildFolder}/css`,'.css');

    await fs.ensureDir(componentBuildFolder);

    await fs.removeSync(`${componentBuildFolder}/${componentBuiltFile}.js`);
    await fs.removeSync(`${componentBuildFolder}/${componentBuiltFile}.css`);

    await concat(js_files, `${componentBuildFolder}/${componentBuiltFile}.js`);
    await concat(css_files, `${componentBuildFolder}/${componentBuiltFile}.css`);
})();
