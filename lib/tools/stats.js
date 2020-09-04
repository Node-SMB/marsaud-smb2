var convert = require('./convert_time');
var BigInt = require('./bigint');

module.exports = function(file) {
  return {
    birthtime: convert(BigInt.fromBuffer(file.CreationTime).toNumber()),
    atime: convert(BigInt.fromBuffer(file.LastAccessTime).toNumber()),
    mtime: convert(BigInt.fromBuffer(file.LastWriteTime).toNumber()),
    ctime: convert(BigInt.fromBuffer(file.ChangeTime).toNumber()),
    size: BigInt.fromBuffer(file.EndofFile).toNumber(),
    isDirectory: function() {
      if (typeof file.FileAttributes === 'number')
        return file.FileAttributes === 16;
      return BigInt.fromBuffer(file.FileAttributes).toNumber() === 16;
    },
  };
};
