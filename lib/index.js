"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var _ = require("underscore");
var yaml = require("js-yaml");
var nodemailer = require("nodemailer");
var Promise = require("bluebird");
;
var Mailer = (function () {
    function Mailer(config) {
        this.config = config;
        this.transporter = nodemailer.createTransport(config.transport);
    }
    Mailer.prototype.sendMailUsingYamlTemplate = function (templateName, languageId, mailOptions, templateData) {
        var _this = this;
        var templatesDir = path.join(process.cwd(), this.config.templatesDir);
        var mailTemplate = _.extend(loadMailTemplate(path.join(templatesDir, 'mail.yaml')), loadMailTemplate(path.join(templatesDir, templateName, templateName + ".yaml")), loadMailTemplate(path.join(templatesDir, templateName, templateName + "." + languageId + ".yaml")));
        var _mailOptions = _.extend({}, mailOptions);
        _.each(['from', 'subject'], function (key) {
            if (_.isString(mailTemplate[key])) {
                _mailOptions[key] = _.template(mailTemplate[key])(templateData);
            }
        });
        _.each(['to', 'cc', 'bcc'], function (key) {
            if (_.isString(mailTemplate[key])) {
                _mailOptions[key] = _.template(mailTemplate[key])(templateData);
            }
            else if (_.isArray(mailTemplate[key])) {
                _mailOptions[key] = _.map(mailTemplate[key], function (item) {
                    return _.template(item)(templateData);
                });
            }
        });
        _.each(['text', 'html', 'replyTo'], function (key) {
            if (_.isString(mailTemplate[key])) {
                _mailOptions[key] = _.template(mailTemplate[key])(templateData);
            }
        });
        return new Promise(function (resolve, reject) {
            if (_this.config.simulation === true) {
                resolve(_mailOptions);
            }
            else {
                _this.transporter.sendMail(_mailOptions, function (err, info) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(_mailOptions);
                    }
                });
            }
        });
    };
    return Mailer;
}());
exports.Mailer = Mailer;
function loadMailTemplate(filepath) {
    if (fs.existsSync(filepath)) {
        try {
            return yaml.safeLoad(fs.readFileSync(filepath, 'utf8'));
        }
        catch (err) {
        }
    }
    return {};
}
