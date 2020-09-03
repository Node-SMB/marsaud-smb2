var BigInt = require('../tools/bigint');
var convert = require('../tools/convert_time');
var request = require('../tools/smb2-forge').request;

module.exports = function stat(path, cb) {
  var connection = this;
  request('open', { path: path }, connection, function(err, file) {
    if (err != null) {
      return cb(err);
    }
    request('close', file, connection, function() {
      cb(null, {
        CreationTime: convert(BigInt.fromBuffer(file.CreationTime).toNumber()),
        LastAccessTime: convert(
          BigInt.fromBuffer(file.LastAccessTime).toNumber()
        ),
        LastWriteTime: convert(
          BigInt.fromBuffer(file.LastWriteTime).toNumber()
        ),
        ChangeTime: convert(BigInt.fromBuffer(file.ChangeTime).toNumber()),
        size: BigInt.fromBuffer(file.AllocationSize).toNumber(),
        isDirectory: function() {
          return BigInt.fromBuffer(file.FileAttributes).toNumber() === 16;
        },
      });
    });
  });
};
