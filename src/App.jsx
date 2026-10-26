import { useEffect, useMemo, useState } from "react";
import { Link, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import ProductCard from "./components/ProductCard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { products } from "./data/products.js";
import {
  agregarAlCarrito,
  cambiarCantidad,
  calcularTotal,
  filtrarProductos,
  formatearPrecio,
  guardarStorage,
  leerStorage,
  validarCorreo,
} from "./utils/storage.js";

const CLAVES = {
  carrito: "novaSneakersCarrito",
  favoritos: "novaSneakersFavoritos",
  usuarios: "novaSneakersUsuarios",
  usuarioActivo: "novaSneakersUsuarioActivo",
  pedidos: "novaSneakersPedidos",
};

const REGIONES_COMUNAS = {
  "Región Metropolitana": ["Santiago", "Maipú", "Puente Alto", "La Florida"],
  Valparaíso: ["Valparaíso", "Viña del Mar", "Quilpué", "Villa Alemana"],
  Biobío: ["Concepción", "Talcahuano", "Los Ángeles", "Coronel"],
};

function validarRunChileno(run) {
  const valor = String(run || "").trim().toUpperCase();
  if (!/^\d{7,8}[0-9K]$/.test(valor)) return false;
  const cuerpo = valor.slice(0, -1);
  let suma = 0;
  let multiplicador = 2;
  for (let indice = cuerpo.length - 1; indice >= 0; indice -= 1) {
    suma += Number(cuerpo[indice]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  const resto = 11 - (suma % 11);
  const verificador = resto === 11 ? "0" : resto === 10 ? "K" : String(resto);
  return valor.endsWith(verificador);
}

function useShop() {
  const [carrito, setCarrito] = useState(() => leerStorage(CLAVES.carrito, []));
  const [favoritos, setFavoritos] = useState(() => leerStorage(CLAVES.favoritos, []));
  const [productosTienda, setProductosTienda] = useState(() => {
    const guardados = leerStorage("novaSneakersProductos", null);
    return Array.isArray(guardados) && guardados.length ? guardados : products;
  });

  function agregar(producto) {
    if (!producto || producto.stock <= 0) return;
    setCarrito((actual) => {
      const existente = actual.find((item) => item.codigo === producto.codigo);
      const cantidadActual = existente?.cantidad || 0;
      if (cantidadActual >= producto.stock) return actual;
      const nuevo = agregarAlCarrito(actual, producto);
      guardarStorage(CLAVES.carrito, nuevo);
      return nuevo;
    });
  }

  function favorito(producto) {
    setFavoritos((actual) => {
      const existe = actual.some((item) => item.codigo === producto.codigo);
      const nuevo = existe
        ? actual.filter((item) => item.codigo !== producto.codigo)
        : [...actual, producto];
      guardarStorage(CLAVES.favoritos, nuevo);
      return nuevo;
    });
  }

  function actualizarProductos(nuevosProductos) {
    guardarStorage("novaSneakersProductos", nuevosProductos);
    setProductosTienda(nuevosProductos);
  }

  return {
    carrito,
    setCarrito,
    favoritos,
    agregar,
    favorito,
    productos: productosTienda,
    actualizarProductos,
  };
}

function Layout({ shop, children, wide = false, pageClass = "" }) {
  useEffect(() => {
    const clases = pageClass.split(" ").filter(Boolean);
    clases.forEach((clase) => document.body.classList.add(clase));
    return () => clases.forEach((clase) => document.body.classList.remove(clase));
  }, [pageClass]);
  const cantidadCarrito = shop.carrito.reduce((total, item) => total + (item.cantidad || 1), 0);
  return (
    <div className={pageClass}>
      <a href="#main" className="skip-link">Saltar al contenido principal</a>
      <Header cantidadCarrito={cantidadCarrito} />
      <main id="main" className={wide ? "layout-wide" : "contenedor py-4"}>{children}</main>
      <Footer />
    </div>
  );
}

function Home({ shop }) {
  useEffect(() => {
    document.body.classList.add("home-referencia");
    return () => document.body.classList.remove("home-referencia");
  }, []);

  return (
    <Layout shop={shop} wide pageClass="pagina-inicio">
      <section className="hero-referencia" aria-label="Presentación de NOVA SNEAKERS">
        <div className="hero-ref-main">
          <img src="/img/home/ref-hero-main.jpg" alt="NOVA SNEAKERS: corredor al atardecer" fetchPriority="high" />
          {/* El área clicable cubre solo el botón azul integrado en la imagen. */}
          <Link to="/productos" className="hero-ref-link" aria-label="Ver productos" />
        </div>
        <div className="hero-ref-side" aria-label="Imágenes de la colección y la tienda">
          <div className="hero-ref-panel hero-ref-shoe">
            <img src="/img/home/ref-hero-side-shoe.jpg" alt="Zapatillas de la colección NOVA SNEAKERS" fetchPriority="high" />
          </div>
          <div className="hero-ref-panel hero-ref-store">
            <img src="/img/home/ref-hero-side-store.jpg" alt="Interior de la tienda NOVA SNEAKERS" fetchPriority="high" />
          </div>
        </div>
      </section>

      <section className="home-ref-productos" aria-labelledby="titulo-destacados">
        <div className="contenedor">
          <div className="home-ref-heading">
            <div>
              <h1 id="titulo-destacados">Productos destacados</h1>
              <p>Descubre algunos de nuestros modelos más populares.</p>
            </div>
            <Link to="/productos" className="home-ref-ver-todos">Ver todos los productos <span>→</span></Link>
          </div>
          <div className="home-ref-shop-grid">
            <div className="home-ref-product-grid">
              {shop.productos.slice(0, 4).map((producto) => (
                <ProductCard
                  key={producto.codigo}
                  producto={producto}
                  favorito={shop.favoritos.some((item) => item.codigo === producto.codigo)}
                  cantidadEnCarrito={shop.carrito.find((item) => item.codigo === producto.codigo)?.cantidad || 0}
                  onFavorito={shop.favorito}
                  onAgregar={shop.agregar}
                />
              ))}
            </div>
            <aside className="home-ref-community" aria-label="Comunidad NOVA SNEAKERS">
              <div className="community-top">
                <h2>ÚNETE A<br />NUESTRA COMUNIDAD</h2>
                <p>Novedades, lanzamientos y más.</p>
                <CommunityForm />
              </div>
              <div className="community-image-link">
                <img src="/img/home/ref-community-card.jpg" alt="Estilo, comunidad y movimiento" loading="lazy" />
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="home-ref-beneficios" aria-label="Beneficios de NOVA SNEAKERS">
        <div className="contenedor home-ref-beneficios-grid">
          <div><span className="beneficio-ref-icon" aria-hidden="true">♜</span><div><strong>Calidad garantizada</strong><small>Solo los mejores materiales</small></div></div>
          <div><span className="beneficio-ref-icon" aria-hidden="true">⌁</span><div><strong>Estilo único</strong><small>Diseños que destacan</small></div></div>
          <div><span className="beneficio-ref-icon" aria-hidden="true">♡</span><div><strong>Comunidad</strong><small>Sneakers que nos conectan</small></div></div>
          <div><span className="beneficio-ref-icon" aria-hidden="true">∞</span><div><strong>Pasión sin límites</strong><small>Porque las zapatillas son más que moda</small></div></div>
        </div>
      </section>
    </Layout>
  );
}

function CommunityForm() {
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");

  function enviar(evento) {
    evento.preventDefault();
    if (!validarCorreo(correo)) {
      setMensaje("Ingresa un correo electrónico válido.");
      return;
    }
    const suscripciones = leerStorage("novaSneakersSuscripciones", []);
    if (!suscripciones.includes(correo.trim().toLowerCase())) {
      guardarStorage("novaSneakersSuscripciones", [...suscripciones, correo.trim().toLowerCase()]);
    }
    setMensaje("¡Gracias por unirte a nuestra comunidad!");
    setCorreo("");
  }

  return (
    <form className="community-form" onSubmit={enviar}>
      <label className="sr-only" htmlFor="correo-comunidad">Correo electrónico</label>
      <input id="correo-comunidad" type="email" value={correo} onChange={(evento) => setCorreo(evento.target.value)} placeholder="Tu correo electrónico" required maxLength={100} />
      <button type="submit">Suscribirme</button>
      {mensaje && <p className="community-message" role="status">{mensaje}</p>}
    </form>
  );
}

function Catalog({ shop }) {
  const location = useLocation();
  const queryInicial = new URLSearchParams(location.search).get("q") || "";
  const [texto, setTexto] = useState(queryInicial);
  const [categoria, setCategoria] = useState("Todas");
  const [publico, setPublico] = useState("Todos");
  const [orden, setOrden] = useState("relevancia");
  const [pagina, setPagina] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [visibles, setVisibles] = useState(() => cantidadVisible(window.innerWidth));

  useEffect(() => {
    setTexto(new URLSearchParams(location.search).get("q") || "");
  }, [location.search]);

  useEffect(() => {
    function actualizarVisibles() {
      setVisibles(cantidadVisible(window.innerWidth));
    }
    window.addEventListener("resize", actualizarVisibles);
    return () => window.removeEventListener("resize", actualizarVisibles);
  }, []);

  const lista = useMemo(() => {
    const resultado = filtrarProductos(shop.productos, texto, categoria, publico).slice();
    if (orden === "precio-menor") resultado.sort((a, b) => a.precio - b.precio);
    else if (orden === "precio-mayor") resultado.sort((a, b) => b.precio - a.precio);
    else if (orden === "stock") resultado.sort((a, b) => b.stock - a.stock);
    else resultado.sort((a, b) => a.codigo.localeCompare(b.codigo));
    return resultado;
  }, [shop.productos, texto, categoria, publico, orden]);

  const paginas = useMemo(() => {
    const grupos = [];
    for (let indice = 0; indice < lista.length; indice += visibles) {
      grupos.push(lista.slice(indice, indice + visibles));
    }
    return grupos;
  }, [lista, visibles]);

  useEffect(() => setPagina(0), [texto, categoria, publico, orden, visibles]);
  useEffect(() => {
    if (pausado || paginas.length <= 1) return undefined;
    const intervalo = window.setInterval(() => {
      setPagina((actual) => (actual + 1) % paginas.length);
    }, 4500);
    return () => window.clearInterval(intervalo);
  }, [pausado, paginas.length]);

  const anterior = () => setPagina((actual) => (actual - 1 + paginas.length) % paginas.length);
  const siguiente = () => setPagina((actual) => (actual + 1) % paginas.length);

  return (
    <Layout shop={shop} wide pageClass="pagina-productos">
      <section className="encabezado-pagina catalogo-encabezado">
        <div className="contenedor">
          <p className="etiqueta">COLECCIÓN NOVA</p>
          <h1>Encuentra tu próximo par favorito.</h1>
          <p>Modelos urbanos y deportivos seleccionados para acompañar tu estilo y movimiento.</p>
        </div>
      </section>
      <section className="seccion catalogo react-catalogo">
        <div className="contenedor">
          <div className="catalogo-herramientas">
            <div className="filtros-catalogo-bloque">
              <div className="filtros-publico" aria-label="Filtrar por público">
                <span className="titulo-filtro">Colección</span>
                {["Todos", "Unisex", "Mujer", "Niños"].map((opcion) => (
                  <button type="button" key={opcion} className={`filtro-categoria ${publico === opcion ? "activo" : ""}`} aria-pressed={publico === opcion} onClick={() => setPublico(opcion)}>{opcion}</button>
                ))}
              </div>
              <div className="filtros-categoria" aria-label="Filtrar por tipo de zapatilla">
                <span className="titulo-filtro">Tipo</span>
                {["Todas", "Running", "Urbanas", "Basketball", "Training"].map((opcion) => (
                  <button type="button" key={opcion} className={`filtro-categoria ${categoria === opcion ? "activo" : ""}`} aria-pressed={categoria === opcion} onClick={() => setCategoria(opcion)}>{opcion === "Todas" ? "Todos" : opcion}</button>
                ))}
              </div>
            </div>
            <label className="buscador-catalogo">
              <span className="sr-only">Buscar productos</span>
              <input type="search" value={texto} onChange={(evento) => setTexto(evento.target.value)} placeholder="Buscar producto o código..." autoComplete="off" />
            </label>
            <div className="orden-catalogo">
              <label htmlFor="orden-productos-react">Ordenar</label>
              <select id="orden-productos-react" value={orden} onChange={(evento) => setOrden(evento.target.value)}>
                <option value="relevancia">Relevancia</option>
                <option value="precio-menor">Precio menor a mayor</option>
                <option value="precio-mayor">Precio mayor a menor</option>
                <option value="stock">Mayor disponibilidad</option>
              </select>
            </div>
          </div>
          <p className="catalogo-contador" aria-live="polite">{lista.length} productos encontrados</p>
          {lista.length > 0 ? (
            <>
              <div className="carrusel-productos" aria-label="Carrusel de productos" onMouseEnter={() => setPausado(true)} onMouseLeave={() => setPausado(false)} onFocus={() => setPausado(true)} onBlur={(evento) => { if (!evento.currentTarget.contains(evento.relatedTarget)) setPausado(false); }}>
                <button type="button" className="flecha-carrusel flecha-anterior" onClick={anterior} disabled={paginas.length <= 1} aria-label="Productos anteriores">‹</button>
                <div className="ventana-carrusel" aria-live="polite">
                  <div className="carrusel-pista" style={{ transform: `translate3d(-${pagina * 100}%, 0, 0)` }}>
                    {paginas.map((grupo, indice) => (
                      <div className="pagina-carrusel" key={`${grupo[0]?.codigo || "pagina"}-${indice}`}>
                        {grupo.map((producto) => (
                          <ProductCard key={producto.codigo} producto={producto} favorito={shop.favoritos.some((item) => item.codigo === producto.codigo)} cantidadEnCarrito={shop.carrito.find((item) => item.codigo === producto.codigo)?.cantidad || 0} onFavorito={shop.favorito} onAgregar={shop.agregar} />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                <button type="button" className="flecha-carrusel flecha-siguiente" onClick={siguiente} disabled={paginas.length <= 1} aria-label="Productos siguientes">›</button>
              </div>
              <div className="indicadores-carrusel" aria-label="Páginas del catálogo">
                {paginas.map((grupo, indice) => (
                  <button type="button" key={`indicador-${grupo[0]?.codigo || indice}`} className={`indicador-carrusel ${indice === pagina ? "activo" : ""}`} aria-label={`Ir a la página ${indice + 1}`} aria-current={indice === pagina ? "page" : undefined} onClick={() => setPagina(indice)} />
                ))}
              </div>
            </>
          ) : (
            <div className="estado-vacio-catalogo"><h2>No encontramos productos</h2><p>Prueba con otros filtros o términos de búsqueda.</p><button className="boton boton-principal" type="button" onClick={() => { setTexto(""); setCategoria("Todas"); setPublico("Todos"); }}>Limpiar filtros</button></div>
          )}
        </div>
      </section>
    </Layout>
  );
}

function cantidadVisible(ancho) {
  if (ancho <= 760) return 1;
  if (ancho <= 1000) return 2;
  return 4;
}

function ProductDetail({ shop }) {
  const { codigo } = useParams();
  const producto = shop.productos.find((item) => item.codigo === codigo);
  if (!producto) return <Layout shop={shop}><div className="estado-vacio"><h1>Producto no encontrado</h1><Link className="boton boton-principal" to="/productos">Volver al catálogo</Link></div></Layout>;

  return (
    <Layout shop={shop} pageClass="pagina-detalle">
      <section className="detalle-producto">
        <div className="detalle-imagen"><img src={`/${producto.imagen}`} alt={producto.nombre} /></div>
        <div className="detalle-informacion">
          <p className="etiqueta">{producto.codigo} · {producto.categoria} · {producto.publico}</p>
          <h1>{producto.nombre}</h1>
          <p className="detalle-descripcion">{producto.descripcion}</p>
          <p className="detalle-precio">{formatearPrecio(producto.precio)}</p>
          <div className="datos-producto"><p>{producto.stock > 0 ? `Stock disponible: ${producto.stock}` : "Producto sin stock"}</p><p>Compra académica de demostración; no se procesa un pago real.</p></div>
          <div className="botones-fila">
            <button className="boton boton-principal" type="button" onClick={() => shop.agregar(producto)} disabled={producto.stock <= 0 || (shop.carrito.find((item) => item.codigo === producto.codigo)?.cantidad || 0) >= producto.stock}>Agregar al carrito</button>
            <button className="boton boton-secundario" type="button" onClick={() => shop.favorito(producto)}>{shop.favoritos.some((item) => item.codigo === producto.codigo) ? "Quitar de favoritos" : "Agregar a favoritos"}</button>
          </div>
          <Link className="volver-productos" to="/productos">← Volver a productos</Link>
        </div>
      </section>
    </Layout>
  );
}

function Cart({ shop }) {
  const total = calcularTotal(shop.carrito);
  const cambiar = (codigo, cantidad) => {
    shop.setCarrito((actual) => {
      const producto = shop.productos.find((item) => item.codigo === codigo);
      const segura = Math.min(producto?.stock ?? cantidad, Math.max(0, cantidad));
      const nuevo = cambiarCantidad(actual, codigo, segura);
      guardarStorage(CLAVES.carrito, nuevo);
      return nuevo;
    });
  };

  return (
    <Layout shop={shop} pageClass="pagina-carrito">
      <h1>Carrito de compras</h1>
      {shop.carrito.length === 0 ? (
        <div className="carrito-vacio"><h2>Tu carrito está vacío</h2><p>Explora el catálogo y agrega tus zapatillas favoritas.</p><Link className="boton boton-principal" to="/productos">Ver productos</Link></div>
      ) : (
        <>
          <div className="table-responsive"><table className="table align-middle"><thead><tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th><th>Acción</th></tr></thead><tbody>
            {shop.carrito.map((producto) => <tr key={producto.codigo}>
              <td><Link to={`/producto/${producto.codigo}`}>{producto.nombre}</Link></td>
              <td>{formatearPrecio(producto.precio)}</td>
              <td><input aria-label={`Cantidad de ${producto.nombre}`} type="number" min="1" max={producto.stock} value={producto.cantidad || 1} onChange={(evento) => cambiar(producto.codigo, Number(evento.target.value))} style={{ width: 82 }} /></td>
              <td>{formatearPrecio(producto.precio * (producto.cantidad || 1))}</td>
              <td><button className="boton boton-secundario" type="button" onClick={() => cambiar(producto.codigo, 0)}>Quitar</button></td>
            </tr>)}
          </tbody></table></div>
          <div className="resumen-carrito"><div><span>Total</span><strong>{formatearPrecio(total)}</strong></div><Link className="boton boton-principal" to="/checkout">Continuar compra</Link><Link className="enlace" to="/productos">Seguir comprando</Link></div>
        </>
      )}
    </Layout>
  );
}

function Favorites({ shop }) {
  return <Layout shop={shop} pageClass="pagina-favoritos"><h1>Mis favoritos</h1>{shop.favoritos.length === 0 ? <div className="estado-vacio"><p>Todavía no tienes favoritos.</p><Link className="boton boton-principal" to="/productos">Explorar productos</Link></div> : <div className="grid-productos">{shop.favoritos.map((producto) => <ProductCard key={producto.codigo} producto={producto} favorito cantidadEnCarrito={shop.carrito.find((item) => item.codigo === producto.codigo)?.cantidad || 0} onFavorito={shop.favorito} onAgregar={shop.agregar} />)}</div>}</Layout>;
}

function Login({ shop }) {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Usuarios de demostración equivalentes a los de la EA1.
  function obtenerUsuariosParaLogin() {
    const demos = [
      {
        nombre: "Administrador",
        apellidos: "NOVA",
        correo: "admin@gmail.com",
        password: "1234",
        contrasena: "1234",
        tipo: "Administrador",
        region: "Región Metropolitana",
        comuna: "Santiago",
        direccion: "Dirección de demostración",
      },
      {
        nombre: "Vendedor",
        apellidos: "NOVA",
        correo: "vendedor@gmail.com",
        password: "1234",
        contrasena: "1234",
        tipo: "Vendedor",
        region: "Región Metropolitana",
        comuna: "Maipú",
        direccion: "Dirección de demostración",
      },
      {
        nombre: "Cliente",
        apellidos: "NOVA",
        correo: "cliente@gmail.com",
        password: "1234",
        contrasena: "1234",
        tipo: "Cliente",
        region: "Región Metropolitana",
        comuna: "La Florida",
        direccion: "Dirección de demostración",
      },
    ];

    const guardados = leerStorage(CLAVES.usuarios, []);
    const usuarios = Array.isArray(guardados) ? [...guardados] : [];
    let seAgregaronDemos = false;

    demos.forEach((demo) => {
      if (!usuarios.some((usuario) => usuario.correo?.toLowerCase() === demo.correo)) {
        usuarios.push(demo);
        seAgregaronDemos = true;
      }
    });

    if (seAgregaronDemos || !Array.isArray(guardados)) {
      guardarStorage(CLAVES.usuarios, usuarios);
    }

    return usuarios;
  }

  function validarFormulario() {
    const nuevosErrores = {};
    const correoLimpio = correo.trim().toLowerCase();
    const dominio = correoLimpio.split("@")[1];

    if (!correoLimpio) {
      nuevosErrores.correo = "El correo es requerido.";
    } else if (correoLimpio.length > 100 || !validarCorreo(correoLimpio)) {
      nuevosErrores.correo = "Ingresa un correo electrónico válido.";
    } else if (!["duoc.cl", "profesor.duoc.cl", "gmail.com"].includes(dominio)) {
      nuevosErrores.correo = "Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.";
    }

    if (!password) {
      nuevosErrores.password = "La contraseña es requerida.";
    } else if (password.length < 4 || password.length > 10) {
      nuevosErrores.password = "La contraseña debe tener entre 4 y 10 caracteres.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  function enviar(evento) {
    evento.preventDefault();
    setMensaje("");

    if (!validarFormulario()) {
      setMensaje("Revisa los datos ingresados.");
      return;
    }

    const usuarios = obtenerUsuariosParaLogin();
    const correoNormalizado = correo.trim().toLowerCase();
    const usuario = usuarios.find((item) =>
      item.correo?.toLowerCase() === correoNormalizado &&
      (item.password ?? item.contrasena) === password
    );

    if (!usuario) {
      setMensaje("Correo o contraseña incorrectos.");
      return;
    }

    const usuarioActivo = {
      nombre: usuario.nombre || "Usuario",
      apellidos: usuario.apellidos || "",
      correo: usuario.correo,
      tipo: usuario.tipo || "Cliente",
      region: usuario.region || "",
      comuna: usuario.comuna || "",
      direccion: usuario.direccion || "",
    };
    guardarStorage(CLAVES.usuarioActivo, usuarioActivo);
    setMensaje(`Sesión iniciada como ${usuarioActivo.tipo}.`);

    const retorno = new URLSearchParams(location.search).get("retorno");
    if (usuarioActivo.tipo === "Administrador" || usuarioActivo.tipo === "Vendedor") {
      navigate("/admin");
    } else if (retorno === "checkout") {
      navigate("/checkout");
    } else {
      navigate("/cuenta");
    }
  }

  return (
    <Layout shop={shop} wide pageClass="pagina-login">
      <section className="encabezado-pagina login-encabezado">
        <div className="contenedor">
          <p className="etiqueta">NOVA SNEAKERS</p>
          <h1>Iniciar sesión</h1>
          <p>Ingresa con tu correo y contraseña.</p>
        </div>
      </section>

      <section className="seccion login-seccion">
        <div className="contenedor login-layout">
          <div className="login-card">
            <form id="formulario-login" className="formulario" onSubmit={enviar} noValidate>
              <div className="marca-login">
                <div className="logo-grande">NOVA <span>SNEAKERS</span></div>
                <p>Acceso a la tienda</p>
              </div>

              <div className="campo">
                <label htmlFor="login-correo">Correo *</label>
                <input
                  id="login-correo"
                  name="correo"
                  type="email"
                  autoComplete="email"
                  maxLength={100}
                  placeholder="nombre@gmail.com"
                  value={correo}
                  onChange={(evento) => {
                    setCorreo(evento.target.value);
                    setErrores((actuales) => ({ ...actuales, correo: "" }));
                    setMensaje("");
                  }}
                  aria-invalid={Boolean(errores.correo)}
                  aria-describedby={errores.correo ? "login-correo-error" : undefined}
                />
                {errores.correo && <small id="login-correo-error" className="error">{errores.correo}</small>}
              </div>

              <div className="campo">
                <label htmlFor="login-password">Contraseña *</label>
                <div className="campo-password">
                  <input
                    id="login-password"
                    name="password"
                    type={mostrarPassword ? "text" : "password"}
                    autoComplete="current-password"
                    minLength={4}
                    maxLength={10}
                    value={password}
                    onChange={(evento) => {
                      setPassword(evento.target.value);
                      setErrores((actuales) => ({ ...actuales, password: "" }));
                      setMensaje("");
                    }}
                    aria-invalid={Boolean(errores.password)}
                    aria-describedby={errores.password ? "login-password-error" : undefined}
                  />
                  <button
                    type="button"
                    className="boton-ojo"
                    aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    onClick={() => setMostrarPassword((visible) => !visible)}
                  >
                    👁
                  </button>
                </div>
                {errores.password && <small id="login-password-error" className="error">{errores.password}</small>}
              </div>

              <button type="submit" className="boton boton-principal">Iniciar sesión</button>
              {mensaje && <p className="mensaje-formulario" role="status">{mensaje}</p>}
              <p className="registro-invitacion">¿Eres nuevo? <Link to="/registro">Regístrate aquí</Link></p>
              <p className="texto-ayuda">Demo: admin@gmail.com, vendedor@gmail.com o cliente@gmail.com. Contraseña: 1234.</p>
            </form>
          </div>

          <aside className="login-promocion" aria-label="Productos destacados">
            <span className="login-promocion-etiqueta">NUEVA COLECCIÓN</span>
            <h2>Tu próximo par está aquí.</h2>
            <p>Explora nuestras zapatillas urbanas y deportivas.</p>
            <Link className="login-promocion-imagen" to="/productos" aria-label="Ver productos">
              <img src="/img/productos/nova-motion-orange-v2.jpg" alt="Zapatilla Nova Motion naranja" />
            </Link>
            <div className="login-promocion-pie">
              <strong>Nova Motion</strong>
              <span>$74.990</span>
            </div>
            <Link className="login-promocion-link" to="/productos">Ver colección →</Link>
          </aside>
        </div>
      </section>
    </Layout>
  );
}

function Register({ shop }) {
  const inicial = { run: "", nombre: "", apellidos: "", correo: "", password: "", confirmarPassword: "", fechaNacimiento: "", region: "", comuna: "", direccion: "" };
  const [datos, setDatos] = useState(inicial);
  const [errores, setErrores] = useState({});
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [exito, setExito] = useState("");

  function cambiar(evento) {
    const { name, value } = evento.target;
    setDatos((actual) => ({ ...actual, [name]: value, ...(name === "region" ? { comuna: "" } : {}) }));
    setErrores((actual) => ({ ...actual, [name]: "", ...(name === "region" ? { comuna: "" } : {}) }));
    setExito("");
  }

  function validar() {
    const nuevos = {};
    const run = datos.run.trim().toUpperCase();
    const correo = datos.correo.trim().toLowerCase();
    if (!run) nuevos.run = "El RUN es requerido.";
    else if (/[.\-\s]/.test(run)) nuevos.run = "Ingresa el RUN sin puntos ni guion.";
    else if (!validarRunChileno(run)) nuevos.run = "El RUN no es válido. Revisa el dígito verificador.";
    if (!datos.nombre.trim()) nuevos.nombre = "El nombre es requerido.";
    else if (datos.nombre.trim().length > 50) nuevos.nombre = "El nombre no puede superar los 50 caracteres.";
    if (!datos.apellidos.trim()) nuevos.apellidos = "Los apellidos son requeridos.";
    else if (datos.apellidos.trim().length > 100) nuevos.apellidos = "Los apellidos no pueden superar los 100 caracteres.";
    if (!correo) nuevos.correo = "El correo es requerido.";
    else if (correo.length > 100 || !validarCorreo(correo)) nuevos.correo = "Ingresa un correo electrónico válido.";
    else if (!["duoc.cl", "profesor.duoc.cl", "gmail.com"].includes(correo.split("@")[1])) nuevos.correo = "Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.";
    if (datos.password.length < 4 || datos.password.length > 10) nuevos.password = "La contraseña debe tener entre 4 y 10 caracteres.";
    if (!datos.confirmarPassword) nuevos.confirmarPassword = "Debes confirmar la contraseña.";
    else if (datos.password !== datos.confirmarPassword) nuevos.confirmarPassword = "Las contraseñas no coinciden.";
    if (datos.fechaNacimiento && datos.fechaNacimiento > new Date().toISOString().slice(0, 10)) nuevos.fechaNacimiento = "La fecha de nacimiento no puede ser futura.";
    if (!datos.region) nuevos.region = "Selecciona una región.";
    if (!datos.comuna) nuevos.comuna = "Selecciona una comuna.";
    if (!datos.direccion.trim()) nuevos.direccion = "La dirección es requerida.";
    else if (datos.direccion.trim().length > 300) nuevos.direccion = "La dirección no puede superar los 300 caracteres.";
    const usuarios = leerStorage(CLAVES.usuarios, []);
    if (usuarios.some((usuario) => usuario.correo?.toLowerCase() === correo || usuario.run === run)) {
      if (usuarios.some((usuario) => usuario.correo?.toLowerCase() === correo)) nuevos.correo = "Ya existe un usuario con ese correo.";
      if (usuarios.some((usuario) => usuario.run === run)) nuevos.run = "Ya existe un usuario con ese RUN.";
    }
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  }

  function enviar(evento) {
    evento.preventDefault();
    setExito("");
    if (!validar()) return;
    const usuarios = leerStorage(CLAVES.usuarios, []);
    const nuevoUsuario = {
      run: datos.run.trim().toUpperCase(),
      nombre: datos.nombre.trim(),
      apellidos: datos.apellidos.trim(),
      correo: datos.correo.trim().toLowerCase(),
      password: datos.password,
      contrasena: datos.password,
      fechaNacimiento: datos.fechaNacimiento,
      tipo: "Cliente",
      region: datos.region,
      comuna: datos.comuna,
      direccion: datos.direccion.trim(),
    };
    guardarStorage(CLAVES.usuarios, [...usuarios, nuevoUsuario]);
    setDatos(inicial);
    setErrores({});
    setExito("Registro completado correctamente. Ya puedes iniciar sesión.");
  }

  const campo = (nombre, etiqueta, props = {}) => (
    <div className={`campo ${props.completo ? "campo-completo" : ""}`} key={nombre}>
      <label htmlFor={`registro-${nombre}`}>{etiqueta}</label>
      {props.tipo === "select" ? (
        <select id={`registro-${nombre}`} name={nombre} value={datos[nombre]} onChange={cambiar} aria-invalid={Boolean(errores[nombre])}>
          <option value="">{props.placeholder || "Selecciona una opción"}</option>
          {props.opciones.map((opcion) => <option key={opcion} value={opcion}>{opcion}</option>)}
        </select>
      ) : <input id={`registro-${nombre}`} name={nombre} type={props.tipo || "text"} value={datos[nombre]} onChange={cambiar} maxLength={props.maxLength} autoComplete={props.autoComplete} max={props.max} aria-invalid={Boolean(errores[nombre])} placeholder={props.placeholder || ""} />}
      {errores[nombre] && <small className="error" role="alert">{errores[nombre]}</small>}
    </div>
  );

  return <Layout shop={shop} wide pageClass="pagina-registro">
    <PageHeading titulo="Crear cuenta" etiqueta="NOVA SNEAKERS" descripcion="Completa tus datos para registrarte en la tienda." />
    <section className="seccion registro-seccion"><div className="contenedor registro-contenedor">
      <form className="formulario registro-formulario" onSubmit={enviar} noValidate>
        <div className="grid-formulario">
          {campo("run", "RUN *", { maxLength: 9, placeholder: "123456785" })}
          {campo("nombre", "Nombre *", { maxLength: 50, autoComplete: "given-name" })}
          {campo("apellidos", "Apellidos *", { maxLength: 100, autoComplete: "family-name" })}
          {campo("correo", "Correo *", { tipo: "email", maxLength: 100, autoComplete: "email", placeholder: "nombre@gmail.com" })}
          <div className="campo">
            <label htmlFor="registro-password">Contraseña *</label>
            <div className="campo-password"><input id="registro-password" name="password" type={mostrarPassword ? "text" : "password"} minLength={4} maxLength={10} autoComplete="new-password" value={datos.password} onChange={cambiar} aria-invalid={Boolean(errores.password)} /><button type="button" className="boton-ojo" aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"} onClick={() => setMostrarPassword((visible) => !visible)}>{mostrarPassword ? "🙈" : "👁"}</button></div>
            <small className="ayuda-password">Entre 4 y 10 caracteres.</small>{errores.password && <small className="error" role="alert">{errores.password}</small>}
          </div>
          <div className="campo">
            <label htmlFor="registro-confirmarPassword">Confirmar contraseña *</label>
            <input id="registro-confirmarPassword" name="confirmarPassword" type={mostrarPassword ? "text" : "password"} minLength={4} maxLength={10} autoComplete="new-password" value={datos.confirmarPassword} onChange={cambiar} aria-invalid={Boolean(errores.confirmarPassword)} />
            {errores.confirmarPassword && <small className="error" role="alert">{errores.confirmarPassword}</small>}
          </div>
          {campo("fechaNacimiento", "Fecha de nacimiento", { tipo: "date", max: new Date().toISOString().slice(0, 10), autoComplete: "bday" })}
          {campo("region", "Región *", { tipo: "select", opciones: Object.keys(REGIONES_COMUNAS), placeholder: "Selecciona una región" })}
          {campo("comuna", "Comuna *", { tipo: "select", opciones: REGIONES_COMUNAS[datos.region] || [], placeholder: datos.region ? "Selecciona una comuna" : "Primero selecciona una región" })}
          <div className="campo campo-completo"><label htmlFor="registro-direccion">Dirección *</label><textarea id="registro-direccion" name="direccion" rows={3} maxLength={300} autoComplete="street-address" value={datos.direccion} onChange={cambiar} aria-invalid={Boolean(errores.direccion)} placeholder="Ingresa tu dirección" />{errores.direccion && <small className="error" role="alert">{errores.direccion}</small>}</div>
        </div>
        <button className="boton boton-principal" type="submit">Crear cuenta</button>
        {exito && <p className="mensaje-formulario" role="status">{exito}</p>}
        <p className="registro-invitacion">¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link></p>
      </form>
    </div></section>
  </Layout>;
}

function Account({ shop }) {
  const usuario = leerStorage(CLAVES.usuarioActivo, null);
  const navigate = useNavigate();
  const pedidos = leerStorage(CLAVES.pedidos, []).filter((pedido) => pedido.correo?.toLowerCase() === usuario?.correo?.toLowerCase());

  function cerrarSesion() {
    localStorage.removeItem(CLAVES.usuarioActivo);
    navigate("/");
  }

  return <Layout shop={shop} wide pageClass="pagina-cuenta">
    <PageHeading titulo="Mi cuenta" etiqueta="TU PERFIL NOVA" descripcion="Consulta tus datos, favoritos y compras registradas en esta demostración." />
    <section className="seccion"><div className="contenedor cuenta-grid">
      <aside className="cuenta-card">
        <p className="etiqueta">MIS DATOS</p>
        {usuario ? <>
          <h2>Hola, {usuario.nombre || "Usuario"}.</h2>
          <p><strong>Nombre completo</strong><span>{[usuario.nombre, usuario.apellidos].filter(Boolean).join(" ")}</span></p>
          <p><strong>Correo</strong><span>{usuario.correo}</span></p>
          <p><strong>Perfil</strong><span>{usuario.tipo || "Cliente"}</span></p>
          <p><strong>RUN</strong><span>{usuario.run || "No registrado"}</span></p>
          <p><strong>Dirección</strong><span>{[usuario.direccion, usuario.comuna, usuario.region].filter(Boolean).join(", ") || "No registrada"}</span></p>
          <p><strong>Favoritos guardados</strong><span>{shop.favoritos.length}</span></p>
          <div className="cuenta-acciones"><Link className="boton boton-secundario" to="/favoritos">Mis favoritos</Link><Link className="boton boton-secundario" to="/carrito">Mi carrito</Link><button className="boton boton-principal" type="button" onClick={cerrarSesion}>Cerrar sesión</button></div>
        </> : <><p>Inicia sesión para ver tu cuenta.</p><Link className="boton boton-principal" to="/login">Iniciar sesión</Link></>}
      </aside>
      <section className="cuenta-card cuenta-pedidos"><div className="encabezado-seccion"><div><p className="etiqueta">HISTORIAL</p><h2>Mis pedidos</h2></div><span>{pedidos.length} pedidos</span></div>
        {pedidos.length ? pedidos.slice().reverse().map((pedido) => {
          const id = pedido.id || pedido.numero;
          const items = pedido.items || pedido.productos || [];
          return <article className="fila-cuenta" key={id}><div><strong>{id}</strong><span>{pedido.fecha ? new Date(pedido.fecha).toLocaleDateString("es-CL") : "Fecha no disponible"}</span></div><div><strong>{formatearPrecio(pedido.total)}</strong><span>{items.length} productos</span></div><div><strong>{pedido.estado || "Pendiente"}</strong><span>{pedido.metodoPago || "Compra demostrativa"}</span></div></article>;
        }) : <div className="estado-vacio"><p>Aún no tienes pedidos registrados.</p><Link className="boton boton-principal" to="/productos">Explorar productos</Link></div>}
      </section>
    </div></section>
  </Layout>;
}

function Checkout({ shop }) {
  const usuarioActivo = leerStorage(CLAVES.usuarioActivo, null);
  const [datos, setDatos] = useState(() => ({
    nombre: [usuarioActivo?.nombre, usuarioActivo?.apellidos].filter(Boolean).join(" "),
    correo: usuarioActivo?.correo || "",
    region: usuarioActivo?.region || "",
    comuna: usuarioActivo?.comuna || "",
    direccion: usuarioActivo?.direccion || "",
    metodoPago: "",
    terminos: false,
  }));
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [pedidoCreado, setPedidoCreado] = useState(null);

  function cambiar(evento) {
    const { name, value, checked, type } = evento.target;
    setDatos((actual) => ({ ...actual, [name]: type === "checkbox" ? checked : value, ...(name === "region" ? { comuna: "" } : {}) }));
    setErrores((actual) => ({ ...actual, [name]: "", ...(name === "region" ? { comuna: "" } : {}) }));
    setMensaje("");
  }

  function enviar(evento) {
    evento.preventDefault();
    const nuevos = {};
    if (!datos.nombre.trim()) nuevos.nombre = "Ingresa tu nombre.";
    if (!validarCorreo(datos.correo.trim())) nuevos.correo = "Ingresa un correo válido.";
    else if (!["duoc.cl", "profesor.duoc.cl", "gmail.com"].includes(datos.correo.trim().toLowerCase().split("@")[1])) nuevos.correo = "Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.";
    if (!datos.region) nuevos.region = "Selecciona una región.";
    if (!datos.comuna) nuevos.comuna = "Selecciona una comuna.";
    if (!datos.direccion.trim()) nuevos.direccion = "La dirección es obligatoria.";
    if (!datos.metodoPago) nuevos.metodoPago = "Selecciona un método de pago.";
    if (!datos.terminos) nuevos.terminos = "Debes aceptar las condiciones de la compra simulada.";
    if (!shop.carrito.length) nuevos.carrito = "Agrega un producto antes de continuar.";
    const stockInsuficiente = shop.carrito.some((item) => {
      const productoActual = shop.productos.find((producto) => producto.codigo === item.codigo);
      return !productoActual || item.cantidad > productoActual.stock;
    });
    if (stockInsuficiente) nuevos.stock = "El stock cambió y no alcanza para completar el pedido. Revisa el catálogo.";
    setErrores(nuevos);
    if (Object.keys(nuevos).length) { setMensaje("Revisa los datos marcados antes de confirmar."); return; }

    const id = `PED-${Date.now().toString().slice(-8)}`;
    const pedido = {
      id, numero: id, nombre: datos.nombre.trim(), correo: datos.correo.trim().toLowerCase(),
      items: shop.carrito.map((item) => ({ ...item })), total: calcularTotal(shop.carrito),
      fecha: new Date().toISOString(), estado: "Pendiente", metodoPago: datos.metodoPago,
      direccion: datos.direccion.trim(), region: datos.region, comuna: datos.comuna,
    };
    const productosActualizados = shop.productos.map((producto) => {
      const item = shop.carrito.find((linea) => linea.codigo === producto.codigo);
      return item ? { ...producto, stock: Math.max(0, producto.stock - item.cantidad) } : producto;
    });
    shop.actualizarProductos(productosActualizados);
    guardarStorage(CLAVES.pedidos, [...leerStorage(CLAVES.pedidos, []), pedido]);
    guardarStorage(CLAVES.carrito, []);
    shop.setCarrito([]);
    setPedidoCreado(pedido);
    setMensaje(`Compra simulada completada. Número de pedido: ${id}. No se realizó ningún pago real.`);
  }

  return <Layout shop={shop} wide pageClass="pagina-checkout">
    <PageHeading titulo="Finalizar compra" etiqueta="NOVA SNEAKERS" descripcion="Completa tus datos para registrar tu pedido de forma segura." />
    <section className="seccion"><div className="contenedor checkout-grid">
      {pedidoCreado ? <section className="confirmacion-checkout" role="status"><div className="confirmacion-icono">✓</div><p className="etiqueta">COMPRA SIMULADA CONFIRMADA</p><h2>Gracias por tu compra</h2><p>Tu pedido <strong>{pedidoCreado.id}</strong> fue registrado correctamente.</p><div className="confirmacion-datos"><span>Total</span><strong>{formatearPrecio(pedidoCreado.total)}</strong><span>Estado</span><strong>{pedidoCreado.estado}</strong></div><p className="texto-ayuda">Esta demostración no realiza cobros reales. El pedido queda disponible en el panel administrativo.</p><div className="botones-fila"><Link className="boton boton-principal" to="/cuenta">Ver mi cuenta</Link><Link className="boton boton-secundario" to="/productos">Seguir comprando</Link></div></section> : <>
        <form className="formulario checkout-form" onSubmit={enviar} noValidate>
          <section className="checkout-seccion"><h2>1. Datos de contacto</h2><div className="grid-formulario">
            <div className="campo"><label htmlFor="checkout-nombre">Nombre completo *</label><input id="checkout-nombre" name="nombre" autoComplete="name" maxLength={150} value={datos.nombre} onChange={cambiar} />{errores.nombre && <small className="error" role="alert">{errores.nombre}</small>}</div>
            <div className="campo"><label htmlFor="checkout-correo">Correo electrónico *</label><input id="checkout-correo" name="correo" type="email" autoComplete="email" maxLength={100} value={datos.correo} onChange={cambiar} />{errores.correo && <small className="error" role="alert">{errores.correo}</small>}</div>
          </div></section>
          <section className="checkout-seccion"><h2>2. Datos de despacho</h2><div className="grid-formulario">
            <div className="campo"><label htmlFor="checkout-region">Región *</label><select id="checkout-region" name="region" value={datos.region} onChange={cambiar}><option value="">Selecciona una región</option>{Object.keys(REGIONES_COMUNAS).map((region) => <option key={region}>{region}</option>)}</select>{errores.region && <small className="error" role="alert">{errores.region}</small>}</div>
            <div className="campo"><label htmlFor="checkout-comuna">Comuna *</label><select id="checkout-comuna" name="comuna" value={datos.comuna} onChange={cambiar} disabled={!datos.region}><option value="">Selecciona una comuna</option>{(REGIONES_COMUNAS[datos.region] || []).map((comuna) => <option key={comuna}>{comuna}</option>)}</select>{errores.comuna && <small className="error" role="alert">{errores.comuna}</small>}</div>
            <div className="campo campo-completo"><label htmlFor="checkout-direccion">Dirección *</label><textarea id="checkout-direccion" name="direccion" rows={3} maxLength={300} autoComplete="street-address" value={datos.direccion} onChange={cambiar} />{errores.direccion && <small className="error" role="alert">{errores.direccion}</small>}</div>
          </div></section>
          <section className="checkout-seccion"><h2>3. Método de pago</h2><div className="campo"><label htmlFor="checkout-metodoPago">Método de pago *</label><select id="checkout-metodoPago" name="metodoPago" value={datos.metodoPago} onChange={cambiar}><option value="">Selecciona un método</option><option value="Tarjeta de crédito (simulada)">Tarjeta de crédito (simulada)</option><option value="Tarjeta de débito (simulada)">Tarjeta de débito (simulada)</option><option value="Transferencia (simulada)">Transferencia (simulada)</option></select>{errores.metodoPago && <small className="error" role="alert">{errores.metodoPago}</small>}</div>
            <label className="check-line"><input type="checkbox" name="terminos" checked={datos.terminos} onChange={cambiar} /> <span>Acepto que esta compra es una simulación académica y que no se realizará ningún cobro real.</span></label>{errores.terminos && <small className="error" role="alert">{errores.terminos}</small>}
          </section>
          {errores.carrito && <p className="error" role="alert">{errores.carrito}</p>}{errores.stock && <p className="error" role="alert">{errores.stock}</p>}
          <button className="boton boton-principal" type="submit">Confirmar compra simulada</button>{mensaje && <p className="mensaje-formulario" role="status">{mensaje}</p>}
        </form>
        <aside className="checkout-resumen"><h2>Resumen de compra</h2>{shop.carrito.length ? shop.carrito.map((item) => <div className="checkout-item" key={item.codigo}><img src={`/${item.imagen}`} alt={item.nombre} /><div><strong>{item.nombre}</strong><span>{item.cantidad || 1} × {formatearPrecio(item.precio)}</span></div><strong>{formatearPrecio(item.precio * (item.cantidad || 1))}</strong></div>) : <p>Tu carrito está vacío.</p>}<div className="checkout-total"><span>Total</span><strong>{formatearPrecio(calcularTotal(shop.carrito))}</strong></div><Link to="/carrito" className="enlace">Volver al carrito</Link></aside>
      </>}
    </div></section>
  </Layout>;
}

function Nosotros({ shop }) {
  return <Layout shop={shop} wide pageClass="pagina-nosotros">
    <section className="nosotros-v8">
      <div className="nosotros-v8-principal">
        <div className="nosotros-v8-imagen"><img src="/img/nosotros/nosotros-tienda-hd.jpg" alt="Interior de la tienda NOVA SNEAKERS" /></div>
        <div className="nosotros-v8-info"><p className="etiqueta">SOBRE NOVA SNEAKERS</p><h1>Más que zapatillas,<br /><span>una forma de vida.</span></h1><p>Una propuesta de tienda online de zapatillas urbanas y deportivas, pensada para ofrecer una experiencia simple, clara y fácil de recorrer.</p><p>El proyecto está desarrollado con <strong>React, HTML5 y CSS3</strong>, incorporando catálogo, detalle de productos, carrito, validaciones y administración de demostración.</p><div className="nosotros-v8-beneficios"><article><strong>Productos</strong><span>Catálogo por categorías.</span></article><article><strong>Experiencia</strong><span>Navegación clara y sencilla.</span></article><article><strong>Proyecto</strong><span>Frontend con tecnologías web.</span></article></div></div>
      </div>
      <div className="nosotros-v8-equipo"><div className="nosotros-v8-equipo-titulo"><div><p className="etiqueta">NUESTRO EQUIPO</p><h2>Las personas detrás del proyecto.</h2></div><p>Trabajo colaborativo para construir NOVA SNEAKERS.</p></div><div className="nosotros-v8-equipo-grid"><article className="nosotros-v8-equipo-card"><div className="nosotros-v8-avatar">BA</div><div><h3>Boris Astudillo</h3><p>Diseño de interfaz y experiencia de usuario.</p></div></article><article className="nosotros-v8-equipo-card"><div className="nosotros-v8-avatar">DP</div><div><h3>Dennis Ponce</h3><p>Integración, pruebas y documentación.</p></div></article></div></div>
    </section>
  </Layout>;
}

const ARTICULOS = [
  { id: "1", categoria: "TENDENCIAS", titulo: "Cómo combinar zapatillas urbanas en tu día a día", resumen: "Ideas simples para integrar un par versátil a distintos estilos cotidianos.", imagen: "/img/blog/blog-urbano-hd.jpg", alt: "Zapatillas urbanas en una escena de ciudad", parrafos: ["Las zapatillas urbanas pueden acompañar distintos estilos cotidianos. Para elegir un modelo versátil, considera el color, la comodidad y las actividades que realizas habitualmente.", "Una combinación sencilla de tonos neutros permite destacar las zapatillas sin perder comodidad. Recuerda elegir la talla adecuada y revisar los materiales y cuidados recomendados."] },
  { id: "2", categoria: "DATOS", titulo: "Qué revisar antes de elegir zapatillas deportivas", resumen: "Aspectos básicos para orientar una elección según el uso esperado.", imagen: "/img/blog/blog-running-hd.jpg", alt: "Persona corriendo con zapatillas deportivas al atardecer", parrafos: ["Antes de elegir zapatillas deportivas, piensa en la actividad principal para la que las utilizarás. El tipo de suela, el ajuste y la sensación de comodidad son aspectos importantes.", "Prueba el calzado con el tipo de calcetín que sueles utilizar y comprueba que los dedos tengan espacio suficiente. Una elección adecuada debe priorizar comodidad y uso, no solamente la apariencia."] },
];

function Blog({ shop }) {
  return <Layout shop={shop} wide pageClass="pagina-blog">
    <PageHeading titulo="Blog" etiqueta="NOVA SNEAKERS" descripcion="Noticias y datos interesantes sobre zapatillas." />
    <section className="seccion"><div className="contenedor">
      <div className="grid-blog">{ARTICULOS.map((articulo) => <article className="tarjeta-blog" key={articulo.id}><div className="blog-imagen"><img src={articulo.imagen} alt={articulo.alt} loading="eager" /></div><div className="blog-contenido"><p className="etiqueta">{articulo.categoria}</p><h2>{articulo.titulo}</h2><p>{articulo.resumen}</p><Link className="enlace" to={`/blog/${articulo.id}`}>Leer artículo →</Link></div></article>)}</div>
      <section className="bloque-video" aria-labelledby="titulo-video"><div className="video-presentacion-texto"><p className="etiqueta">NOVA SNEAKERS TV</p><h2 id="titulo-video">Descubre nuestros modelos en movimiento.</h2><p>Un vistazo rápido a la colección NOVA: estilos urbanos, running, basketball y training.</p><div className="video-datos"><span>▶ Reproducción automática</span><span>⟳ Presentación en bucle</span><span>👟 4 modelos destacados</span></div><Link to="/productos" className="boton boton-principal">Explorar productos →</Link></div><div className="video-contenedor"><video autoPlay muted loop playsInline controls preload="metadata" poster="/img/productos/nova-air-street-v2.jpg" aria-label="Video de presentación de productos NOVA SNEAKERS"><source src="/video/nova-sneakers-showcase.mp4" type="video/mp4" />Tu navegador no puede reproducir este video.</video><div className="video-etiqueta">NOVA SNEAKERS · COLLECTION</div></div></section>
    </div></section>
  </Layout>;
}

function BlogDetail({ shop }) {
  const { articulo } = useParams();
  const entrada = ARTICULOS.find((item) => item.id === articulo);
  if (!entrada) return <Layout shop={shop}><div className="estado-vacio"><h1>Artículo no encontrado</h1><Link to="/blog">Volver al blog</Link></div></Layout>;
  return <Layout shop={shop} wide pageClass="pagina-blog-detalle"><PageHeading titulo={entrada.titulo} etiqueta={entrada.categoria} descripcion={entrada.resumen} /><article className="blog-detalle contenido-blog"><img src={entrada.imagen} alt={entrada.alt} /><div>{entrada.parrafos.map((parrafo) => <p key={parrafo}>{parrafo}</p>)}<Link className="boton boton-principal" to="/blog">Volver al blog</Link></div></article></Layout>;
}

function PageHeading({ titulo, etiqueta = "NOVA SNEAKERS", descripcion }) {
  return <section className="encabezado-pagina"><div className="contenedor"><p className="etiqueta">{etiqueta}</p><h1>{titulo}</h1><p>{descripcion}</p></div></section>;
}

function Contacto({ shop }) {
  return <Layout shop={shop} wide pageClass="pagina-contacto">
    <PageHeading titulo="Contacto" etiqueta="NOVA SNEAKERS" descripcion="Envíanos un mensaje y revisaremos tu solicitud." />
    <section className="seccion"><div className="contenedor contacto-layout"><div className="contacto-info"><p className="etiqueta">¿Necesitas ayuda?</p><h2>Estamos para escucharte.</h2><p>Completa el formulario con tus datos y tu mensaje. Los campos con * son obligatorios.</p><div className="contacto-regla"><strong>Correo permitido</strong><p>@duoc.cl, @profesor.duoc.cl o @gmail.com.</p></div></div><ContactForm /></div></section>
  </Layout>;
}

function ContactForm() {
  const [datos, setDatos] = useState({ nombre: "", correo: "", comentario: "" });
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");

  function cambiar(evento) {
    const nuevosDatos = { ...datos, [evento.target.name]: evento.target.value };
    setDatos(nuevosDatos);
    setErrores((actuales) => ({ ...actuales, [evento.target.name]: validarCampoContacto(evento.target.name, evento.target.value) }));
    setMensaje("");
  }

  function enviar(evento) {
    evento.preventDefault();
    const nuevosErrores = Object.fromEntries(Object.entries(datos).map(([campo, valor]) => [campo, validarCampoContacto(campo, valor)]).filter(([, error]) => Boolean(error)));
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length) { setMensaje("Revisa los campos marcados antes de enviar."); return; }
    setMensaje("Mensaje enviado correctamente. Esta demostración no envía un correo real.");
    setDatos({ nombre: "", correo: "", comentario: "" });
    setErrores({});
  }

  return <form id="formulario-contacto" className="formulario" onSubmit={enviar} noValidate>
    <div className="campo"><label htmlFor="contacto-nombre">Nombre *</label><input id="contacto-nombre" name="nombre" type="text" autoComplete="name" maxLength={100} required value={datos.nombre} onChange={cambiar} aria-invalid={Boolean(errores.nombre)} aria-describedby={errores.nombre ? "contacto-nombre-error" : undefined} />{errores.nombre && <small id="contacto-nombre-error" className="error">{errores.nombre}</small>}</div>
    <div className="campo"><label htmlFor="contacto-correo">Correo</label><input id="contacto-correo" name="correo" type="email" autoComplete="email" maxLength={100} placeholder="nombre@gmail.com" value={datos.correo} onChange={cambiar} aria-invalid={Boolean(errores.correo)} aria-describedby={errores.correo ? "contacto-correo-error" : undefined} />{errores.correo && <small id="contacto-correo-error" className="error">{errores.correo}</small>}</div>
    <div className="campo"><label htmlFor="contacto-comentario">Comentario *</label><textarea id="contacto-comentario" name="comentario" rows={5} maxLength={500} required placeholder="Escribe tu mensaje..." value={datos.comentario} onChange={cambiar} aria-invalid={Boolean(errores.comentario)} aria-describedby={errores.comentario ? "contacto-comentario-error" : undefined} />{errores.comentario && <small id="contacto-comentario-error" className="error">{errores.comentario}</small>}</div>
    <button type="submit" className="boton boton-principal">Enviar mensaje</button>
    {mensaje && <p className="mensaje-formulario" role="status">{mensaje}</p>}
  </form>;
}

function validarCampoContacto(campo, valor) {
  const texto = valor.trim();
  if (campo === "nombre") {
    if (!texto) return "El nombre es requerido.";
    if (texto.length > 100) return "El nombre no puede superar los 100 caracteres.";
  }
  if (campo === "correo" && texto) {
    if (!validarCorreo(texto)) return "Ingresa un correo electrónico válido.";
    const dominio = texto.toLowerCase().split("@")[1];
    const permitido = dominio === "duoc.cl" || dominio === "profesor.duoc.cl" || dominio === "gmail.com";
    if (!permitido) return "Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.";
  }
  if (campo === "comentario") {
    if (!texto) return "El comentario es requerido.";
    if (texto.length > 500) return "El comentario no puede superar los 500 caracteres.";
  }
  return "";
}

function Admin({ shop, section }) {
  const [mensaje, setMensaje] = useState("");
  const [pedidos, setPedidos] = useState(() => leerStorage(CLAVES.pedidos, []));
  const [usuarios, setUsuarios] = useState(() => leerStorage(CLAVES.usuarios, []));
  const [productoEditando, setProductoEditando] = useState(null);
  const [formProducto, setFormProducto] = useState({ codigo: "", nombre: "", descripcion: "", precio: "", stock: "", categoria: "Urbanas", publico: "Unisex", imagen: "img/productos/producto-generico.svg" });
  const [errorProducto, setErrorProducto] = useState("");

  function guardarProducto(evento) {
    evento.preventDefault();
    const codigo = formProducto.codigo.trim().toUpperCase();
    const nombre = formProducto.nombre.trim();
    const precio = Number(formProducto.precio);
    const stock = Number(formProducto.stock);
    if (!codigo || !nombre || !formProducto.descripcion.trim() || formProducto.precio === "" || formProducto.stock === "" || !Number.isFinite(precio) || precio <= 0 || !Number.isInteger(stock) || stock < 0 || !formProducto.imagen.trim()) {
      setErrorProducto("Completa todos los campos con un precio mayor a cero y stock entero no negativo.");
      return;
    }
    const duplicado = shop.productos.some((producto) => producto.codigo.toUpperCase() === codigo && producto.codigo !== productoEditando);
    if (duplicado) { setErrorProducto("Ya existe un producto con ese código."); return; }
    const producto = { ...formProducto, codigo, nombre, descripcion: formProducto.descripcion.trim(), precio, stock };
    const nuevos = productoEditando
      ? shop.productos.map((item) => item.codigo === productoEditando ? producto : item)
      : [...shop.productos, producto];
    shop.actualizarProductos(nuevos);
    setProductoEditando(null);
    setFormProducto({ codigo: "", nombre: "", descripcion: "", precio: "", stock: "", categoria: "Urbanas", publico: "Unisex", imagen: "img/productos/producto-generico.svg" });
    setErrorProducto("");
    setMensaje(productoEditando ? "Producto actualizado correctamente." : "Producto agregado correctamente.");
  }

  function editarProducto(producto) {
    setProductoEditando(producto.codigo);
    setFormProducto({ ...producto, precio: String(producto.precio), stock: String(producto.stock) });
    setErrorProducto("");
    setMensaje("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function eliminarProducto(codigo) {
    if (!window.confirm("¿Seguro que quieres eliminar este producto del catálogo?")) return;
    shop.actualizarProductos(shop.productos.filter((producto) => producto.codigo !== codigo));
    setMensaje("Producto eliminado del catálogo.");
  }

  function actualizarRol(correo, tipo) {
    const activo = leerStorage(CLAVES.usuarioActivo, null);
    if (activo?.correo === correo && activo.tipo !== tipo) {
      setMensaje("Por seguridad, no puedes cambiar tu propio perfil desde esta sesión.");
      return;
    }
    const actualizados = usuarios.map((usuario) => usuario.correo === correo ? { ...usuario, tipo } : usuario);
    guardarStorage(CLAVES.usuarios, actualizados);
    setUsuarios(actualizados);
    setMensaje("Rol de usuario actualizado.");
  }

  function eliminarUsuario(correo) {
    const activo = leerStorage(CLAVES.usuarioActivo, null);
    if (activo?.correo === correo) { setMensaje("No puedes eliminar la cuenta que tienes abierta."); return; }
    if (!window.confirm("¿Seguro que quieres eliminar este usuario?")) return;
    const actualizados = usuarios.filter((usuario) => usuario.correo !== correo);
    guardarStorage(CLAVES.usuarios, actualizados);
    setUsuarios(actualizados);
    setMensaje("Usuario eliminado.");
  }

  function actualizarEstadoPedido(id, estado) {
    const actualizados = pedidos.map((pedido) => pedido.id === id || pedido.numero === id ? { ...pedido, estado } : pedido);
    guardarStorage(CLAVES.pedidos, actualizados);
    setPedidos(actualizados);
    setMensaje(`Estado del pedido ${id} actualizado.`);
  }

  return <Layout shop={shop} pageClass="pagina-admin"><section className="admin-panel">
    <p className="etiqueta">PANEL DE CONTROL</p><h1>Administración · {section}</h1><p>Gestiona el catálogo, los usuarios y los pedidos. Los datos se guardan en este navegador para fines de demostración académica.</p>
    <nav className="botones-fila admin-nav" aria-label="Navegación administrativa"><Link className="boton boton-secundario" to="/admin">Resumen</Link><Link className="boton boton-secundario" to="/admin/productos">Productos</Link><Link className="boton boton-secundario" to="/admin/usuarios">Usuarios</Link><Link className="boton boton-secundario" to="/admin/pedidos">Pedidos</Link></nav>
    {mensaje && <p className="mensaje-prueba" role="status">{mensaje}</p>}
    {section === "Resumen" && <div className="resumen-admin"><div><strong>{shop.productos.length}</strong><span>Productos</span></div><div><strong>{usuarios.length}</strong><span>Usuarios</span></div><div><strong>{pedidos.length}</strong><span>Pedidos</span></div><div><strong>{pedidos.filter((pedido) => pedido.estado === "Pendiente").length}</strong><span>Pedidos pendientes</span></div></div>}
    {section === "Productos" && <>
      <form className="formulario admin-editor" onSubmit={guardarProducto} noValidate><h2>{productoEditando ? `Editar producto ${productoEditando}` : "Agregar producto"}</h2><div className="grid-formulario">
        <div className="campo"><label htmlFor="admin-codigo">Código *</label><input id="admin-codigo" value={formProducto.codigo} disabled={Boolean(productoEditando)} onChange={(evento) => setFormProducto({ ...formProducto, codigo: evento.target.value })} /></div>
        <div className="campo"><label htmlFor="admin-nombre">Nombre *</label><input id="admin-nombre" value={formProducto.nombre} onChange={(evento) => setFormProducto({ ...formProducto, nombre: evento.target.value })} /></div>
        <div className="campo"><label htmlFor="admin-precio">Precio (CLP) *</label><input id="admin-precio" type="number" min="1" value={formProducto.precio} onChange={(evento) => setFormProducto({ ...formProducto, precio: evento.target.value })} /></div>
        <div className="campo"><label htmlFor="admin-stock">Stock *</label><input id="admin-stock" type="number" min="0" step="1" value={formProducto.stock} onChange={(evento) => setFormProducto({ ...formProducto, stock: evento.target.value })} /></div>
        <div className="campo"><label htmlFor="admin-categoria">Categoría *</label><select id="admin-categoria" value={formProducto.categoria} onChange={(evento) => setFormProducto({ ...formProducto, categoria: evento.target.value })}>{["Urbanas", "Running", "Basketball", "Training"].map((item) => <option key={item}>{item}</option>)}</select></div>
        <div className="campo"><label htmlFor="admin-publico">Público *</label><select id="admin-publico" value={formProducto.publico} onChange={(evento) => setFormProducto({ ...formProducto, publico: evento.target.value })}>{["Unisex", "Mujer", "Niños"].map((item) => <option key={item}>{item}</option>)}</select></div>
        <div className="campo campo-completo"><label htmlFor="admin-descripcion">Descripción *</label><textarea id="admin-descripcion" rows={2} value={formProducto.descripcion} onChange={(evento) => setFormProducto({ ...formProducto, descripcion: evento.target.value })} /></div>
        <div className="campo campo-completo"><label htmlFor="admin-imagen">Ruta de imagen *</label><input id="admin-imagen" value={formProducto.imagen} onChange={(evento) => setFormProducto({ ...formProducto, imagen: evento.target.value })} placeholder="img/productos/nombre-imagen.jpg" /><small className="texto-ayuda">La imagen debe existir dentro de public/.</small></div>
      </div>{errorProducto && <p className="error" role="alert">{errorProducto}</p>}<div className="botones-fila"><button className="boton boton-principal" type="submit">{productoEditando ? "Guardar cambios" : "Agregar producto"}</button>{productoEditando && <button className="boton boton-secundario" type="button" onClick={() => { setProductoEditando(null); setFormProducto({ codigo: "", nombre: "", descripcion: "", precio: "", stock: "", categoria: "Urbanas", publico: "Unisex", imagen: "img/productos/producto-generico.svg" }); setErrorProducto(""); }}>Cancelar edición</button>}</div></form>
      <div className="tabla-admin-wrap"><table className="tabla-admin"><thead><tr><th>Código</th><th>Producto</th><th>Tipo</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr></thead><tbody>{shop.productos.map((producto) => <tr key={producto.codigo}><td>{producto.codigo}</td><td>{producto.nombre}</td><td>{producto.categoria} · {producto.publico}</td><td>{formatearPrecio(producto.precio)}</td><td>{producto.stock}</td><td><div className="botones-fila"><button className="boton boton-secundario" type="button" onClick={() => editarProducto(producto)}>Editar</button><button className="boton boton-peligro" type="button" onClick={() => eliminarProducto(producto.codigo)}>Eliminar</button></div></td></tr>)}</tbody></table></div>
    </>}
    {section === "Usuarios" && <div className="tabla-admin-wrap"><table className="tabla-admin"><thead><tr><th>Usuario</th><th>Correo</th><th>RUN</th><th>Perfil</th><th>Acciones</th></tr></thead><tbody>{usuarios.map((usuario) => <tr key={usuario.correo}><td>{usuario.nombre} {usuario.apellidos || ""}</td><td>{usuario.correo}</td><td>{usuario.run || "—"}</td><td><select aria-label={`Perfil de ${usuario.correo}`} value={usuario.tipo || "Cliente"} onChange={(evento) => actualizarRol(usuario.correo, evento.target.value)}>{["Administrador", "Vendedor", "Cliente"].map((tipo) => <option key={tipo}>{tipo}</option>)}</select></td><td><button className="boton boton-peligro" type="button" onClick={() => eliminarUsuario(usuario.correo)}>Eliminar</button></td></tr>)}</tbody></table>{usuarios.length === 0 && <p>No hay usuarios registrados.</p>}</div>}
    {section === "Pedidos" && <div className="tabla-admin-wrap"><table className="tabla-admin"><thead><tr><th>Número</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Estado</th><th>Detalle</th></tr></thead><tbody>{pedidos.map((pedido) => { const id = pedido.id || pedido.numero; return <tr key={id}><td>{id}</td><td>{pedido.nombre || pedido.cliente}<br /><small>{pedido.correo}</small></td><td>{pedido.fecha ? new Date(pedido.fecha).toLocaleDateString("es-CL") : "—"}</td><td>{formatearPrecio(pedido.total)}</td><td><select aria-label={`Estado del pedido ${id}`} value={pedido.estado || "Pendiente"} onChange={(evento) => actualizarEstadoPedido(id, evento.target.value)}>{["Pendiente", "Preparando", "Enviado", "Entregado", "Cancelado"].map((estado) => <option key={estado}>{estado}</option>)}</select></td><td><Link to={`/admin/pedidos/${id}`}>Ver detalle</Link></td></tr>; })}</tbody></table>{pedidos.length === 0 && <p>No hay pedidos registrados.</p>}</div>}
  </section></Layout>;
}

function AdminOrderDetail({ shop }) {
  const { id } = useParams();
  const pedido = leerStorage(CLAVES.pedidos, []).find((item) => item.id === id || item.numero === id);
  const items = pedido?.items || pedido?.productos || [];
  return <Layout shop={shop} pageClass="pagina-admin"><section className="admin-panel"><p className="etiqueta">PANEL DE CONTROL</p><h1>Detalle del pedido</h1>{pedido ? <><p><strong>Pedido:</strong> {pedido.id || pedido.numero}</p><p><strong>Cliente:</strong> {pedido.nombre || pedido.cliente} ({pedido.correo})</p><p><strong>Dirección:</strong> {[pedido.direccion, pedido.comuna, pedido.region].filter(Boolean).join(", ") || "No registrada"}</p><p><strong>Método de pago:</strong> {pedido.metodoPago || "No especificado"}</p><div className="tabla-admin-wrap"><table className="tabla-admin"><thead><tr><th>Producto</th><th>Código</th><th>Cantidad</th><th>Precio</th></tr></thead><tbody>{items.map((item) => <tr key={item.codigo}><td>{item.nombre}</td><td>{item.codigo}</td><td>{item.cantidad || 1}</td><td>{formatearPrecio(item.precio)}</td></tr>)}</tbody></table></div><h2>Total: {formatearPrecio(pedido.total)}</h2><p>Estado: <strong>{pedido.estado || "Pendiente"}</strong></p></> : <p>Pedido no encontrado en este navegador.</p>}<Link className="boton boton-secundario" to="/admin/pedidos">Volver a pedidos</Link></section></Layout>;
}

function NotFound({ shop }) {
  return <Layout shop={shop}><div className="estado-vacio"><h1>Página no encontrada</h1><p>La dirección que buscas no existe.</p><Link className="boton boton-principal" to="/">Volver al inicio</Link></div></Layout>;
}

export default function App() {
  const shop = useShop();
  return <Routes>
    <Route path="/" element={<Home shop={shop} />} />
    <Route path="/productos" element={<Catalog shop={shop} />} />
    <Route path="/producto/:codigo" element={<ProductDetail shop={shop} />} />
    <Route path="/carrito" element={<Cart shop={shop} />} />
    <Route path="/favoritos" element={<Favorites shop={shop} />} />
    <Route path="/login" element={<Login shop={shop} />} />
    <Route path="/registro" element={<Register shop={shop} />} />
    <Route path="/cuenta" element={<ProtectedRoute><Account shop={shop} /></ProtectedRoute>} />
    <Route path="/checkout" element={<ProtectedRoute roles={["Cliente"]} retorno="checkout"><Checkout shop={shop} /></ProtectedRoute>} />
    <Route path="/nosotros" element={<Nosotros shop={shop} />} />
    <Route path="/contacto" element={<Contacto shop={shop} />} />
    <Route path="/blog" element={<Blog shop={shop} />} />
    <Route path="/blog/:articulo" element={<BlogDetail shop={shop} />} />
    <Route path="/admin" element={<ProtectedRoute roles={["Administrador", "Vendedor"]}><Admin shop={shop} section="Resumen" /></ProtectedRoute>} />
    <Route path="/admin/productos" element={<ProtectedRoute roles={["Administrador", "Vendedor"]}><Admin shop={shop} section="Productos" /></ProtectedRoute>} />
    <Route path="/admin/usuarios" element={<ProtectedRoute roles={["Administrador"]}><Admin shop={shop} section="Usuarios" /></ProtectedRoute>} />
    <Route path="/admin/pedidos" element={<ProtectedRoute roles={["Administrador", "Vendedor"]}><Admin shop={shop} section="Pedidos" /></ProtectedRoute>} />
    <Route path="/admin/pedidos/:id" element={<ProtectedRoute roles={["Administrador", "Vendedor"]}><AdminOrderDetail shop={shop} /></ProtectedRoute>} />
    <Route path="*" element={<NotFound shop={shop} />} />
  </Routes>;
}
