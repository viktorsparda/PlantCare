import Link from "next/link";
import { FaQuestion } from 'react-icons/fa';

const buttonStyle = {
  position: "fixed",
  bottom: "2rem",
  right: "2rem",
  width: "56px",
  height: "56px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, #22c55e 0%, #2563eb 100%)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.5rem",
  fontWeight: 700,
  boxShadow: "0 4px 16px rgba(34,197,94,0.15), 0 1.5px 6px rgba(37,99,235,0.10)",
  zIndex: 1000,
  cursor: "pointer",
  border: "3px solid #fff",
  outline: "2px solid #22c55e",
  outlineOffset: "2px",
  transition: "background 0.2s, box-shadow 0.2s, transform 0.1s",
};

const HelpButton = () => (
  <Link href="/help" legacyBehavior>
    <a
      style={buttonStyle}
      aria-label="Ayuda / FAQ"
      title="Ayuda / FAQ"
      onMouseOver={e => (e.currentTarget.style.transform = "scale(1.08)")}
      onMouseOut={e => (e.currentTarget.style.transform = "scale(1)")}
    >
      <FaQuestion />
    </a>
  </Link>
);

export default HelpButton;
