import nodemailer from 'nodemailer';

interface MailData {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

const email = 'kelian9@yandex.ru';

class EmailService {

    public static transporter = nodemailer.createTransport({
        port: 465,               // true for 465, false for other ports
        host: "smtp.yandex.ru",
        auth: {
            user: email,
            pass: 'iigoiilmquozmvzo',
        },
        pool: true,
        secure: true,
    });

    public static sendMail(mailData: MailData) {
        return EmailService.transporter.sendMail({
            ...mailData,
            from: email
        }).then(info => {
            return info;
        });
    }
}

export default EmailService;