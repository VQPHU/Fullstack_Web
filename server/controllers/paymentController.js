import asyncHandler from "express-async-handler";
import Stripe from "stripe";
import Order from "../models/orderModel.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc Create payment intent
// @route POST /api/payment/create-intent
// @access Private
export const createPaymentIntent = asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    if (!orderId) {
        res.status(400);
        throw new Error("Order ID is required");
    }

    const order = await Order.findById(orderId);

    if (!order) {
        res.status(404);
        throw new Error("Order not found");
    }

    if (order.userId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error("Not authorized to pay for this order");
    }

    if (order.status !== "pending") {
        res.status(400);
        throw new Error("Order is not in pending status");
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(order.total * 100), // Stripe expects amount in cents
        currency: "usd",
        metadata: {
            orderId: order._id.toString(),
        },
    });

    // Update order with payment intent ID
    order.paymentIntentId = paymentIntent.id;
    await order.save();

    res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
    });
});

// @desc Handle Stripe webhook
// @route POST /api/payment/webhook
// @access Public
export const handleStripeWebhook = asyncHandler(async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.log(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case "payment_intent.succeeded":
            const paymentIntent = event.data.object;
            const orderId = paymentIntent.metadata.orderId;

            // Update order status to paid
            const order = await Order.findById(orderId);
            if (order) {
                order.status = "paid";
                order.paidAt = new Date();
                await order.save();
            }
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});
