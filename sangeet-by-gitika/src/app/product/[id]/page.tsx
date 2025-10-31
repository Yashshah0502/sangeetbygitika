import { createClient } from "@supabase/supabase-js";
import ProductDetail from "../components/ProductDetail";
import Header from "@/app/components/Header";

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
    return (
      <>
        <Header />
        <p className="text-center py-20 text-brand-text/70">Product not found.</p>
      </>
    );

  return (
    <>
      <Header />
      <ProductDetail product={product} />
    </>
  );
}
