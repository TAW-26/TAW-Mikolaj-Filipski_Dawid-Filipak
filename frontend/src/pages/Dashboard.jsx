import React, { useEffect, useState } from 'react';

const Dashboard = () => {
  const [rezerwacje, setRezerwacje] = useState([]);

  useEffect(() => {
    fetch('/api/rezerwacje/moje', {
      headers: { 'x-auth-token': localStorage.getItem('token') }
    })
      .then(res => res.json())
      .then(data => setRezerwacje(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto flex gap-8">
      {/* Sidebar */}
      <div className="w-1/4 bg-white border rounded-lg p-4 h-fit shadow-sm">
        <h3 className="font-bold text-lg mb-4">Panel Użytkownika</h3>
        <ul className="flex flex-col gap-2">
          <li className="bg-blue-50 text-blue-700 font-medium p-2 rounded cursor-pointer">Moje Rezerwacje</li>
          <li className="hover:bg-gray-100 p-2 rounded cursor-pointer text-gray-700">Moje Pojazdy</li>
          <li className="hover:bg-gray-100 p-2 rounded cursor-pointer text-gray-700">Ustawienia</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="w-3/4">
        <h2 className="text-2xl font-bold mb-6">Twoje Rezerwacje</h2>
        <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-4">Parking</th>
                <th className="p-4">Od</th>
                <th className="p-4">Do</th>
                <th className="p-4">Status</th>
                <th className="p-4">Koszt</th>
              </tr>
            </thead>
            <tbody>
              {rezerwacje.map(rez => (
                <tr key={rez._id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-4 font-medium">{rez.parkingId?.nazwa}</td>
                  <td className="p-4">{new Date(rez.dataOd).toLocaleString()}</td>
                  <td className="p-4">{new Date(rez.dataDo).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      rez.status === 'aktywna' ? 'bg-green-100 text-green-800' : 
                      rez.status === 'anulowana' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {rez.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 font-bold">{rez.koszt} PLN</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;