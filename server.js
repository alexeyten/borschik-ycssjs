#!/usr/bin/env node

var HTTP = require('http');
var PATH = require('path');
var QFS = require('q-io/fs');
var BORSCHIK = require('borschik').api;
var url_parse = require('url').parse;

var ext2tech = {
    '.css': ['css-fast', 'text/css'],
    '.js': ['lib/tech-ycssjs-js', 'application/x-javascript']
}

HTTP.createServer(function (req, res) {
    var fullpath = PATH.normalize(url_parse(req.url).pathname);
    var tech = ext2tech[PATH.extname(fullpath)];
    if (!tech) {
        res.writeHead(501, {'Content-Type': 'text/plain'});
        res.end('Not implemented.');
        return;
    }
    var dirname = PATH.dirname(fullpath);
    var filename = PATH.basename(fullpath);
    if (/^_/.test(filename)) {
        fullpath = PATH.join(dirname, filename.replace(/^_/, ''));
    }
    QFS.isFile(fullpath).then(function(is_file) {
        if (is_file) {
            console.log(fullpath);
            res.writeHead(200, {'Content-Type': tech[1]});
            res.write('');
            res.write('');
            BORSCHIK({
                input: fullpath,
                output: res,
                tech: tech[0],
                minimize: false,
                freeze: true
            }).then(function() {
                res.write('xx');
                res.end();
            }, function(e) {
                res.write('error');
                console.log(e);
                res.end();
            });
        } else {
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.write('Not file');
            res.end();
        }
    });
}).listen(8055, '127.0.0.1');
