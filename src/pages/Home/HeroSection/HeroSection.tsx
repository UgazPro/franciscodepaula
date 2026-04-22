

export function HeroSection() {
  return (
    <section id="inicio" className="relative bg-linear-to-r from-blue-900 to-blue-800 text-white py-20 md:py-28">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          UEP Francisco de Paula Salazar Acosta
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
          Formando líderes con excelencia académica y valores humanos
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg">
            Conócenos
          </button>
          <button className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-900 text-white font-semibold px-8 py-3 rounded-lg transition-all">
            Admisiones
          </button>
        </div>
      </div>
    </section>
  );
};

