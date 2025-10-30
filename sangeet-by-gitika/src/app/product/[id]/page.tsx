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
    return <p className="text-center py-20 text-gray-500">Product not found.</p>;

  return (
    <main className="min-h-screen bg-sangeet-cream text-charcoal px-6 py-12">
      <Link href="/" className="text-sangeet-gold underline text-sm mb-6 inline-block">
        ← Back to Catalog
      </Link>
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-luxury p-8">
        <Image
          src={product.image_url}
          alt={product.name}
          width={800}
          height={800}
          className="rounded-2xl object-cover mx-auto"
        />
        <h1 className="font-display text-3xl text-center mt-6">{product.name}</h1>
        <p className="text-center text-sangeet-gold font-medium mt-1">
          ₹{product.price}
        </p>
        <p className="text-center text-gray-700 mt-4 leading-relaxed">
          {product.description}
        </p>

        <div className="text-center mt-6">
          <a
            href={`https://wa.me/4809522965?text=Hi! I'm interested in ${encodeURIComponent(product.name)}.`}
            target="_blank"
            className="inline-block bg-sangeet-gold text-white px-6 py-3 rounded-full hover:opacity-90 transition"
          >
            DM to Order 💬
          </a>
        </div>
      </div>
    </main>
  );
}
