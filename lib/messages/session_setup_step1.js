var SMB2Message = require('../tools/smb2-message');
var message = require('../tools/message');
var ntlm = require('../tools/ntlm');

module.exports = message({
  generate: function(connection) {
    return new SMB2Message({
      headers: {
        Command: 'SESSION_SETUP',
        ProcessId: connection.ProcessId,
      },
      request: {
        Buffer: ntlm.createType1(connection.domain,connection.ip),
      },
    });
  },

  successCode: 'STATUS_MORE_PROCESSING_REQUIRED',

  onSuccess: function(connection, response) {
    var h = response.getHeaders();
    connection.SessionId = h.SessionId;
    connection.nonce = ntlm.parseType2(response.getResponse().Buffer);
  },
});
