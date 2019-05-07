var SMB2Message = require('../tools/smb2-message');
var message = require('../tools/message');
var FILE_OVERWRITE_IF = require('../structures/constants').FILE_OVERWRITE_IF;

module.exports = message({
  generate: function(connection, params) {
    var buffer = Buffer.from(params.path, 'ucs2');
    var createDisposition = params.createDisposition;

    /* See: https://msdn.microsoft.com/en-us/library/cc246502.aspx
       6 values for CreateDisposition. */
    if (!(createDisposition >= 0 && createDisposition <= 5)) {
      createDisposition = FILE_OVERWRITE_IF;
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
        /**
         * https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/77b36d0f-6016-458a-a7a0-0f4a72ae1534
         * DesiredAccess is construction of : SYNCHRONIZE, DELETE, READ_CONTROL, WRITE_DAC, FILE_WRITE_ATTRIBUTES, FILE_READ_ATTRIBUTES, FILE_DELETE_CHILD, FILE_WRITE_EA, FILE_READ_DATA, FILE_WRITE_DATA, FILE_APPEND_DATA, FILE_READ_EA
         */
        DesiredAccess: 0x001701df,
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
