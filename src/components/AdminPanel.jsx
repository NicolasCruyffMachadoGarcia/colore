import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';

export default function AdminPanel() {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [foto, setFoto] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  
  // Nuevos estados para el CRUD
  const [paquetes, setPaquetes] = useState([]);
  const [editandoId, setEditandoId] = useState(null); // Si hay un ID aquí, estamos en modo "Edición"

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        window.location.href = '/login';
      } else {
        setAuthChecking(false);
        cargarPaquetes(); // Cargamos los datos apenas valida la sesión
      }
    });
  }, []);

  const cargarPaquetes = async () => {
    const { data, error } = await supabase.from('paquetes').select('*').order('id', { ascending: false });
    if (!error) setPaquetes(data);
  };

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const handleSubirPaquete = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imagen_url = null;

      // Solo subimos foto si seleccionó una nueva
      if (foto) {
        const fileExt = foto.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('shows').upload(fileName, foto);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('shows').getPublicUrl(fileName);
        imagen_url = data.publicUrl;
      }

      if (editandoId) {
        // MODO EDICIÓN (.update)
        const datosActualizados = { nombre, descripcion, precio };
        if (imagen_url) datosActualizados.imagen_url = imagen_url; // Solo actualiza foto si subió una nueva

        const { error: updateError } = await supabase.from('paquetes')
          .update(datosActualizados)
          .eq('id', editandoId);
        if (updateError) throw updateError;
        alert('¡Paquete actualizado con éxito!');
      } else {
        // MODO CREACIÓN (.insert)
        const { error: dbError } = await supabase.from('paquetes')
          .insert([{ nombre, descripcion, precio, imagen_url }]);
        if (dbError) throw dbError;
        alert('¡Paquete publicado con éxito!');
      }

      // Reseteamos el formulario y recargamos la tabla
      cancelarEdicion();
      cargarPaquetes();
      
    } catch (error) {
      alert('Hubo un error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const eliminarPaquete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este paquete?')) return;
    
    // Con esta simple línea borramos el registro
    const { error } = await supabase.from('paquetes').delete().eq('id', id);
    if (error) {
      alert('Error al eliminar: ' + error.message);
    } else {
      cargarPaquetes();
    }
  };

  const prepararEdicion = (paquete) => {
    setEditandoId(paquete.id);
    setNombre(paquete.nombre);
    setDescripcion(paquete.descripcion);
    setPrecio(paquete.precio);
    setFoto(null); // Reseteamos el input file por seguridad
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Subimos la pantalla al formulario
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setNombre(''); setDescripcion(''); setPrecio(''); setFoto(null);
  };

  if (authChecking) return <p className="text-center mt-20 text-xl font-bold text-slate-600">Verificando credenciales...</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10">
      
      {/* FORMULARIO */}
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 mb-10">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h2 className="text-3xl font-black text-slate-800">
            {editandoId ? '✏️ Editando Paquete' : '✨ Nuevo Paquete'}
          </h2>
          <button onClick={handleCerrarSesion} className="text-red-500 font-bold hover:bg-red-50 px-4 py-2 rounded-lg transition-colors">
            Cerrar Sesión
          </button>
        </div>

        <form onSubmit={handleSubirPaquete} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-slate-700 font-bold mb-2">Nombre del Show</label>
              <input type="text" required value={nombre} onChange={e => setNombre(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-200 outline-none" />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-2">Precio / Tarifa</label>
              <input type="text" required value={precio} onChange={e => setPrecio(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-200 outline-none" />
            </div>
          </div>
          
          <div>
            <label className="block text-slate-700 font-bold mb-2">¿Qué incluye?</label>
            <textarea required value={descripcion} onChange={e => setDescripcion(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-200 outline-none" rows="2"></textarea>
          </div>
          
          <div>
            <label className="block text-slate-700 font-bold mb-2">
              {editandoId ? 'Cambiar foto promocional (Opcional)' : 'Foto promocional'}
            </label>
            <input type="file" accept="image/*" required={!editandoId} onChange={e => setFoto(e.target.files[0])} className="w-full p-3 border border-slate-200 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
          </div>

          <div className="flex gap-4 mt-4">
            <button type="submit" disabled={loading} className="flex-1 bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-purple-600 transition-colors disabled:bg-slate-400">
              {loading ? 'Guardando...' : (editandoId ? 'Actualizar Paquete' : 'Publicar en la Web')}
            </button>
            
            {editandoId && (
              <button type="button" onClick={cancelarEdicion} className="px-6 bg-red-100 text-red-600 font-bold rounded-xl hover:bg-red-200 transition-colors">
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* LISTA DE PAQUETES SUBIDOS */}
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <h3 className="text-2xl font-black text-slate-800 mb-6">📦 Paquetes Publicados</h3>
        
        <div className="flex flex-col gap-4">
          {paquetes.length === 0 ? (
            <p className="text-slate-500 text-center py-4">Aún no hay paquetes publicados.</p>
          ) : (
            paquetes.map(paquete => (
              <div key={paquete.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  {paquete.imagen_url && (
                    <img src={paquete.imagen_url} alt="Miniatura" className="w-16 h-16 object-cover rounded-lg" />
                  )}
                  <div>
                    <h4 className="font-bold text-slate-800">{paquete.nombre}</h4>
                    <span className="text-purple-600 font-bold">{paquete.precio}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button onClick={() => prepararEdicion(paquete)} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold hover:bg-blue-200 transition-colors">
                    Editar
                  </button>
                  <button onClick={() => eliminarPaquete(paquete.id)} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-semibold hover:bg-red-200 transition-colors">
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}