import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { Link } from "react-router-dom";
import { MoveRight } from "lucide-react";
import axios from "../lib/axios";
import { useEffect, useState } from "react";

const OrderSummary = () => {
  const { total, subtotal, coupon, isCouponApplied, cart, clearCart } =
    useCartStore();

  const [orderDetails, setOrderDetails] = useState(null);

  const savings = subtotal - total;
  const formattedSubtotal = subtotal.toFixed(2);
  const formattedTotal = total.toFixed(2);
  const formattedSavings = savings.toFixed(2);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handlePayment = async () => {
    try {
      const { data } = await axios.post("/payments/create-checkout-session", {
        products: cart,
        couponCode: coupon ? coupon.code : null,
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        name: "Zestify Store",
        description: "Order Checkout",
        order_id: data.orderId,
        handler: async function (response) {
          const verify = await axios.post("/payments/checkout-success", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          setOrderDetails(verify.data);
          clearCart();
        },
        prefill: {
          name: "Your Name",
          email: "email@example.com",
        },
        theme: {
          color: "#3B82F6", // 🔵 Blue color
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Payment failed:", err.message);
      alert("Payment failed. Please try again.");
    }
  };

  return (
    <motion.div
      className="space-y-4 rounded-lg border border-blue-800 bg-gray-900 p-4 shadow-md sm:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-xl font-semibold text-blue-400">Order summary</p>

      {orderDetails && (
        <div className="mt-4 rounded-md border border-blue-600 bg-blue-100 p-4 text-sm text-blue-800">
          <p className="font-semibold">✅ Payment Successful!</p>
          <p>
            Order ID: <span className="font-mono">{orderDetails.orderId}</span>
          </p>
          <p className="mt-1">
            Thank you for your purchase. We'll process your order shortly.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <dl className="flex items-center justify-between gap-4">
            <dt className="text-base font-normal text-gray-300">
              Original price
            </dt>
            <dd className="text-base font-medium text-white">
              ${formattedSubtotal}
            </dd>
          </dl>

          {savings > 0 && (
            <dl className="flex items-center justify-between gap-4">
              <dt className="text-base font-normal text-gray-300">Savings</dt>
              <dd className="text-base font-medium text-sky-400">
                -${formattedSavings}
              </dd>
            </dl>
          )}

          {coupon && isCouponApplied && (
            <dl className="flex items-center justify-between gap-4">
              <dt className="text-base font-normal text-gray-300">
                Coupon ({coupon.code})
              </dt>
              <dd className="text-base font-medium text-sky-400">
                -{coupon.discountPercentage}%
              </dd>
            </dl>
          )}

          <dl className="flex items-center justify-between gap-4 border-t border-gray-700 pt-2">
            <dt className="text-base font-bold text-white">Total</dt>
            <dd className="text-base font-bold text-blue-400">
              ${formattedTotal}
            </dd>
          </dl>
        </div>

        {!orderDetails && (
          <motion.button
            className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePayment}
          >
            Proceed to Checkout
          </motion.button>
        )}

        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-normal text-gray-400">or</span>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 underline hover:text-blue-300 hover:no-underline"
          >
            Continue Shopping
            <MoveRight size={16} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderSummary;
