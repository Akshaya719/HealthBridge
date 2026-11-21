const nodemailer=require("nodemailer")


async function sendEmail(to,subject,html){
    const smtpEmail = process.env.SMTP_EMAIL?.trim();
    const smtpPassword = process.env.SMTP_PASSWORD?.replace(/\s+/g, "");

    if (!smtpEmail || !smtpPassword) {
        throw new Error("SMTP_EMAIL and SMTP_PASSWORD must be configured");
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: smtpEmail,
            pass: smtpPassword
        },
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 20_000
    })

    const mailOptions={
        from: smtpEmail,
        to,
        subject,
        html
    }

    return transporter.sendMail(mailOptions)


}

module.exports= sendEmail