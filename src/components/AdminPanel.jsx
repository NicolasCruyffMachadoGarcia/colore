import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';

export default function AdminPanel() {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [foto, setFoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  // El "guardia de seguridad": Si no hay token de acceso válido, lo bota al login
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        window.location.href = '/login';
      } else {
        setAuthChecking(false);
      }
    });
  }, []);

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const handleSubirPaquete = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imagen_url = null;

      // 1. Si seleccionó una foto, la subimos al Storage
      if (foto) {
        const fileExt = foto.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`; // Nombre único con la fecha
        
        const { error: uploadError } = await supabase.storage
          .from('shows')
          .upload(fileName, foto);

        if (uploadError) throw uploadError;

        // Extraemos el link público para guardarlo en la base de datos
        const { data } = supabase.storage.from('shows').getPublicUrl(fileName);
        imagen_url = data.publicUrl;
      }

      // 2. Insertamos la fila completa en la tabla paquetes
      const { error: dbError } = await supabase.from('paquetes').insert([
        { nombre, descripcion, precio, imagen_url }
      ]);

      if (dbError) throw dbError;

      alert('¡Paquete de show publicado con éxito!');
      // Limpiamos el formulario
      setNombre(''); setDescripcion(''); setPrecio(''); setFoto(null);
      
    } catch (error) {
      alert('Hubo un error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (authChecking) {
    return <p className="text-center mt-20 text-xl font-bold text-slate-600">Verificando credenciales...</p>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-xl mt-10 border border-slate-100">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h2 className="text-3xl font-black text-slate-800">Gestor de Catálogo</h2>
        <button onClick={handleCerrarSesion} className="text-red-500 font-bold hover:bg-red-50 px-4 py-2 rounded-lg transition-colors">
          Cerrar Sesión
        </button>
      </div>

      <form onSubmit={handleSubirPaquete} className="flex flex-col gap-5">
        <div>
          <label className="block text-slate-700 font-bold mb-2">Nombre del Show</label>
          <input type="text" required value={nombre} onChange={e => setNombre(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-200 outline-none" placeholder="Ej: Paquete Neón" />
        </div>
        
        <div>
          <label className="block text-slate-700 font-bold mb-2">¿Qué incluye?</label>
          <textarea required value={descripcion} onChange={e => setDescripcion(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-200 outline-none" rows="3" placeholder="2 animadores, parlante, hora loca..."></textarea>
        </div>
        
        <div>
          <label className="block text-slate-700 font-bold mb-2">Precio / Tarifa</label>
          <input type="text" required value={precio} onChange={e => setPrecio(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-200 outline-none" placeholder="Ej: S/ 250" />
        </div>
        
        <div>
          <label className="block text-slate-700 font-bold mb-2">Foto promocional</label>
          <input type="file" accept="image/*" onChange={e => setFoto(e.target.files[0])} className="w-full p-3 border border-slate-200 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-purple-600 transition-colors mt-4 disabled:bg-slate-400">
          {loading ? 'Subiendo archivos...' : 'Publicar en la Web'}
        </button>
      </form>
    </div>
  );
}