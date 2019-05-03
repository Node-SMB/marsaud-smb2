var assert = require('assert');

var request = require('../tools/smb2-forge').request;
var MAX_WRITE_LENGTH = require('../structures/constants').MAX_WRITE_LENGTH;

module.exports = function truncate(path, length) {
  if (length == null) {
    length = 0;
  } else {
    assert.strictEqual(typeof length, 'number');
  }

  var connection = this;
  var chunkLength;

  function onTruncate(err) {
    if (err != null) {
      return cb(err, path, length);
    }

    length -= chunkLength;

    truncateChunkk();
  }
  function truncateChunk() {
    if (length <= 0) {
      cb(null, length);
    }

    chunkLength = Math.min(MAX_WRITE_LENGTH, length);
    request(
      'truncate',
      {
        path,
        length,
      },
      connection,
      onTruncate
    );
  }

  process.nextTick(truncateChunk);
};
