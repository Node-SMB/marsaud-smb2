// https://stackoverflow.com/questions/6161776/convert-windows-filetime-to-second-in-unix-linux
var winTicks = 10000000;
var uEpoch = 11644473600;
module.exports = function convert(time) {
  var unixTime = time / winTicks - uEpoch;
  return new Date(unixTime * 1000);
};
