import { useState, useEffect } from "react";

const images = [
  "/1.jpeg",
  "/2.jpeg",
  "/3.jpeg",
  "/4.jpeg",
  "/5.jpeg",
  "/6.jpeg",
];

const INTERVAL = 3000;

export function HeroSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, INTERVAL);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      id="inicio"
      className="relative h-[80vh] min-h-[500px] overflow-hidden"
    >
      {images.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={src}
            alt={`Slide ${i + 1}`}
            className="w-full h-full object-cover object-center"
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            UEP Francisco de Paula Salazar Acosta
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Formando líderes con excelencia académica y valores humanos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-(--greenColor) hover:brightness-110 text-white font-semibold px-8 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg">
              Conócenos
            </button>
            <button className="bg-transparent border-2 border-white hover:bg-white hover:text-(--darkBlueColor) text-white font-semibold px-8 py-3 rounded-lg transition-all">
              Admisiones
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2.5 rounded-full transition-all cursor-pointer ${
              i === current ? "bg-white w-6" : "bg-white/50 hover:bg-white/80 w-2.5"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
