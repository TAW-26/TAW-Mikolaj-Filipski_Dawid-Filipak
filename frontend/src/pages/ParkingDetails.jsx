import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ParkingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [parking, setParking] = useState(null);
  const [pojazdy, setPojazdy] = useState([]);
  const [formData, setFormData] = useState({ pojazdId: '', dataOd: '', dataDo: '' });

  useEffect(() => {
    // Pobierz szczegóły parkingu [cite: 195]
    fetch(`/api/parkingi/${id}`).then(res => res.json()).then(setParking);
    
    // Pobierz pojazdy użytkownika [cite: 295] (zakładamy, że masz token w localStorage)
    fetch('/api/pojazdy', {
      headers: { 'x-auth-token': localStorage.getItem('token') }
    }).then(res => res.json()).then(setPojazdy);
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/rezerwacje', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({
          parkingId: id,
          pojazdId: formData.pojazdId,
          dataOd: formData.dataOd,
          dataDo: formData.dataDo
        })
      });

      if (response.ok) {
        alert('Rezerwacja przebiegła pomyślnie!');
        navigate('/panel');
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!parking) return <div>Ładowanie...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">{parking.nazwa}</h1>
        <p className="text-gray-700 mb-2"><strong>Adres:</strong> {parking.adres}</p>
        <p className="text-gray-700 mb-2"><strong>Opis:</strong> {parking.opis}</p>
        <p className="text-gray-700 mb-4"><strong>Cena:</strong> {parking.cenaZaGodzine} PLN / godzina</p>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Zarezerwuj miejsce</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Wybierz pojazd</label>
            <select 
              required
              className="w-full border p-2 rounded"
              onChange={(e) => setFormData({...formData, pojazdId: e.target.value})}
            >
              <option value="">-- Wybierz --</option>
              {pojazdy.map(p => (
                <option key={p._id} value={p._id}>{p.marka} {p.model} ({p.numer_rejestracyjny})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data rozpoczęcia</label>
            <input 
              type="datetime-local" 
              required
              className="w-full border p-2 rounded"
              onChange={(e) => setFormData({...formData, dataOd: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data zakończenia</label>
            <input 
              type="datetime-local" 
              required
              className="w-full border p-2 rounded"
              onChange={(e) => setFormData({...formData, dataDo: e.target.value})}
            />
          </div>
          <button type="submit" className="bg-blue-600 text-white font-bold py-2 rounded mt-2 hover:bg-blue-700">
            Potwierdź rezerwację
          </button>
        </form>
      </div>
    </div>
  );
};

export default ParkingDetails;