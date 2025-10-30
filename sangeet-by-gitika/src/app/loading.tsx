"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen bg-sangeet-cream">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.2 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      >
        <Image
          src="/logo.png"
          alt="Sangeet Logo"
          width={200}
          height={200}
          priority
          className="rounded-full shadow-luxury"
        />
      </motion.div>
    </div>
  );
}
