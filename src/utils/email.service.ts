import { HttpException, Injectable } from "@nestjs/common";
import sgMail from "@sendgrid/mail"
import { AttachmentData } from "@sendgrid/helpers/classes/attachment"
import 'dotenv/config';

@Injectable()
export class MailService {
    private readonly mail: sgMail.MailService
    constructor() {
        this.mail?.setApiKey(process.env.SENDGRID_API_KEY!)
    }

    async sendMail(
        to: string, 
        subject: string, 
        text: string, 
        html: string, 
        attachment?: AttachmentData,
        cc?: string | string[], 
        bcc?: string | string[]
    ) {
        try {
            await this.mail.send({
                to,
                from: process.env.SENDGRID_VERIFIED_SENDER!,
                subject,
                text,
                html,
                ...(cc && { cc }),
                ...(bcc && { bcc }),
                ...(attachment && { attachments: [attachment] })
            })
        } catch (error: HttpException | any) {
            throw new HttpException('Failed to send email', error?.status || 500)
        }
    }
}