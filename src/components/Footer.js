import React from 'react';

const Footer = () => {
  return (
    <footer className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-gray-100 shadow-sm py-6 sm:py-8 md:py-10">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div>
            <h3 className="text-sm sm:text-base font-semibold mb-2 text-gray-800">Adresse</h3>
            <p className="text-xs sm:text-sm text-gray-600">Rue de l&apos;Aéroport, Skanes</p>
            <p className="text-xs sm:text-sm text-gray-600">Monastir 5000, Tunisie</p>
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold mb-2 text-gray-800">Téléphone</h3>
            <p className="text-xs sm:text-sm text-gray-600">+216 73 520 088</p>
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold mb-2 text-gray-800">Email</h3>
            <p className="text-xs sm:text-sm text-gray-600">resa@rosa-hotels.com</p>
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold mb-2 text-gray-800">Website</h3>
            <a href="https://rosabeach.tn" className="text-xs sm:text-sm text-emerald-500 hover:text-emerald-600 transition-colors duration-300">rosabeach.tn</a>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <p className="text-xs sm:text-sm text-gray-600">© 2023 Rosa Beach Community. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;