import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import LoadingScreen from "./components/LoadingScreen";

type Product = {
  id: string;
  name: string;
  price: number | null;
  image_url: string;
};

async function getProducts(): Promise<Product[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data, error } = await supabase
    .from("products")
    .select("id,name,price,image_url")
    .eq("is_available", true)
    .limit(24);

  if (error) {
    console.error(error);
    return [];
  }
  return data ?? [];
}

export default async function Home() {
  const products = await getProducts();

  return (
    <>
      <LoadingScreen />
      <main className="min-h-screen bg-sangeet-cream text-charcoal">
        <header className="py-6 text-center">
          <h1 className="font-display text-4xl text-sangeet-gold">
            Sangeet by Gitika
          </h1>
          <p className="mt-2 text-sm tracking-wide text-gray-600">
            Premium Handbags & Accessories
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-6 pb-20">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl shadow-luxury p-4 hover:shadow-xl transition duration-300"
            >
              <Image
                src={p.image_url}
                alt={p.name}
                width={800}
                height={800}
                className="rounded-xl object-cover"
              />
              <div className="mt-3 text-center">
                <h3 className="font-display text-lg">{p.name}</h3>
                {p.price != null && (
                  <p className="text-sangeet-gold font-medium">₹{p.price}</p>
                )}
              </div>
            </div>
          ))}
        </section>

        <footer className="text-center text-xs text-gray-500 pb-4">
          © 2025 Sangeet by Gitika
        </footer>
      </main>
    </>
  );
}
