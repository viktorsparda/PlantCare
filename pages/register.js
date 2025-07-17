// pages/register.js
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../lib/firebase.js";
import ToggleDarkMode from "../components/ToggleDarkMode";
import PasswordRequirements from "../components/PasswordRequirements";
import { FaLeaf, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSpinner, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

export default function Register() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordRequirementsVisible, setPasswordRequirementsVisible] =
    useState(false);

  const validate = () => {
    const newErrors = {};
    // Validación de correo electrónico
    if (!form.email) {
      newErrors.email = "El correo electrónico es obligatorio.";
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(form.email)) {
      newErrors.email =
        "Por favor, introduce una dirección de correo electrónico válida.";
    }

    // Validación de contraseña
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;
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
            <p className="text-sm">
              Revisa tu correo para verificar tu cuenta.
            </p>
            <Link
              href="/login"
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
        case "auth/email-already-in-use":
          friendlyMessage = "Este correo electrónico ya está registrado.";
          break;
        case "auth/weak-password":
          friendlyMessage =
            "La contraseña es demasiado débil. Asegúrate de que cumpla los requisitos.";
          break;
        case "auth/invalid-email":
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
        <span className="text-2xl font-extrabold text-green-700 dark:text-green-400 flex items-center gap-2">
          <FaLeaf /> PlantCare
        </span>
      </div>
      <div className="absolute top-6 right-6">
        <ToggleDarkMode />
      </div>
      <h1 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-6 text-center">
        Crear una Cuenta
      </h1>
      {isSuccess ? (
        <div className="text-center">
          <FaCheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
            ¡Registro Exitoso!
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Hemos enviado un enlace de verificación a{" "}
            <strong>{form.email}</strong>. Por favor, revisa tu correo para
            activar tu cuenta.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
          >
            Ir a Iniciar Sesión
          </Link>
        </div>
      ) : (
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
              onFocus={() => setPasswordRequirementsVisible(true)}
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
          <PasswordRequirements
            password={form.password}
            isVisible={passwordRequirementsVisible}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            {loading ? <FaSpinner className="animate-spin" /> : null}
            {loading ? "Creando cuenta..." : "Crear Cuenta"}
          </button>
        </form>
      )}
      {!isSuccess && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ¿Ya tienes una cuenta?{" "}
            <Link
              href="/login"
              className="font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      )}
    </main>
  );
}
