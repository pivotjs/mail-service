"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var _ = require("underscore");
var yaml = require("js-yaml");
var Promise = require("bluebird");
;
var Mailer = (function () {
    function Mailer(transporter) {
        this.transporter = transporter;
    }
    Mailer.prototype.loadYamlMailTemplate = function (filepath) {
        if (fs.existsSync(filepath)) {
            try {
                return yaml.safeLoad(fs.readFileSync(filepath, 'utf8'));
            }
            catch (err) {
            }
        }
        return {};
    };
    Mailer.prototype.prepareMail = function (mailTemplate, templateData) {
        var mailOptions = _.extend({}, mailTemplate);
        _.each(['from', 'subject'], function (key) {
            if (_.isString(mailOptions[key])) {
                mailOptions[key] = _.template(mailOptions[key])(templateData);
            }
        });
        _.each(['to', 'cc', 'bcc'], function (key) {
            if (_.isString(mailOptions[key])) {
                mailOptions[key] = _.template(mailOptions[key])(templateData);
            }
            else if (_.isArray(mailOptions[key])) {
                mailOptions[key] = _.map(mailOptions[key], function (item) {
                    return _.template(item)(templateData);
                });
            }
        });
        _.each(['text', 'html', 'replyTo'], function (key) {
            if (_.isString(mailOptions[key])) {
                mailOptions[key] = _.template(mailOptions[key])(templateData);
            }
        });
        return mailOptions;
    };
    Mailer.prototype.sendMail = function (mailOptions) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(mailOptions);
                }
            });
        });
    };
    return Mailer;
}());
exports.Mailer = Mailer;
