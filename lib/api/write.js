var assert = require('assert');

var BigInt = require('../tools/bigint');
var request = require('../tools/smb2-forge').request;
var MAX_WRITE_LENGTH = require('../structures/constants').MAX_WRITE_LENGTH;

module.exports = function write(file, buffer, offset, length, start, cb) {
  assert(Buffer.isBuffer(buffer));
  if (offset == null) {
    offset = 0;
  } else {
    assert.strictEqual(typeof offset, 'number');
    assert(offset > 0);
    assert(offset < buffer.length);
  }
  if (length == null) {
    length = buffer.length - offset;
  } else {
    assert.strictEqual(typeof length, 'number');
    assert(length > 0);
    length = Math.min(length, buffer.length - offset);
  }
  assert.strictEqual(typeof start, 'number');

  var connection = this;
  var pos = start;
  var chunkLength;

  function onWrite(err) {
    if (err != null) {
      return cb(err, pos - start, buffer);
    }

    offset += chunkLength;
    pos += chunkLength;

    writeChunk();
  }
  function writeChunk() {
    if (length <= 0) {
      cb(null, pos - start, buffer);
    }

    chunkLength = Math.min(MAX_WRITE_LENGTH, length);
    request(
      'write',
      {
        Buffer: buffer.slice(offset, offset + chunkLength),
        FileId: file.FileId,
        Offset: new BigInt(8, pos).toBuffer(),
      },
      connection,
      onWrite
    );
  }

  process.nextTick(writeChunk);
};
