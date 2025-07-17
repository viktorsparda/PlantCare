// pages/login.js
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../lib/firebase.js";
import ToggleDarkMode from "../components/ToggleDarkMode";
import { FaLeaf, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSpinner, FaExclamationCircle } from 'react-icons/fa';

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const user = userCredential.user;
      if (user) {
        await user.reload(); // Forzar la recarga de los datos del usuario
        if (user.emailVerified) {
          toast.success("¡Bienvenido de nuevo!");
          router.push("/dashboard");
        } else {
          toast.error(
            (t) => (
              <div className="text-center">
                <p>Tu correo no ha sido verificado.</p>
                <button
                  className="mt-2 text-sm font-semibold text-green-600 dark:text-green-400 hover:underline"
                  onClick={async () => {
                    try {
                      // Usar el objeto 'user' del ámbito superior que ya está definido
                      await sendEmailVerification(user);
                      toast.success("Correo de verificación reenviado.", {
                        id: t.id,
                      });
                    } catch (err) {
                      toast.error("Error al reenviar el correo.", { id: t.id });
                    }
                  }}
                >
                  Reenviar correo
                </button>
              </div>
            ),
            { duration: 10000 }
          );
        }
      } else {
        // Esto no debería ocurrir si signInWithEmailAndPassword fue exitoso sin error
        toast.error(
          "No se pudo obtener el estado del usuario después del inicio de sesión."
        );
      }
    } catch (error) {
      let friendlyMessage = "Ocurrió un error. Inténtalo de nuevo.";
      switch (error.code) {
        case "auth/invalid-credential":
          friendlyMessage =
            "Correo o contraseña incorrectos. Verifica tus credenciales.";
          break;
        case "auth/user-disabled":
          friendlyMessage = "Esta cuenta ha sido deshabilitada.";
          break;
        case "auth/invalid-email":
          friendlyMessage = "El formato del correo es inválido.";
          break;
        case "auth/too-many-requests":
          friendlyMessage =
            "Demasiados intentos fallidos. Por favor, intenta más tarde.";
          break;
        default:
          console.error(
            "Login error code:",
            error.code,
            "Message:",
            error.message
          );
        // friendlyMessage se mantiene como el genérico
      }
      toast.error(friendlyMessage);
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
      <h1 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-6 text-center">
        Iniciar Sesión
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
              placeholder="Correo electrónico"
              value={form.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-black dark:text-white placeholder-black dark:placeholder-gray-300 bg-white dark:bg-gray-900 ${
                errors.email ? "border-red-500" : ""
              }`}
            />
          </div>
          {errors.email && (
            <p data-testid="email-error" className="text-red-500 text-sm mt-1">
              {errors.email}
            </p>
          )}
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaLock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            className={`w-full px-4 py-2 pl-10 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-black dark:text-white placeholder-black dark:placeholder-gray-300 bg-white dark:bg-gray-900 ${
              errors.password ? "border-red-500" : ""
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
          >
            {showPassword ? (
              <FaEyeSlash className="h-5 w-5" />
            ) : (
              <FaEye className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
            <FaExclamationCircle /> {errors.password}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
            >
              Recuérdame
            </label>
          </div>
          <div className="text-sm">
            <Link
              href="/forgot-password"
              className="font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 disabled:bg-gray-400 flex items-center justify-center gap-2"
        >
          {loading ? <FaSpinner className="animate-spin" /> : null}
          {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </button>
      </form>
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          ¿No tienes una cuenta?{" "}
          <Link
            href="/register"
            className="font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
          >
            Regístrate
          </Link>
        </p>
      </div>
    </main>
  );
}
