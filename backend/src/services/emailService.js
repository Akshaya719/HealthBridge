const RESEND_API_URL = "https://api.resend.com/emails";
const REQUEST_TIMEOUT_MS = 15_000;

async function sendEmail(to, subject, html) {
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