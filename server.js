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
    res.setHeader('X-Powered-By', 'borschik');
    res.setHeader('Content-Type', 'text/plain');

    var fullpath = PATH.normalize(url_parse(req.url).pathname);
    var tech = ext2tech[PATH.extname(fullpath)];
    if (!tech) {
        res.statusCode = 501;
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
            res.setHeader('Content-type', tech[1]);
            BORSCHIK({
                input: fullpath,
                output: res,
                tech: tech[0],
                minimize: false,
                freeze: false
            }).then(null, function(e) {
                console.log(e);
                res.end('error');
            });
        } else {
            res.statusCode = 404;
            res.end('Not file');
        }
    });
}).listen(8055, '127.0.0.1');
