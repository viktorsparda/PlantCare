import { useState } from "react";
import { FaExclamationTriangle } from 'react-icons/fa';

export default function ConfirmModal({ open, title, description, onConfirm, onCancel, confirmText = "Sí", cancelText = "Cancelar" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 w-full max-w-xs mx-2">
        <div className="flex items-center gap-3 mb-2">
          <FaExclamationTriangle className="text-2xl text-red-500" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h2>
        </div>
        {description && <p className="mb-4 text-gray-700 dark:text-gray-300 text-sm">{description}</p>}
        <div className="flex gap-2 justify-end">
          <button
            className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
