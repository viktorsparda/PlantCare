import React from "react";

export default function SidebarDrawer({ open, onClose, children }) {
  return (
    <>
      {/* Fondo oscuro semitransparente */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-[9998]" onClick={onClose} />
      )}
      {/* Panel lateral derecho */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white dark:bg-gray-900 shadow-2xl z-[9999] transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ maxWidth: 480 }}
      >
        <button
          className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          onClick={onClose}
        >
          ×
        </button>
        <div className="p-6 pt-12 h-full overflow-y-auto">{children}</div>
      </div>
    </>
  );
}
