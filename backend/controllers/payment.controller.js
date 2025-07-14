import crypto from "crypto";
import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import { razorpay } from "../lib/razorpay.js"; // Ensure this is the correctly initialized instance

export const createCheckoutSession = async (req, res) => {
  try {
    const { products, couponCode } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Invalid or empty products array" });
    }

    let totalAmount = 0;
    products.forEach((product) => {
      totalAmount += product.price * product.quantity;
    });

    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode,
        userId: req.user._id,
        isActive: true,
      });
      if (coupon) {
        totalAmount -= (totalAmount * coupon.discountPercentage) / 100;
      }
    }

    const options = {
      amount: totalAmount * 100, // in paise
      currency: "INR",
      receipt: "receipt_order_" + Date.now(),
      notes: {
        userId: req.user._id.toString(),
        couponCode: couponCode || "",
        products: JSON.stringify(
          products.map((p) => ({
            id: p._id,
            quantity: p.quantity,
            price: p.price,
          }))
        ),
      },
    };

    const order = await razorpay.orders.create(options);

    // reward new coupon for large orders
    if (totalAmount >= 20000) {
      await createNewCoupon(req.user._id);
    }

    res.status(200).json({ orderId: order.id, amount: options.amount });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({
      message: "Error creating Razorpay order",
      error: error.message,
    });
  }
};

export const checkoutSuccess = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment details" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const orderData = await razorpay.orders.fetch(razorpay_order_id);

    let products = [];
    let couponCode = null;
    let userId = null;

    try {
      products = JSON.parse(orderData.notes.products || "[]");
      couponCode = orderData.notes.couponCode;
      userId = orderData.notes.userId;
    } catch (err) {
      console.error("Error parsing Razorpay notes:", err);
      return res.status(400).json({ message: "Invalid order metadata" });
    }

    if (!userId || products.length === 0) {
      return res.status(400).json({ message: "Missing order data" });
    }

    if (couponCode) {
      await Coupon.findOneAndUpdate(
        { code: couponCode, userId },
        { isActive: false }
      );
    }

    const newOrder = new Order({
      user: userId,
      products: products.map((product) => ({
        product: product.id,
        quantity: product.quantity,
        price: product.price,
      })),
      totalAmount: orderData.amount / 100,
      razorpayPaymentId: razorpay_payment_id,
    });

    await newOrder.save();

    res.status(200).json({
      success: true,
      message: "Payment verified and order created",
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error("Error processing Razorpay checkout:", error);
    res.status(500).json({
      message: "Error processing Razorpay checkout",
      error: error.message,
    });
  }
};

async function createNewCoupon(userId) {
  await Coupon.findOneAndDelete({ userId });

  const newCoupon = new Coupon({
    code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    discountPercentage: 10,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    userId,
  });

  await newCoupon.save();
  return newCoupon;
}
