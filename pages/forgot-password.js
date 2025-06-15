// pages/forgot-password.js
import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../lib/firebase.js";
import ToggleDarkMode from "../components/ToggleDarkMode";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    if (!email) {
      setError("Por favor, ingresa tu correo electrónico.");
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.");
    } catch (err) {
      // Firebase devuelve 'auth/user-not-found' si el email no está registrado.
      // Por seguridad, no revelamos si el email existe o no, así que el mensaje de éxito es genérico.
      // Sin embargo, podemos loguear el error específico para debugging o manejar otros errores.
      if (err.code === 'auth/invalid-email') {
        setError("El formato del correo electrónico no es válido.");
      } else {
        // Mensaje genérico para otros errores o si no se quiere revelar si el email existe
        setMessage("Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.");
        console.error("Error al enviar correo de restablecimiento: ", err);
      }
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-green-50 dark:bg-gray-900 p-6 transition-colors duration-300 relative">
      <div className="absolute top-6 right-6">
        <ToggleDarkMode />
      </div>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 w-full max-w-md border border-green-600 dark:border-none">
        <h1 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-6 text-center">
          Restablecer Contraseña
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-black dark:text-white placeholder-black dark:placeholder-gray-300 bg-white dark:bg-gray-900"
            />
          </div>

          {message && <p className="text-sm text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-700/30 p-3 rounded-md">{message}</p>}
          {error && <p className="text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-700/30 p-3 rounded-md">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar Enlace de Restablecimiento"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm">
          <Link href="/login" className="font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300">
            Volver a Iniciar Sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
