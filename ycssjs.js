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
        .end()
    .opt()
        .name('minimize').title('Minimize resulting content (default: yes)')
        .short('m').long('minimize')
        .end()
    .opt()
        .name('tech') .title('Technology')
        .short('t').long('tech')
        .end()
    .opt()
        .name('base') .title('Base dir')
        .short('b').long('base')
        .end()
    .arg()
        .name('file')
        .title('Files to process')
        .req()
        .arr()
        .end()
    .act(function(opts, args) {
        var optsTech = opts.tech;
        args.file.forEach(function(file) {
            opts.tech = optsTech || ext2tech[PATH.extname(file)];
            if (!opts.tech) {
                console.log("skip '" + file + "'. Unknown tech");
                return;
            }
            var outname = opts.output = PATH.dirname(file) + '/_' + PATH.basename(file);
            opts.input = file;
            BORSCHIK(opts)
                .then(null, function(e) {
                    console.log("error '" + file + "'. Error message: " + e.message);
                    FS.unlink(outname);
                });
        });
    });

if (require.main === module) {
    exports.run();
}
