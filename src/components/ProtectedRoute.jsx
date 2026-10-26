import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, roles, retorno }) {
  let usuario = null;

  try {
    usuario = JSON.parse(localStorage.getItem("novaSneakersUsuarioActivo") || "null");
  } catch {
    usuario = null;
  }

  if (!usuario) {
    const destino = retorno ? `/login?retorno=${encodeURIComponent(retorno)}` : "/login";
    return <Navigate to={destino} replace />;
  }

  if (Array.isArray(roles) && roles.length > 0 && !roles.includes(usuario.tipo)) {
    return <Navigate to="/cuenta" replace />;
  }

  return children;
}
