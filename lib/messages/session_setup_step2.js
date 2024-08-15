var SMB2Message = require('../tools/smb2-message');
var message = require('../tools/message');
var ntlm = require('../tools/ntlm');

module.exports = message({
  generate: function(connection) {
    return new SMB2Message({
      headers: {
        Command: 'SESSION_SETUP',
        SessionId: connection.SessionId,
        ProcessId: connection.ProcessId,
      },
      request: {
        Buffer: ntlm.createType3(connection.nonce,connection),
      },
    });
  },
});
