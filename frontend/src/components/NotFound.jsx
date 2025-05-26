// NotFound.jsx
import { Link } from "react-router-dom";
import "../styles/NotFound.css";

const NotFound = () => {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>Oops... La página que estás buscando no existe.</p>
      <Link to="/">Volver al inicio</Link>
    </div>
  );
};

export default NotFound;
