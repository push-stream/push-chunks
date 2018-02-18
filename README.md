# push-chunks

push-chunks allows you implement binary parsers in a few lines

## example

suppose we want a stream of length delimited blocks.

``` js
var chunks = new Chunks(function header (bl) {

  //check if there isn't enough input to read the header
  if(bl.length < header_length) return

  //check if there is enough input to read the body
  if(bl.readUInt32BE(0) < bl.length) return

  //we are good! go to the body
  return true
}, function body (bl) {
  var length = bl.readUInt32BE(0)

  //if the length is zero, return undefined to signal end.
  if(!length) return

  //else slice the content and return!
  var buffer = bl.slice(4, 4+length)
  bl.consume(4)
  return buffer
}

source.pipe(chunks).pipe(sink)
```

## api: new Chunks (header(bl) => boolean, body (bl) => *)

`header` and `body` take the [buffer-list](https://npm.im/bl) which is holding
the buffers written to this stream. If `header` returns true, then `body` is called.
If body returns `undefined` the stream is ended. If body returns anything else
it's written to the streams sink.

## License

MIT


