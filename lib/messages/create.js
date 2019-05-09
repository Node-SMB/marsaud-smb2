var SMB2Message = require('../tools/smb2-message');
var message = require('../tools/message');
var constants = require('../structures/constants');

const desiredAccess =
  constants.DELETE |
  constants.FILE_APPEND_DATA |
  constants.FILE_DELETE_CHILD |
  constants.FILE_READ_ATTRIBUTES |
  constants.FILE_READ_DATA |
  constants.FILE_READ_EA |
  constants.FILE_WRITE_ATTRIBUTES |
  constants.FILE_WRITE_DATA |
  constants.FILE_WRITE_EA |
  constants.READ_CONTROL |
  constants.SYNCHRONIZE |
  constants.WRITE_DAC;

module.exports = message({
  generate: function(connection, params) {
    var buffer = Buffer.from(params.path, 'ucs2');
    var createDisposition = params.createDisposition;

    /* See: https://msdn.microsoft.com/en-us/library/cc246502.aspx
       6 values for CreateDisposition. */
    if (!(createDisposition >= 0 && createDisposition <= 5)) {
      createDisposition = constants.FILE_OVERWRITE_IF;
    }

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
        FileAttributes: 0x00000080,
        ShareAccess: 0x00000000,
        CreateDisposition: createDisposition,
        CreateOptions: 0x00000044,
        NameOffset: 0x0078,
        CreateContextsOffset: 0x007a + buffer.length,
      },
    });
  },
});
