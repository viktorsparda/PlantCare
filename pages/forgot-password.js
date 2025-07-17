// pages/forgot-password.js
import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../lib/firebase.js";
import ToggleDarkMode from "../components/ToggleDarkMode";
import { FaLeaf, FaEnvelope, FaArrowLeft, FaSpinner } from 'react-icons/fa';

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) {
      setError("");
    }
  };

  const validate = () => {
    if (!email) {
      setError("El correo electrónico es obligatorio.");
      return false;
    }
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(email)) {
      setError(
        "Por favor, introduce una dirección de correo electrónico válida."
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(
        "Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña."
      );
      setEmail(""); // Limpiar el campo de correo
    } catch (err) {
      // Por seguridad, no revelamos si el email existe o no.
      // Mostramos el mismo mensaje de éxito genérico incluso si hay un error.
      setMessage(
        "Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña."
      );
      console.error("Error al enviar correo de restablecimiento: ", err);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-green-50 dark:bg-gray-900 p-6 transition-colors duration-300 relative">
      <div className="absolute top-4 left-4">
        <span className="text-2xl font-extrabold text-green-700 dark:text-green-400 flex items-center gap-2">
          <FaLeaf /> PlantCare
        </span>
      </div>
      <div className="absolute top-6 right-6">
        <ToggleDarkMode />
      </div>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 w-full max-w-md border border-green-600 dark:border-none">
        <h1 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-6 text-center">
          Restablecer Contraseña
        </h1>
        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={handleChange}
                className={`w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-black dark:text-white placeholder-black dark:placeholder-gray-300 bg-white dark:bg-gray-900 ${
                  error ? "border-red-500" : ""
                }`}
              />
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            {loading ? <FaSpinner className="animate-spin" /> : null}
            {loading ? "Enviando..." : "Enviar Enlace"}
          </button>
        </form>
        {error && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400 text-center">
            {error}
          </p>
        )}
        {message && (
          <p className="mt-4 text-sm text-green-600 dark:text-green-400 text-center">
            {message}
          </p>
        )}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm text-green-600 dark:text-green-400 hover:underline flex items-center justify-center gap-1"
          >
            <FaArrowLeft />
            Volver a inicio de sesión
          </Link>
        </div>
      </div>
    </main>
  );
}
