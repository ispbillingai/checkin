
/**
 * Silent logging utility - completely disables all console output
 */

// Override all console methods to do nothing
window.console = {
  log: function() {},
  error: function() {},
  warn: function() {},
  info: function() {},
  debug: function() {},
  trace: function() {},
  group: function() {},
  groupEnd: function() {},
  groupCollapsed: function() {},
  time: function() {},
  timeEnd: function() {},
  timeLog: function() {},
  assert: function() {},
  clear: function() {},
  count: function() {},
  countReset: function() {},
  dir: function() {},
  dirxml: function() {},
  exception: function() {},
  profile: function() {},
  profileEnd: function() {},
  table: function() {},
  timeStamp: function() {}
};

// Add this script to all pages to ensure no logs are produced
