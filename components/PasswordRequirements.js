import React from 'react';

const Requirement = ({ met, text }) => {
  const icon = met ? (
    <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
  ) : (
    <svg className="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
  );

  return (
    <li className={`flex items-center text-sm ${met ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
      {icon}
      <span>{text}</span>
    </li>
  );
};

export default function PasswordRequirements({ password, isVisible }) {
  const requirements = [
    { text: 'Mínimo 6 caracteres', met: password.length >= 6 },
    { text: 'Al menos una letra mayúscula', met: /[A-Z]/.test(password) },
    { text: 'Al menos un número', met: /[0-9]/.test(password) },
    { text: 'Al menos un símbolo especial', met: /[!@#$%^&*(),.?":{}|<>_\-\[\]=+;'/`~]/.test(password) },
  ];

  return (
    <ul className={`space-y-1 mt-2 mb-3 ml-1 transition-all duration-1000 ease-in-out overflow-hidden ${isVisible ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
      {requirements.map((req, index) => (
        <Requirement key={index} met={req.met} text={req.text} />
      ))}
    </ul>
  );
}
