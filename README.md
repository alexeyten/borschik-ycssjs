# borschik-ycssjs

This is rough replacement for `ycssjs`.

## Command line

Command `bycssjs` tries mimic original `ycssjs`.

Run `bycssjs -h` for help on arguments.

## Server

`server.js` builds files on the fly. It expects pathname of URI to be full path.

Sample nginx config:

```
...
location ~* "\.(css|js)$" {
    proxy_pass http://127.0.0.1:8055$document_root$request_uri;
}
...
```

By default server listen port 8055 on localhost.
