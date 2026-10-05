import { useState } from 'react';

export default function Galeria() {
  const [fotoActiva, setFotoActiva] = useState(0);
  
  // Fotos de prueba (luego las conectaremos a la base de datos)
  const fotos = [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQL9Lb_1AVdYoPQwpqXtRfy03dFWtqJdGlZZweGBQFc8oBfhs51KK3nWl4&s=10",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?auto=format&fit=crop&w=800&q=80"
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h3 className="text-4xl font-black text-center mb-8 text-slate-800">Nuestros Shows</h3>
      
      <div className="rounded-3xl overflow-hidden shadow-2xl mb-6 border-4 border-white aspect-video relative group">
        <img 
          src={fotos[fotoActiva]} 
          alt="Show principal" 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
        />
      </div>

      <div className="flex gap-4 justify-center">
        {fotos.map((foto, index) => (
          <button 
            key={index} 
            onClick={() => setFotoActiva(index)}
            className={`w-28 h-20 rounded-xl overflow-hidden border-4 transition-all duration-300 ${
              fotoActiva === index 
                ? 'border-purple-600 scale-110 shadow-lg shadow-purple-200' 
                : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
            }`}
          >
            <img src={foto} alt={`Miniatura ${index + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}