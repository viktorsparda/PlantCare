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
        {/* Elimina padding top para que el contenido ocupe todo el alto */}
        <div className="p-6 h-full overflow-y-auto scrollbar-none">{children}</div>
        <style jsx global>{`
          .scrollbar-none::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-none {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
    </>
  );
}
