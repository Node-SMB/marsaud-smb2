/*
Wrapper to allow diff ntlm packages but still accept and return Buffer as node-smb2 expects.  
httpntlm expects strings, but supports ntlm v2 and will negotiate between either
*/
var ntlm = require('httpntlm').ntlm;

function parsehttpntlmMsg(msg) {
  var match = msg.match(/NTLM (.+)?/);
	if(!match || !match[1]) {
		return null;
	}

	return Buffer.from(match[1], 'base64');
}

var proto = {}

proto.createType1 = function(domain, workstation) {
  var options = {
  	domain: domain,
  	workstation: workstation
  };
  var msg = ntlm.createType1Message(options);
  return parsehttpntlmMsg(msg);
};

proto.parseType2 = function(rawbuf) {
  var rsp = rawbuf.toString('base64');
  rsp = 'NTLM ' + rsp;
  var msg = ntlm.parseType2Message(rsp,console.log);
  return msg;
};
  
proto.createType3 = function(challengeNonce, options) {
  if(!options.workstation) {
  	options.workstation = options.ip;
  }

/* options to httpntlm
	if(!options.domain) options.domain = '';
	if(!options.workstation) options.workstation = '';
	if(!options.username) options.username = '';
	if(!options.password) options.password = '';
*/
  var msg = ntlm.createType3Message(challengeNonce, options);
	return parsehttpntlmMsg(msg);
};

module.exports = proto;
