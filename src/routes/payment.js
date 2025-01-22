const express = require("express");
const { default: Stripe } = require("stripe");
const { userAuth } = require("../middleware/auth");
const dotenv = require("dotenv");
const payment = require("../model/payment");

dotenv.config();

const paymentRouter = express.Router();
const stripe = Stripe(process.env.stripeKey);

paymentRouter.post("/payment", userAuth, async (req, res) => {
  const { membershipType, payment_method } = req.body;
  const loggedInUser = req.user;

  // Membership plan details
  const membershipPlans = {
    Golden: 7000, // amount in INR
    Silver: 5000, // amount in INR
  };

  const amountInINR = membershipPlans[membershipType];
  const amountInPaise = amountInINR * 100; // convert to paise (1 INR = 100 paise)
  const currency = "inr";

  if (!amountInPaise) {
    return res.status(400).json({
      error: "Invalid membership type",
      status: false,
      statusCode: 400,
    });
  }

  try {
    // Create payment intent with the correct amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPaise,
      currency: currency,
      payment_method: payment_method, // Pass the payment method here
      confirmation_method: "manual", // Optional: This makes the payment manual, you can handle it later
      confirm: true, // Automatically confirms the payment
    });

    // Save payment details to the database
    const paymentDetails = new payment({
      userId: loggedInUser._id,
      paymentIntentId: paymentIntent.id,
      membershipType,
      description: `${membershipType} Membership Payment`,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
    });

    await paymentDetails.save();

    res.status(201).json({
      message: `${membershipType} Membership payment successful!`,
      data: paymentDetails,
    });
  } catch (error) {
    console.log(error);

    // Handle errors and return proper response
    if (error.type === "StripeCardError") {
      // Handle card-specific errors (e.g., card declined)
      res.status(400).json({ error: error.message });
    } else {
      // Handle other types of errors
      res
        .status(500)
        .json({ error: "An error occurred during payment processing" });
    }
  }
});

module.exports = paymentRouter;
