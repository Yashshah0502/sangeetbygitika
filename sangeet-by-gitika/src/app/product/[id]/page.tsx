import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product)
    return <p className="text-center py-20 text-brand-text/70">Product not found.</p>;

  const whatsappMessage = `Hi! I'm interested in ${product.name} (₹${product.price}). Is it available?`;
  const whatsappLink = `https://wa.me/919XXXXXXXXX?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <main className="min-h-screen text-brand-text px-6 py-12">
      <Link
        href="/"
        className="inline-block text-brand-primary hover:text-brand-accent underline text-sm mb-6 transition-colors"
      >
        ← Back to Catalog
      </Link>
      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm rounded-3xl shadow-luxury p-6 md:p-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="relative">
            <Image
              src={product.image_url}
              alt={product.name}
              width={800}
              height={800}
              className="rounded-2xl object-cover w-full h-[400px] md:h-[500px]"
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            <h1 className="font-display text-3xl md:text-4xl text-brand-text">
              {product.name}
            </h1>
            <p className="text-2xl md:text-3xl text-brand-accent font-medium mt-3">
              ₹{product.price}
            </p>
            <p className="text-brand-text/70 mt-6 leading-relaxed text-sm md:text-base">
              {product.description || "Beautiful handcrafted accessory perfect for any occasion."}
            </p>

            {/* Order Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-brand-primary to-brand-accent text-white px-6 py-3 rounded-full hover:opacity-90 hover:scale-105 transition-all shadow-md"
              >
                <span className="text-xl">🛍</span>
                <span className="font-medium">Order via WhatsApp</span>
              </a>
              <a
                href="https://instagram.com/sangeetbygitika"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-white border-2 border-brand-primary text-brand-primary px-6 py-3 rounded-full hover:bg-brand-primary hover:text-white hover:scale-105 transition-all shadow-md"
              >
                <span className="text-xl">📸</span>
                <span className="font-medium">View on Instagram</span>
              </a>
            </div>

            {/* Product Details */}
            {product.category && (
              <div className="mt-8 p-4 bg-gradient-to-br from-brand-hover-from/50 to-brand-hover-to/50 rounded-xl">
                <p className="text-sm text-brand-text/70">
                  <span className="font-medium text-brand-text">Category:</span>{" "}
                  <span className="capitalize">{product.category}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
