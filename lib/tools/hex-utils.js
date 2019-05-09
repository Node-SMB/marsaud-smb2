module.exports = function hexTo0xFormat(value) {
  var hexLength = 8;
  for (var i = value.length; i < hexLength; i++) {
    value = 0 + value;
  }
  return '0x' + value;
};
