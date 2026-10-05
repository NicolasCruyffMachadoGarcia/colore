import { useState } from 'react';
import { supabase } from '../lib/supabase.js';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Credenciales incorrectas, intenta de nuevo.');
      setLoading(false);
    } else {
      // Si el acceso es exitoso, Supabase guarda el token y redirigimos al panel
      window.location.href = '/admin';
    }
  };

  return (
    <form onSubmit={handleLogin} className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
      <h2 className="text-3xl font-black text-center mb-6 text-slate-800">Acceso Admin</h2>
      
      {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-6 text-sm font-semibold">{error}</div>}

      <div className="mb-4">
        <label className="block text-slate-700 font-bold mb-2">Correo</label>
        <input 
          type="email" 
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="mb-8">
        <label className="block text-slate-700 font-bold mb-2">Contraseña</label>
        <input 
          type="password" 
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-purple-600 transition-colors disabled:bg-slate-400"
      >
        {loading ? 'Verificando...' : 'Entrar al Panel'}
      </button>
    </form>
  );
}