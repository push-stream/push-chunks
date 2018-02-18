
var BufferList = require('bl')

module.exports = Chunks

function Chunks (header, body) {
  this.bl = new BufferList()
  this.paused = false
  this.ended = false
  this._header = header
  this._body = body
  this.header = true
}

Chunks.prototype.write = function (data) {
  this.bl.append(data)
  if(!this.sink || this.sink.paused) return
  this.resume()
}

Chunks.prototype.end = function (err) {
  this.ended = err || true
  if(err && err !== true && this.sink)
    this.sink.end(err)
  else
    this.resume()
}

Chunks.prototype.resume = function () {
  if(!this.sink) return
  var h
  while(!this.ended && (h = this._header(this.bl)) && !this.sink.paused) {
    var value = this._body(this.bl)
    if(value !== undefined) this.sink.write(value)
    else {
      this.ended = true
      this.sink.end()
      if(this.source) this.source.abort()
    }
  }
  if(this.ended && this.sink && !this.sink.ended)
    this.sink.end(this.ended === true ? null : this.ended)

  if(!h && this.source) this.source.resume()
}

Chunks.prototype.abort = function (err) {
  this.source.abort(this.ended = err)
}

Chunks.prototype.pipe = require('push-stream/pipe')

