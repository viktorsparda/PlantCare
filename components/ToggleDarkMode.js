// components/ToggleDarkMode.js
import useDarkMode from "../hooks/useDarkMode";

export default function ToggleDarkMode() {
  const { toggleDarkMode, isDarkMode } = useDarkMode();

  return (
    <div
      onClick={toggleDarkMode}
      className="relative w-14 h-8 rounded-3xl bg-slate-300 dark:bg-zinc-700 flex items-center cursor-pointer transition-colors duration-300"
    >
      <div
        className={`absolute top-1 rounded-full w-6 h-6 bg-blue-500 transition-all duration-300 ${
          isDarkMode ? "left-7" : "left-1"
        }`}
      />
      
      {/* Iconos opcionales */}
      <div className="absolute inset-0 flex items-center justify-between px-2 text-xs">
        <span className="text-gray-600">☀️</span>
        <span className="text-gray-300">🌙</span>
      </div>
    </div>
  );
}