import Image from "next/image";
import LoadingScreen from "./components/LoadingScreen";

const dummyProducts = [
  { id: 1, name: "Royal Pink Clutch", price: "₹3,499", img: "/logo.png" },
  { id: 2, name: "Golden Tote Bag", price: "₹4,999", img: "/logo.png" },
  { id: 3, name: "Silk Potli Bag", price: "₹2,999", img: "/logo.png" },
];

export default function Home() {
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
          {dummyProducts.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-luxury p-4 hover:shadow-xl transition duration-300"
            >
              <Image
                src={item.img}
                alt={item.name}
                width={400}
                height={400}
                className="rounded-xl object-cover"
              />
              <div className="mt-3 text-center">
                <h3 className="font-display text-lg">{item.name}</h3>
                <p className="text-sangeet-gold font-medium">{item.price}</p>
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
