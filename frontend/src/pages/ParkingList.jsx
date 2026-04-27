import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const ParkingList = () => {
  const [parkingi, setParkingi] = useState([]);

  useEffect(() => {
    // W rzeczywistości użyj fetch lub axios do pobrania danych z Twojego API
    fetch('/api/parkingi')
      .then(res => res.json())
      .then(data => setParkingi(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dostępne parkingi</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parkingi.map(parking => (
          <div key={parking._id} className="border rounded-lg p-6 shadow-sm hover:shadow-md transition">
            <h2 className="text-xl font-semibold">{parking.nazwa}</h2>
            <p className="text-gray-600 mb-2">{parking.adres}</p>
            <div className="flex justify-between items-center mb-4">
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {parking.typ}
              </span>
              <span className="font-bold">{parking.cenaZaGodzine} PLN / h</span>
            </div>
            <p className={`text-sm mb-4 ${parking.wolneMiejsca > 0 ? 'text-green-600' : 'text-red-600'}`}>
              Wolne miejsca: {parking.wolneMiejsca}
            </p>
            <Link 
              to={`/parking/${parking._id}`}
              className="block w-full text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Rezerwuj
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParkingList;