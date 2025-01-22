const dotenv = require("dotenv");

const twilio = require("twilio");
require("dotenv").config();

const accountSid = process.env.TWILIOACCOUNTSID;
const authToken = process.env.TWILIOTOKEN;
const client = twilio(accountSid, authToken);

const sendWhatsAppMessage = async (firstName, lastName) => {
  try {
    const message = await client.messages.create({
      body: `Hello ${firstName} ${lastName}, We are delighted to welcome you to DevTinder Teams! It’s an exciting opportunity to have you as part of our growing community.

At DevTinder, we are committed to fostering innovation and collaboration, and we are confident that your unique skills and expertise will contribute significantly to our journey. Should you have any questions, require support, or need guidance, our team is always here to assist you.

Let’s work together to achieve remarkable outcomes and make a meaningful impact.

Once again, welcome aboard!`,
      from: "whatsapp:+14155238886",
      to: "whatsapp:+918856051111",
    });

    console.log("Message sent successfully! SID:", message.sid);
  } catch (error) {
    console.error("Failed to send message. Error:", error.message);
    throw new Error("WhatsApp message sending failed: " + error.message);
  }
};

module.exports = sendWhatsAppMessage;
