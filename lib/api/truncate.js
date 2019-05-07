var SMB2Forge = require('../tools/smb2-forge');
var SMB2Request = SMB2Forge.request;
var BigInt = require('../tools/bigint');
var FILE_WRITE_DATA = require('../structures/constants').FILE_WRITE_DATA;

function setFileSize(file, fileLength, connection, cb) {
  SMB2Request(
    'set_info',
    {
      FileId: file.FileId,
      FileInfoClass: 'FileEndOfFileInformation',
      Buffer: fileLength.toBuffer(),
    },
    connection,
    cb
  );
}

module.exports = function truncate(path, length, cb) {
  var connection = this;

  SMB2Request(
    'open',
    { path: path, desiredAccess: FILE_WRITE_DATA },
    connection,
    function(err, file) {
      if (err != null) {
        return cb(err);
      }

      setFileSize(file, new BigInt(8, length), connection, function(err) {
        SMB2Request('close', file, connection, function() {
          cb(err);
        });
      });
    }
  );
};
