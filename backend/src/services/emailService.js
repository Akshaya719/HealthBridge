const nodemailer = require("nodemailer");

const RESEND_API_URL = "https://api.resend.com/emails";
const REQUEST_TIMEOUT_MS = 15_000;

async function sendEmail(to, subject, html) {
  const provider = process.env.EMAIL_PROVIDER?.trim().toLowerCase() || "resend";

  if (provider === "smtp") {
    const user = process.env.SMTP_EMAIL?.trim();
    const pass = process.env.SMTP_PASSWORD?.replace(/\s+/g, "");

    if (!user || !pass) {
      throw new Error("SMTP_EMAIL and SMTP_PASSWORD must be configured for SMTP");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });

    return transporter.sendMail({ from: user, to, subject, html });
  }

  if (provider !== "resend") {
    throw new Error(`Unsupported email provider: ${provider}`);
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();

  if (!apiKey || !from) {
    throw new Error("RESEND_API_KEY and RESEND_FROM_EMAIL must be configured");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, html }),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const providerMessage =
        typeof data?.message === "string" ? data.message : "Unknown provider error";
      throw new Error(`Resend rejected the email (${response.status}): ${providerMessage}`);
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Resend email request timed out");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

module.exports = sendEmail;