const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const sendEmail = require("./emailService");

async function test() {
  const testEmail = process.env.TEST_EMAIL;
  if (!testEmail) {
    throw new Error("Set TEST_EMAIL to an address you control before running this script");
  }

  try {
    await sendEmail(
      testEmail,
      "HealthBridge email delivery test",
      "<p>Your HealthBridge email delivery is working.</p>"
    );
    console.log("Test email sent");
  } catch (err) {
    console.error("Email test failed:", err.message);
    process.exitCode = 1;
  }
}

test().catch((err) => {
  console.error("Email test failed:", err.message);
  process.exitCode = 1;
});
