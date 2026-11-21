const nodemailer=require("nodemailer")


async function sendEmail(to,subject,html){
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
        throw new Error("SMTP_EMAIL and SMTP_PASSWORD must be configured");
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        },
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 20_000
    })

    const mailOptions={
        from: process.env.SMTP_EMAIL,
        to,
        subject,
        html
    }

    return transporter.sendMail(mailOptions)


}

module.exports= sendEmail