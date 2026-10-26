import { Link } from "react-router-dom";
import { formatearPrecio } from "../utils/storage.js";

export default function ProductCard({ producto, favorito = false, cantidadEnCarrito = 0, onFavorito, onAgregar }) {
  const imagen = `/${producto.imagen}`;
  return (
    <article className="tarjeta-producto">
      <Link to={`/producto/${producto.codigo}`} className="imagen-producto">
        <img
          src={imagen}
          alt={producto.nombre}
          loading="lazy"
          onError={e => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/img/productos/producto-generico.svg";
          }}
        />
        <span className="etiqueta-imagen">{producto.publico || "Unisex"}</span>
      </Link>
      <div className="contenido-producto">
        <p className="categoria-producto">{producto.categoria} · {producto.publico || "Unisex"}</p>
        <h3>{producto.nombre}</h3>
        <p className="precio-producto">{formatearPrecio(producto.precio)}</p>
        <p className={`stock-producto ${producto.stock === 0 ? "sin-stock" : ""}`}>
          {producto.stock === 0 ? "Sin stock" : `Stock disponible: ${producto.stock}`}
        </p>
        <div className="acciones-producto">
          <Link to={`/producto/${producto.codigo}`} className="boton boton-secundario">Ver detalle</Link>
          <button type="button" className="boton boton-principal" onClick={() => onAgregar?.(producto)} disabled={producto.stock === 0 || cantidadEnCarrito >= producto.stock}>
            {producto.stock === 0 ? "Sin stock" : cantidadEnCarrito >= producto.stock ? "Stock máximo" : "Agregar al carrito"}
          </button>
          <button type="button" className={`boton-favorito ${favorito ? "activo" : ""}`} aria-label={favorito ? `Quitar ${producto.nombre} de favoritos` : `Agregar ${producto.nombre} a favoritos`} aria-pressed={favorito} onClick={() => onFavorito?.(producto)}>{favorito ? "♥" : "♡"}</button>
        </div>
      </div>
    </article>
  );
}
