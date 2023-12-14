var SMB2Message = require('../tools/smb2-message');
var message = require('../tools/message');
var constants = require('../structures/constants');

var desiredAccess =
  constants.DELETE |
  constants.FILE_APPEND_DATA |
  constants.FILE_READ_ATTRIBUTES |
  constants.FILE_READ_DATA |
  constants.FILE_READ_EA |
  constants.FILE_WRITE_ATTRIBUTES |
  constants.FILE_WRITE_DATA |
  constants.FILE_WRITE_EA |
  constants.READ_CONTROL |
  constants.SYNCHRONIZE;

module.exports = message({
  generate: function(connection, params) {
    var buffer = Buffer.from(params.path, 'ucs2');

    return new SMB2Message({
      headers: {
        Command: 'CREATE',
        SessionId: connection.SessionId,
        TreeId: connection.TreeId,
        ProcessId: connection.ProcessId,
      },
      request: {
        Buffer: buffer,
        DesiredAccess: desiredAccess,
        FileAttributes: 0x00000000,
        ShareAccess: 0x00000000,
        CreateDisposition: constants.FILE_CREATE,
        CreateOptions: 0x00000021,
        NameOffset: 0x0078,
        CreateContextsOffset: 0x007a + buffer.length,
      },
    });
  },
});
