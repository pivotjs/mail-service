import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'underscore';
import * as yaml from 'js-yaml';
import * as nodemailer from 'nodemailer';
import * as Promise from 'bluebird';

export interface MailTemplate {
    from?: string;
    subject?: string;
    to?: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    text?: string;
    html?: string;
    replyTo?: string;
    attachments?: Object[];
};

export class Mailer {
    private transporter: nodemailer.Transporter;

    constructor(transporter: nodemailer.Transporter) {
        this.transporter = transporter;
    }

    loadYamlMailTemplate(filepath: string): nodemailer.SendMailOptions {
        if (fs.existsSync(filepath)) {
            try {
                return yaml.safeLoad(fs.readFileSync(filepath, 'utf8'));
            } catch (err) {
            }
        }
        return {} as nodemailer.SendMailOptions;
    }

    prepareMail(mailTemplate: MailTemplate, templateData: Object): nodemailer.SendMailOptions {
        const mailOptions: nodemailer.SendMailOptions = _.extend({}, mailTemplate);

        _.each(['from', 'subject'], (key) => {
            if (_.isString(mailOptions[key])) {
                mailOptions[key] = _.template(mailOptions[key])(templateData);
            }
        });

        _.each(['to', 'cc', 'bcc'], (key) => {
            if (_.isString(mailOptions[key])) {
                mailOptions[key] = _.template(mailOptions[key])(templateData);
            } else if (_.isArray(mailOptions[key])) {
                mailOptions[key] = _.map(mailOptions[key], (item: string) => {
                    return _.template(item)(templateData);
                });
            }
        });

        _.each(['text', 'html', 'replyTo'], (key) => {
            if (_.isString(mailOptions[key])) {
                mailOptions[key] = _.template(mailOptions[key])(templateData);
            }
        });

        return mailOptions;
    }

    sendMail(mailOptions: nodemailer.SendMailOptions): Promise<nodemailer.SendMailOptions> {
        return new Promise((resolve, reject) => {
            this.transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(mailOptions);
                }
            });
        });
    }
}
