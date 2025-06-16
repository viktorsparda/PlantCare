// pages/register.js
import { useState } from "react";
import toast from 'react-hot-toast';
import Link from "next/link";
import { useRouter } from "next/router";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "../lib/firebase.js";
import ToggleDarkMode from "../components/ToggleDarkMode";
import PasswordRequirements from '../components/PasswordRequirements';


export default function Register() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordRequirementsVisible, setPasswordRequirementsVisible] = useState(false);

  const validate = () => {
    const newErrors = {};
    // Validación de correo electrónico
    if (!form.email) {
      newErrors.email = "El correo electrónico es obligatorio.";
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(form.email)) {
      newErrors.email = "Por favor, introduce una dirección de correo electrónico válida.";
    }

    // Validación de contraseña
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;
    if (!form.password) {
      newErrors.password = "La contraseña es obligatoria.";
    } else if (!passwordRegex.test(form.password)) {
      newErrors.password = "La contraseña no cumple con los requisitos.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
    
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const res = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      await sendEmailVerification(res.user);
      setIsSuccess(true);
      toast.success(
        (t) => (
          <div className="text-center">
            <p className="font-bold">¡Cuenta creada con éxito!</p>
            <p className="text-sm">Revisa tu correo para verificar tu cuenta.</p>
            <Link href="/login"
              onClick={() => toast.dismiss(t.id)}
              className="mt-2 block text-sm font-semibold text-green-600 dark:text-green-400 hover:underline"
            >
              Ir a Iniciar Sesión
            </Link>
          </div>
        ),
        { duration: 10000 }
      );
      setForm({ email: "", password: "" }); // Limpiar formulario
      // Opcionalmente, podrías redirigir a una página de "verificación pendiente" o a login con un mensaje.
      // Por ahora, mostramos el mensaje en esta página.
    } catch (error) {
      let friendlyMessage = "Ocurrió un error al registrar la cuenta.";
      switch (error.code) {
        case 'auth/email-already-in-use':
          friendlyMessage = "Este correo electrónico ya está registrado.";
          break;
        case 'auth/weak-password':
          friendlyMessage = "La contraseña es demasiado débil. Asegúrate de que cumpla los requisitos.";
          break;
        case 'auth/invalid-email':
          friendlyMessage = "El formato del correo es inválido.";
          break;
        default:
          console.error("Register error:", error);
      }
      toast.error(friendlyMessage);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-green-50 dark:bg-gray-900 p-6 transition-colors duration-300 relative">
        <div className="absolute top-4 left-4">
          <span className="text-2xl font-extrabold text-green-700 dark:text-green-400">🌱 PlantCare</span>
        </div>
      {/* Toggle de dark mode en la esquina superior derecha */}
      <div className="absolute top-6 right-6">
        <ToggleDarkMode />
      </div>
      <h1 className="text-3xl font-bold text-green-700 dark:text-green-400 mb-6">
        Crear Cuenta
      </h1>
      <form
        noValidate
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 w-full max-w-md space-y-3 border border-green-600 dark:border-none"
      >
        <div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
            </div>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={form.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-black dark:text-white placeholder-black dark:placeholder-gray-300 bg-white dark:bg-gray-900 ${
                errors.email ? "border-red-500" : ""
              }`}
            />
          </div>
          {errors.email && (
            <p data-testid="email-error" className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
            </div>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            onFocus={() => setPasswordRequirementsVisible(true)}
            className={`w-full px-4 py-2 pl-10 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-black dark:text-white placeholder-black dark:placeholder-gray-300 bg-white dark:bg-gray-900 ${
              errors.password ? "border-red-500" : ""
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        </div>
        <PasswordRequirements password={form.password} isVisible={passwordRequirementsVisible} />
        {errors.password && (
          <p data-testid="password-error" className="text-red-500 text-sm mt-1">{errors.password}</p>
        )}
        
        <button
          type="submit"
          disabled={loading || isSuccess} // Deshabilitar si está cargando o si ya se registró
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 mt-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? "Registrando..." : "Registrarse"}
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
