/**
 * Structured logging utility for CloudWatch
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL || 'INFO'];

function log(level, message, data = {}) {
  if (LOG_LEVELS[level] <= currentLevel) {
    const logEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...data
    };
    
    const output = JSON.stringify(logEntry);
    
    if (level === 'ERROR') {
      console.error(output);
    } else if (level === 'WARN') {
      console.warn(output);
    } else {
      console.log(output);
    }
  }
}

function error(message, data = {}) {
  log('ERROR', message, data);
}

function warn(message, data = {}) {
  log('WARN', message, data);
}

function info(message, data = {}) {
  log('INFO', message, data);
}

function debug(message, data = {}) {
  log('DEBUG', message, data);
}

module.exports = {
  error,
  warn,
  info,
  debug,
};
