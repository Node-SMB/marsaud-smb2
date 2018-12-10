var Writable = require('stream').Writable;

var BigInt = require('../tools/bigint');
var constants = require('../structures/constants');
var parseFlags = require('../tools/parse-flags');
var request = require('../tools/smb2-forge').request;

module.exports = function createWriteStream(path, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  var connection = this;

  var fd = options.fd;
  var isFd = fd != null;
  var shouldClose = !isFd || (options.autoClose == null || options.autoClose);

  function onCreate(err, file) {
    if (err != null) {
      return cb(err);
    }

    var offset = new BigInt(8, (options != null && options.start) || 0);

    function write(buffer, i, cb) {
      var j = i + constants.MAX_WRITE_LENGTH;
      var chunk = buffer.slice(i, j);
      request(
        'write',
        {
          Buffer: chunk,
          FileId: file.FileId,
          Offset: offset.toBuffer(),
        },
        connection,
        function(err) {
          if (err != null) {
            return cb(err);
          }
          offset = offset.add(chunk.length);
          if (j < buffer.length) {
            return write(buffer, j, cb);
          }
          cb();
        }
      );
    }

    var stream = new Writable();
    if (shouldClose) {
      var close = request.bind(undefined, 'close', file, connection);
      stream._destroy = function(err, cb) {
        close(function(err2) {
          if (err2 != null) {
            return cb(err2);
          }
          cb(err);
        });
      };
      stream._final = close;
    }
    stream._write = function(chunk, encoding, next) {
      write(
        Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding),
        0,
        next
      );
    };
    cb(null, stream);
  }

  if (isFd) {
    onCreate(null, fd);
  } else {
    request(
      'create',
      {
        createDisposition: parseFlags(
          (options != null && options.flags) || 'wx'
        ),
        path: path,
      },
      connection,
      onCreate
    );
  }
};
