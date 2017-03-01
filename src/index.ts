import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'underscore';
import * as yaml from 'js-yaml';
import * as nodemailer from 'nodemailer';
import * as Promise from 'bluebird';

export interface MailerConfig {
    transport: {
        service: string;
        auth: {
            user: string;
            pass: string;
        }
    }
    templatesDir: string;
    simulation?: boolean;
}

export interface MailOptions {
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
    private config: MailerConfig;
    private transporter: nodemailer.Transporter;

    constructor(config: MailerConfig) {
        this.config = config;
        this.transporter = nodemailer.createTransport(config.transport);
    }

    sendMailUsingYamlTemplate(templateName: string, languageId: string, mailOptions: MailOptions, templateData: MailOptions): Promise<nodemailer.SendMailOptions> {
        const templatesDir = path.join(process.cwd(), this.config.templatesDir);
        const mailTemplate: nodemailer.SendMailOptions = _.extend(
            loadMailTemplate(path.join(templatesDir, 'mail.yaml')),
            loadMailTemplate(path.join(templatesDir, templateName, `${templateName}.yaml`)),
            loadMailTemplate(path.join(templatesDir, templateName, `${templateName}.${languageId}.yaml`)),
        );

        const _mailOptions = _.extend({}, mailOptions);

        _.each(['from', 'subject'], (key) => {
            if (_.isString(mailTemplate[key])) {
                _mailOptions[key] = _.template(mailTemplate[key])(templateData);
            }
        });

        _.each(['to', 'cc', 'bcc'], (key) => {
            if (_.isString(mailTemplate[key])) {
                _mailOptions[key] = _.template(mailTemplate[key])(templateData);
            } else if (_.isArray(mailTemplate[key])) {
                _mailOptions[key] = _.map(mailTemplate[key], (item: string) => {
                    return _.template(item)(templateData);
                });
            }
        });

        _.each(['text', 'html', 'replyTo'], (key) => {
            if (_.isString(mailTemplate[key])) {
                _mailOptions[key] = _.template(mailTemplate[key])(templateData);
            }
        });

        return new Promise((resolve, reject) => {
            if (this.config.simulation === true) {
                resolve(_mailOptions);
            } else {
                this.transporter.sendMail(_mailOptions, (err, info) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(_mailOptions);
                    }
                });
            }
        });
    }
}

function loadMailTemplate(filepath): nodemailer.SendMailOptions {
    if (fs.existsSync(filepath)) {
        try {
            return yaml.safeLoad(fs.readFileSync(filepath, 'utf8'));
        } catch (err) {
        }
    }
    return {} as nodemailer.SendMailOptions;
}
