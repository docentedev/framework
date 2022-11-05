import nodemailer from "nodemailer";
import dotenv from 'dotenv';

dotenv.config();

const config = {
    host: process.env.SMTP_HOST,
    port: Number.parseInt(process.env.SMTP_PORT || '465'),
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER, // generated ethereal user
        pass: process.env.SMTP_PASS, // generated ethereal password
    },
}

const sendMail = (data: { message: string, email: string, name: string }) => {
    "use strict";

    // async..await is not allowed in global scope, must use a wrapper
    async function main() {
        // Generate test SMTP service account from ethereal.email
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport(config);

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: `"Andesprecision.cl" <${process.env.SMTP_FROM}>`, // sender address
            to: data.email, // list of receivers
            subject: "Enviado desde el formulario de contacto de Andres Precision", // Subject line
            text: `${Date.now()}`, // plain text body
            html: `
            <div>email: ${data.email}</div>
            <div>nombre: ${data.name}</div>
            <div>mensaje: <p>${data.message.replace(/\n/g, "<br />")}</p></div>
            `, // html body
        });

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    }

    main().catch(console.error);
}

export default sendMail
