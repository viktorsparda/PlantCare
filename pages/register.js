// pages/register.js
import { useState } from "react";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase.js";
import ToggleDarkMode from "../components/ToggleDarkMode";

export default function Register() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    // Validación de email
    if (!form.email) {
      newErrors.email = "El correo es obligatorio.";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email)) {
      newErrors.email = "Correo inválido.";
    }
    // Validación de contraseña avanzada
    if (!form.password) {
      newErrors.password = "La contraseña es obligatoria.";
    } else {
      if (form.password.length < 6) {
        newErrors.password = "La contraseña debe tener al menos 6 caracteres.";
      } else if (!/[A-Z]/.test(form.password)) {
        newErrors.password = "Debe contener al menos una letra mayúscula.";
      } else if (!/[0-9]/.test(form.password)) {
        newErrors.password = "Debe contener al menos un número.";
      } else if (!/[!@#$%^&*(),.?":{}|<>_\-\\[\]=+;'/`~]/.test(form.password)) {
        newErrors.password = "Debe contener al menos un símbolo especial.";
      }
    }
    return newErrors;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      // Redirigir o mostrar mensaje
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-green-50 dark:bg-gray-900 p-6 transition-colors duration-300 relative">
      {/* Toggle de dark mode en la esquina superior derecha */}
      <div className="absolute top-6 right-6">
        <ToggleDarkMode />
      </div>
      <h1 className="text-3xl font-bold text-green-700 dark:text-green-400 mb-6">
        Crear Cuenta
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 w-full max-w-md space-y-3 border border-green-600 dark:border-none"
      >
        <label
          className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200"
          htmlFor="email"
        >
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="Correo electrónico"
          required
          value={form.email}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-black dark:text-white placeholder-black dark:placeholder-gray-300 bg-white dark:bg-gray-900 ${
            errors.email ? "border-red-500" : ""
          }`}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
        )}
        <label
          className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200 mt-1"
          htmlFor="password"
        >
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          name="password"
          placeholder="Contraseña"
          required
          value={form.password}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-black dark:text-white placeholder-black dark:placeholder-gray-300 bg-white dark:bg-gray-900 ${
            errors.password ? "border-red-500" : ""
          }`}
        />
        <ul className="text-xs text-gray-600 dark:text-gray-400 mb-1 ml-1 space-y-0.5">
          <li>• Mínimo 6 caracteres</li>
          <li>• Al menos una letra mayúscula</li>
          <li>• Al menos un número</li>
          <li>• Al menos un símbolo especial</li>
        </ul>
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password}</p>
        )}
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 mt-2"
        >
          Registrarse
        </button>
        <p className="text-center text-sm text-gray-500 dark:text-gray-300 mt-2">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="text-green-600 dark:text-green-400 hover:underline"
          >
            Inicia sesión
          </Link>
        </p>
      </form>
    </main>
  );
}
