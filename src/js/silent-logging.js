
/**
 * Silent logging utility - allows only entry points logs
 */

// Store original console methods
const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn
};

// Override all console methods to filter for entry points only
window.console = {
    log: function(message) {
        if (typeof message === 'string' && message.toLowerCase().includes('entry points')) {
            originalConsole.log(message);
        }
    },
    error: function(message) {
        if (typeof message === 'string' && message.toLowerCase().includes('entry points')) {
            originalConsole.error(message);
        }
    },
    warn: function(message) {
        if (typeof message === 'string' && message.toLowerCase().includes('entry points')) {
            originalConsole.warn(message);
        }
    },
    // Silent for all other methods
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

// Log that we're allowing entry points logs
originalConsole.log('Silent logging enabled - Only Entry Points logs will appear');
