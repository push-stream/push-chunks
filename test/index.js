var Chunks = require('../')
var test = require('tape')

function Output() {
  return {
    paused: false,
    buffer: [],
    write: function (d) {
      this.buffer.push(d)
    },
    end: function () {
      this.ended = true
    }
  }
}

test('even chunks', function (t) {
  var chunks = new Chunks(function header (bl) {
    return bl.length > 10
  }, function body (bl) {
    var buffer = bl.slice(0, 10)
    bl.consume(10)
    console.log(buffer)
    return buffer
  })

  var output = Output()
  chunks.pipe(output)

  for(var i = 0; i < 10; i++) {
    var l = ~~(Math.random()*10)
    var b = new Buffer(l)
    b.fill(l)
    chunks.write(b)
  }

  output.buffer.forEach(function (e) {
    t.equal(e.length, 10)
  })
  t.ok(output.buffer.length > 0)

  t.end()
})

test('even chunks, pipe', function (t) {
  var chunks = new Chunks(function header (bl) {
    return bl.length > 10
  }, function body (bl) {
    var buffer = bl.slice(0, 10)
    bl.consume(10)
    console.log(buffer)
    return buffer
  })

  for(var i = 0; i < 10; i++) {
    var l = ~~(Math.random()*10)
    var b = new Buffer(l)
    b.fill(l)
    chunks.write(b)
  }

  var output = Output()
  chunks.pipe(output)

  output.buffer.forEach(function (e) {
    t.equal(e.length, 10)
  })

  t.ok(output.buffer.length > 0)

  t.end()
})

test('length delimited', function (t) {
  var chunks = new Chunks(function header (bl) {
    return bl.length >= 2 && bl.length >= 2 + bl.readUInt16BE(0)
  }, function body (bl) {
    var length = bl.readUInt16BE(0)
    if(!length) return //signal end
    var buffer = bl.slice(2, 2+length)
    bl.consume(2+length)
    return buffer
  })

  for(var i = 0; i < 10; i++) {
    var l = ~~(Math.random()*10) + 1
    var b = new Buffer(l)
    b.fill(l)
    chunks.write(Buffer.concat([new Buffer([0, l]), b]))
  }
  chunks.write(new Buffer([0, 0]))

  var output = Output()
  chunks.pipe(output)

  output.buffer.forEach(function (e) {
    t.equal(e.length, e[0])
  })

  t.ok(output.buffer.length > 0)
  console.log(output.buffer)
  t.ok(output.ended)
  t.end()
})

