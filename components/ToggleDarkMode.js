// components/ToggleDarkMode.js
import useDarkMode from "../hooks/useDarkMode";

export default function ToggleDarkMode() {
  const { toggleDarkMode, isDarkMode } = useDarkMode();

  return (
    <div
      onClick={toggleDarkMode}
      className="relative w-14 h-8 rounded-3xl bg-slate-300 dark:bg-gray-600 flex items-center cursor-pointer transition-colors duration-300 border dark:border-gray-500"
    >
      <div
        className={`absolute top-1 rounded-full w-6 h-6 bg-blue-500 dark:bg-blue-400 transition-all duration-300 shadow-md ${
          isDarkMode ? "left-7" : "left-1"
        }`}
      />

      {/* Iconos opcionales */}
      <div className="absolute inset-0 flex items-center justify-between px-2 text-xs">
        <span className="text-gray-600 dark:text-gray-300">☀️</span>
        <span className="text-gray-400 dark:text-gray-200">🌙</span>
      </div>
    </div>
  );
}
