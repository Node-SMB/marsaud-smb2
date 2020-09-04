var convert = require('./convert_time');
var BigInt = require('./bigint');

module.exports = function(file) {
  return {
    birthtime: convert(BigInt.fromBuffer(file.CreationTime).toNumber()),
    atime: convert(BigInt.fromBuffer(file.LastAccessTime).toNumber()),
    mtime: convert(BigInt.fromBuffer(file.LastWriteTime).toNumber()),
    ctime: convert(BigInt.fromBuffer(file.ChangeTime).toNumber()),
    size: BigInt.fromBuffer(file.AllocationSize).toNumber(),
    isDirectory: function() {
      return BigInt.fromBuffer(file.FileAttributes).toNumber() === 16;
    },
  };
};
