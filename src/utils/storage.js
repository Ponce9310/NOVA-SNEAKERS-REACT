export function leerStorage(clave, valorInicial = []) {
  try {
    const guardado = localStorage.getItem(clave);
    return guardado ? JSON.parse(guardado) : valorInicial;
  } catch { return valorInicial; }
}
export function guardarStorage(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
}
export function calcularSubtotal(precio, cantidad) { return Number(precio) * Number(cantidad); }
export function calcularTotal(items) {
  return items.reduce((total, item) => total + calcularSubtotal(item.precio, item.cantidad || 1), 0);
}
export function validarCorreo(correo) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo); }
export function validarRegistro({ nombre, correo, password }) {
  const errores = {};
  if (!nombre?.trim()) errores.nombre = "Ingresa tu nombre.";

  const correoLimpio = (correo || "").trim().toLowerCase();
  const dominio = correoLimpio.split("@")[1];
  if (!validarCorreo(correoLimpio)) {
    errores.correo = "Ingresa un correo válido.";
  } else if (!["gmail.com", "duoc.cl", "profesor.duoc.cl"].includes(dominio)) {
    errores.correo = "Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.";
  }

  if (!password || password.length < 4 || password.length > 10) {
    errores.password = "La contraseña debe tener entre 4 y 10 caracteres.";
  }
  return errores;
}
export function filtrarProductos(lista, texto = "", categoria = "Todas", publico = "Todos") {
  const busqueda = texto.trim().toLowerCase();
  return lista.filter(p => (!busqueda || `${p.codigo} ${p.nombre} ${p.descripcion} ${p.categoria} ${p.publico}`.toLowerCase().includes(busqueda)) && (categoria === "Todas" || p.categoria === categoria) && (publico === "Todos" || p.publico === publico));
}
export function formatearPrecio(precio) { return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(precio); }
export function agregarAlCarrito(carrito, producto) {
  const existente = carrito.find(item => item.codigo === producto.codigo);
  return existente ? carrito.map(item => item.codigo === producto.codigo ? { ...item, cantidad: (item.cantidad || 1) + 1 } : item) : [...carrito, { ...producto, cantidad: 1 }];
}
export function cambiarCantidad(carrito, codigo, cantidad) {
  if (cantidad <= 0) return carrito.filter(item => item.codigo !== codigo);
  return carrito.map(item => item.codigo === codigo ? { ...item, cantidad } : item);
}
