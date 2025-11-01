"use client";

import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "../components/Header";

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleWhatsAppShare = () => {
    const message = `Hi! I'm interested in these products:\n\n${cartItems
      .map((item, idx) => `${idx + 1}. ${item.name} (x${item.quantity}) – ₹${item.price * item.quantity}`)
      .join("\n")}\n\nTotal: ₹${totalPrice}`;

    const whatsappLink = `https://wa.me/918440866772?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, "_blank");
  };

  const handleInstagramShare = () => {
    const message = `Hi! I'm interested in these products:\n\n${cartItems
      .map((item, idx) => `${idx + 1}. ${item.name} (x${item.quantity}) – ₹${item.price * item.quantity}`)
      .join("\n")}\n\nTotal: ₹${totalPrice}`;

    const instagramLink = `https://ig.me/m/sangeetbygitika?text=${encodeURIComponent(message)}`;
    window.open(instagramLink, "_blank");
  };

  if (cartItems.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen text-brand-text px-6 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="font-display text-3xl md:text-4xl text-brand-primary mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-brand-text/70 mb-8">
              Add some beautiful pieces to your cart!
            </p>
            <Link
              href="/"
              className="inline-block px-8 py-3 bg-linear-to-r from-brand-primary to-brand-accent text-white rounded-full hover:opacity-90 hover:scale-105 transition-all"
            >
              Browse Products
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen text-brand-text px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-display text-3xl md:text-4xl text-brand-primary">
            Your Cart 🛍
          </h1>
          <Link
            href="/"
            className="text-brand-accent hover:text-brand-primary underline text-sm transition-colors"
          >
            ← Continue Shopping
          </Link>
        </div>

        {/* Cart Items */}
        <div className="space-y-4 mb-8">
          {cartItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-4 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-luxury"
            >
              <Link href={`/product/${item.id}`} className="flex-shrink-0">
                <Image
                  src={item.image_url}
                  alt={item.name}
                  width={120}
                  height={120}
                  className="rounded-xl object-cover w-24 h-24 md:w-32 md:h-32 hover:opacity-80 transition-opacity cursor-pointer"
                />
              </Link>
              <div className="flex-1">
                <Link href={`/product/${item.id}`}>
                  <h3 className="font-display text-lg md:text-xl text-brand-text hover:text-brand-accent transition-colors cursor-pointer">
                    {item.name}
                  </h3>
                </Link>
                <p className="text-brand-accent font-medium text-xl mt-2">
                  ₹{item.price} each
                </p>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary font-bold transition-colors flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="font-medium text-brand-text min-w-[2rem] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary font-bold transition-colors flex items-center justify-center"
                  >
                    +
                  </button>
                  <span className="text-sm text-brand-text/70 ml-2">
                    Subtotal: ₹{item.price * item.quantity}
                  </span>
                </div>
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-400 hover:text-red-600 transition-colors text-2xl self-start"
              >
                ×
              </button>
            </motion.div>
          ))}
        </div>

        {/* Total & Actions */}
        <div className="bg-linear-to-br from-brand-hover-from to-brand-hover-to rounded-3xl p-6 md:p-8 shadow-luxury">
          <div className="flex justify-between items-center mb-6">
            <span className="font-display text-xl md:text-2xl text-brand-text">
              Total
            </span>
            <span className="text-2xl md:text-3xl text-brand-accent font-medium">
              ₹{totalPrice}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleWhatsAppShare}
              className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-brand-primary to-brand-accent text-white px-6 py-4 rounded-full hover:opacity-90 hover:scale-105 transition-all shadow-md font-medium"
            >
              <span className="text-xl">💬</span>
              <span>Send to WhatsApp</span>
            </button>
            <button
              onClick={handleInstagramShare}
              className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-brand-primary text-brand-primary px-6 py-4 rounded-full hover:bg-brand-primary hover:text-white hover:scale-105 transition-all shadow-md font-medium"
            >
              <span className="text-xl">📸</span>
              <span>Message on Instagram</span>
            </button>
          </div>

          <button
            onClick={clearCart}
            className="w-full mt-4 text-brand-text/50 hover:text-red-500 text-sm transition-colors"
          >
            Clear Cart
          </button>
        </div>
      </div>
    </main>
    </>
  );
}
