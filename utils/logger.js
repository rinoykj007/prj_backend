// utils/logger.js - Logging utility
const logger = {
  info: (message, ...args) => {
    console.log(message, ...args);
  },
  error: (message, ...args) => {
    console.error(message, ...args);
  },
  warn: (message, ...args) => {
    console.warn(message, ...args);
  },
  debug: (message, ...args) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(message, ...args);
    }
  },
};

module.exports = logger;
