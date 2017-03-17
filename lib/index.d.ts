/// <reference types="bluebird" />
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
}
export declare class Mailer {
    private transporter;
    constructor(transporter: nodemailer.Transporter);
    loadYamlMailTemplate(filepath: string): nodemailer.SendMailOptions;
    prepareMail(mailTemplate: MailTemplate, templateData: Object): nodemailer.SendMailOptions;
    sendMail(mailOptions: nodemailer.SendMailOptions): Promise<nodemailer.SendMailOptions>;
}
