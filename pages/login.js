// pages/login.js
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase.js";
import ToggleDarkMode from "../components/ToggleDarkMode";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const validate = () => {
    const newErrors = {};
    if (!form.email) {
      newErrors.email = "El correo es obligatorio.";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email)) {
      newErrors.email = "Correo inválido.";
    }
    if (!form.password) {
      newErrors.password = "La contraseña es obligatoria.";
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
      const userCredential = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      router.push("/dashboard");
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
        Iniciar Sesión
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 w-full max-w-md space-y-4 border border-green-600 dark:border-none"
      >
        <input
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
        <input
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
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password}</p>
        )}
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
        >
          Iniciar Sesión
        </button>
        <p className="text-center text-sm text-gray-500 dark:text-gray-300">
          ¿No tienes cuenta?{" "}
          <Link
            href="/register"
            className="text-green-600 dark:text-green-400 hover:underline"
          >
            Regístrate
          </Link>
        </p>
      </form>
    </main>
  );
}
