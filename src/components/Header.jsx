import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

const ENLACES = [
  ["Inicio", "/"],
  ["Productos", "/productos"],
  ["Nosotros", "/nosotros"],
  ["Blog", "/blog"],
  ["Contacto", "/contacto"],
];

export default function Header({ cantidadCarrito = 0 }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [busquedaAbierta, setBusquedaAbierta] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const esInicio = location.pathname === "/";
  const usuarioActivo = leerUsuarioActivo();

  function buscar(evento) {
    evento.preventDefault();
    const termino = busqueda.trim();
    setBusquedaAbierta(false);
    setMenuAbierto(false);
    navigate(termino ? `/productos?q=${encodeURIComponent(termino)}` : "/productos");
  }

  return (
    <header className={`encabezado ${esInicio ? "home-header" : ""}`}>
      <div className="contenedor barra-navegacion">
        <Link className="logo" to="/" aria-label="Nova Sneakers, inicio">
          NOVA <span>SNEAKERS</span>
        </Link>

        <button
          type="button"
          className="menu-toggle"
          aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuAbierto}
          aria-controls="menu-principal"
          onClick={() => setMenuAbierto((abierto) => !abierto)}
        >
          <span /><span /><span />
        </button>

        <nav
          id="menu-principal"
          className={`menu-principal ${menuAbierto ? "menu-abierto" : ""}`}
          aria-label="Navegación principal"
        >
          {ENLACES.map(([texto, ruta]) => (
            <NavLink
              key={ruta}
              to={ruta}
              end={ruta === "/"}
              className={({ isActive }) => isActive ? "activo" : ""}
              onClick={() => setMenuAbierto(false)}
            >
              {texto}
            </NavLink>
          ))}
        </nav>

        <div className="acciones-navegacion">
          {esInicio && (
            <div className="busqueda-header">
              <button
                type="button"
                className="icono-busqueda"
                aria-label="Buscar productos"
                aria-expanded={busquedaAbierta}
                aria-controls="panel-busqueda"
                onClick={() => setBusquedaAbierta((abierta) => !abierta)}
              >⌕</button>
              {busquedaAbierta && (
                <form id="panel-busqueda" className="panel-busqueda form-busqueda-header" onSubmit={buscar}>
                  <label className="sr-only" htmlFor="busqueda-header">Buscar zapatillas</label>
                  <input
                    id="busqueda-header"
                    type="search"
                    value={busqueda}
                    onChange={(evento) => setBusqueda(evento.target.value)}
                    placeholder="Buscar zapatillas..."
                    autoFocus
                  />
                  <button type="submit">Buscar</button>
                </form>
              )}
            </div>
          )}
          {esInicio ? (
            <>
              <Link
                className="boton-carrito"
                to="/carrito"
                aria-label={`Carrito, ${cantidadCarrito} productos`}
              >
                <span className="icono-carrito" aria-hidden="true">🛒</span>
                <span>Carrito</span>
                <span id="contador-carrito">{cantidadCarrito}</span>
              </Link>
              <Link
                className={`enlace-login ${usuarioActivo ? "" : "enlace-login-principal"}`}
                to={usuarioActivo ? "/cuenta" : "/login"}
              >
                {usuarioActivo ? "Mi cuenta" : "Mi cuenta"}
              </Link>
            </>
          ) : (
            <>
              <Link
                className={`enlace-login ${["/login", "/registro", "/cuenta"].includes(location.pathname) ? "activo" : ""}`}
                to={usuarioActivo ? "/cuenta" : "/login"}
              >
                Mi cuenta
              </Link>
              <Link
                className="boton-carrito"
                to="/carrito"
                aria-label={`Carrito, ${cantidadCarrito} productos`}
              >
                <span className="icono-carrito" aria-hidden="true">🛒</span>
                <span>Carrito</span>
                <span id="contador-carrito">{cantidadCarrito}</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function leerUsuarioActivo() {
  try {
    return JSON.parse(localStorage.getItem("novaSneakersUsuarioActivo") || "null");
  } catch {
    return null;
  }
}
