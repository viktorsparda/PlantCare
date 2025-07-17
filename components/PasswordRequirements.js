import React from "react";
import { FaCheck, FaTimes } from 'react-icons/fa';

const Requirement = ({ met, text }) => {
  const icon = met ? (
    <FaCheck className="w-4 h-4 mr-2 text-green-500" />
  ) : (
    <FaTimes className="w-4 h-4 mr-2 text-red-500" />
  );

  return (
    <li
      className={`flex items-center text-sm ${
        met
          ? "text-green-600 dark:text-green-400"
          : "text-red-600 dark:text-red-400"
      }`}
    >
      {icon}
      <span>{text}</span>
    </li>
  );
};

export default function PasswordRequirements({ password, isVisible }) {
  const requirements = [
    { text: "Mínimo 6 caracteres", met: password.length >= 6 },
    { text: "Al menos una letra mayúscula", met: /[A-Z]/.test(password) },
    { text: "Al menos un número", met: /[0-9]/.test(password) },
    {
      text: "Al menos un símbolo especial",
      met: /[!@#$%^&*(),.?":{}|<>_\-\[\]=+;'/`~]/.test(password),
    },
  ];

  return (
    <ul
      className={`space-y-1 mt-2 mb-3 ml-1 transition-all duration-1000 ease-in-out overflow-hidden ${
        isVisible ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      {requirements.map((req, index) => (
        <Requirement key={index} met={req.met} text={req.text} />
      ))}
    </ul>
  );
}
