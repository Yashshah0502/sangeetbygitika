"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Phone, Instagram } from "lucide-react";

export default function FloatingContactButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Main Floating Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        className="fixed bottom-6 right-6 z-50"
      >
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-linear-to-r from-brand-primary to-brand-accent text-white rounded-full p-4 shadow-2xl hover:scale-110 transition-transform flex items-center gap-2"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="hidden md:inline font-medium pr-2">Contact Us</span>
          </button>
        ) : (
          <button
            onClick={() => setIsOpen(false)}
            className="bg-gray-800 text-white rounded-full p-4 shadow-2xl hover:scale-110 transition-transform"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </motion.div>

      {/* Contact Options Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="fixed bottom-24 right-6 z-50 bg-white rounded-2xl shadow-2xl p-4 w-64"
          >
            <h3 className="font-display text-lg text-brand-primary mb-4">
              Get in Touch
            </h3>
            <div className="space-y-3">
              <a
                href="https://wa.me/918440866772"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 transition-colors group"
              >
                <div className="bg-green-100 p-2 rounded-full group-hover:bg-green-200 transition-colors">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">WhatsApp</p>
                  <p className="text-xs text-gray-500">Chat with us</p>
                </div>
              </a>

              <a
                href="https://instagram.com/sangeetbygitika"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-pink-50 transition-colors group"
              >
                <div className="bg-pink-100 p-2 rounded-full group-hover:bg-pink-200 transition-colors">
                  <Instagram className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Instagram</p>
                  <p className="text-xs text-gray-500">Follow us</p>
                </div>
              </a>

              <a
                href="mailto:sangeetbygitika@gmail.com"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group"
              >
                <div className="bg-blue-100 p-2 rounded-full group-hover:bg-blue-200 transition-colors">
                  <span className="text-blue-600 text-xl">✉️</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Email</p>
                  <p className="text-xs text-gray-500">Write to us</p>
                </div>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
