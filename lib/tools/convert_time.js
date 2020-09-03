module.exports = function convert(time) {
  var winTicks = 10000000;
  var uEpoch = 11644473600;
  var unixTime = time / winTicks - uEpoch;
  return new Date(unixTime * 1000);
};
