import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="pie-pagina">
      <div className="contenedor pie-contenido">
        <div>
          <Link to="/" className="logo logo-footer" aria-label="Nova Sneakers, inicio">
            NOVA <span>SNEAKERS</span>
          </Link>
          <p>Tienda online de zapatillas urbanas y deportivas.</p>
        </div>
        <nav className="pie-enlaces" aria-label="Enlaces del pie de página">
          <Link to="/nosotros">Nosotros</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/contacto">Contacto</Link>
          <Link to="/favoritos">Favoritos</Link>
        </nav>
      </div>
      <div className="contenedor copyright">
        <p>© 2026 NOVA SNEAKERS. Proyecto académico DSY1104.</p>
        <small>Las compras son simuladas y no se procesan pagos reales.</small>
      </div>
    </footer>
  );
}
