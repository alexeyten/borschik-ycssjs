#!/usr/bin/env node

var PATH = require('path');
var FS = require('fs');

var BORSCHIK = require('borschik').api;

var ext2tech = {
    '.css': 'css',
    '.js': 'ycssjs/js',
}

var name = PATH.basename(process.argv[1]);

exports = require('coa').Cmd()
    .name(name)
    .title(name + ' - replacement for ycssjs')
    .helpful()
    .opt()
        .name('version') .title('Version')
        .short('v').long('version')
        .flag()
        .only()
        .act(function() { return 'Version: ' + require('./package.json').version })
        .end()
    .opt()
        .name('freeze').title('Freeze links to static files (default: yes)')
        .short('f').long('freeze')
        .def(true)
        .val(function(v) {
            return stringToBoolean(v, true);
        })
        .end()
    .opt()
        .name('minimize').title('Minimize resulting content (default: yes)')
        .short('m').long('minimize')
        .def(true)
        .val(function(v) {
            return stringToBoolean(v, true);
        })
        .end()
    .arg()
        .name('file')
        .title('Files to process')
        .req()
        .arr()
        .end()
    .act(function(opts, args) {
        args.file.forEach(function(file) {
            var tech = ext2tech[PATH.extname(file)];
            if (!tech) {
                console.log("skip '" + file + "'. Unknown tech");
                return;
            }
            var outname = PATH.dirname(file) + '/_' + PATH.basename(file);
            BORSCHIK({
                input: file,
                output: outname,
                tech: tech,
                minimize: opts.minimize,
                freeze: opts.freeze
            }).then(null, function(e) {
                console.log("error '" + file + "'. Error message: " + e.message);
                FS.unlink(outname);
            });
        });
    });

function stringToBoolean(s, def) {
    if (typeof s === 'boolean') return s;
    if (s == 'yes' || s == 'true') return true;
    if (s == 'no' || s == 'false') return false;
    return !!def;
};

if (require.main === module) {
    exports.run();
}
