#!/usr/bin/env node

var HTTP = require('http');
var PATH = require('path');
var FS = require('fs');
var URL = require('url');

var Q = require('q');
var BORSCHIK = require('borschik').api;

var ext2tech = {
    '.css': ['css', 'text/css'],
    '.js': ['ycssjs/js', 'application/x-javascript']
}

var port = (+process.env.npm_package_config_port) || 8055;
var host = process.env.npm_package_config_host || 'localhost';

HTTP.createServer(function (req, res) {
    res.setHeader('X-Powered-By', 'borschik');
    res.setHeader('Content-Type', 'text/plain');

    var fullpath = PATH.normalize(URL.parse(req.url).pathname);
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

    Q.nfcall(FS.stat, fullpath).then(function(stat) {
        if (stat.isFile()) {
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
            res.statusCode = 403;
            res.end('Not file');
        }
    }, function(err) {
        res.status = 404;
        res.end('Not Found');
    });
}).listen(port, host);
