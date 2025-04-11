"use strict";
var winston = require('winston');
var moment = require('moment-timezone');
var winstonRotator = require('winston-daily-rotate-file');
winston.emitErrs = true;
var createLogger = new winston.Logger({
    exitOnError: false,
});
var errorLogger = createLogger;
errorLogger.add(winstonRotator, {
    name: 'logger-file',
    filename: './Logs/view.server',
    json: false,
    datePattern: '.log',
    prepend: false,
    maxFiles: '30d',
    formatter: function (options) {
        const dbtimezone = process.env.TIMEZONE;
        return ((options.level == 'info' || options.level == 'debug' ? '[DEBUG]' : '[ERROR]') +
            `[${moment().tz(dbtimezone).format('YY/MM/DD:HH:mm:ss,SSS')}]` +
            '\t' +
            ' ' +
            (undefined !== options.message ? options.message : '') +
            '\n' +
            (options.meta && Object.keys(options.meta).length ? escapeSpecialChars(JSON.stringify(options.meta)) : ''));
    },
});
function escapeSpecialChars(str) {
    return str.replace(/\\r/g, '\r').replace(/\\n/g, '\n').replace(/\\t/g, '\t');
}
module.exports = {
    errorlog: errorLogger,
};
//# sourceMappingURL=logger_controller.js.map