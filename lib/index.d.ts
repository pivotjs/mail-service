/// <reference types="bluebird" />
import * as nodemailer from 'nodemailer';
import * as Promise from 'bluebird';
export interface MailerConfig {
    transport: {
        service: string;
        auth: {
            user: string;
            pass: string;
        };
    };
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
}
export declare class Mailer {
    private config;
    private transporter;
    constructor(config: MailerConfig);
    sendMailUsingYamlTemplate(templateName: string, languageId: string, mailOptions: MailOptions, templateData: MailOptions): Promise<nodemailer.SendMailOptions>;
}
