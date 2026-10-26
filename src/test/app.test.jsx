import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "../App.jsx";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

function abrir(ruta) {
  return render(<MemoryRouter initialEntries={[ruta]}><App /></MemoryRouter>);
}

describe("Flujos principales de Nova Sneakers", () => {
  it("presenta la portada y deja las imágenes laterales sin enlaces de navegación", () => {
    abrir("/");
    expect(screen.getByRole("heading", { name: "Productos destacados" })).toBeInTheDocument();
    const imagenLateral = screen.getByRole("img", { name: /zapatillas de la colección NOVA SNEAKERS/i });
    expect(imagenLateral.closest("a")).toBeNull();
  });

  it("muestra filtros y productos en el catálogo", () => {
    abrir("/productos");
    expect(screen.getByRole("heading", { name: /Encuentra tu próximo par favorito/i })).toBeInTheDocument();
    expect(screen.getByText(/44 productos encontrados/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Productos siguientes" })).toBeEnabled();
  });

  it("el carrusel vuelve al primer grupo después del último", async () => {
    const usuario = userEvent.setup();
    abrir("/productos");
    await usuario.click(screen.getByRole("button", { name: "Ir a la página 11" }));
    expect(screen.getByRole("button", { name: "Ir a la página 11" })).toHaveAttribute("aria-current", "page");
    await usuario.click(screen.getByRole("button", { name: "Productos siguientes" }));
    expect(screen.getByRole("button", { name: "Ir a la página 1" })).toHaveAttribute("aria-current", "page");
    await usuario.click(screen.getByRole("button", { name: "Productos anteriores" }));
    expect(screen.getByRole("button", { name: "Ir a la página 11" })).toHaveAttribute("aria-current", "page");
  });

  it("filtra el catálogo por texto", async () => {
    const usuario = userEvent.setup();
    abrir("/productos");
    await usuario.type(screen.getByRole("searchbox", { name: "Buscar productos" }), "Nova Runner Pro");
    expect(screen.getByText("1 productos encontrados")).toBeInTheDocument();
  });

  it("descuenta stock y vacía el carrito después de una compra simulada", async () => {
    const usuario = userEvent.setup();
    abrir("/productos");
    await usuario.click(screen.getAllByRole("button", { name: "Agregar al carrito" })[0]);
    await usuario.click(screen.getByRole("link", { name: /Carrito, 1 productos/ }));
    await usuario.click(screen.getByRole("link", { name: "Continuar compra" }));
    await usuario.type(screen.getByLabelText("Correo *"), "cliente@gmail.com");
    await usuario.type(screen.getByLabelText("Contraseña *"), "1234");
    await usuario.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    await usuario.clear(screen.getByLabelText("Nombre completo *"));
    await usuario.type(screen.getByLabelText("Nombre completo *"), "Cliente de prueba");
    await usuario.clear(screen.getByLabelText("Correo electrónico *"));
    await usuario.type(screen.getByLabelText("Correo electrónico *"), "cliente@gmail.com");
    await usuario.selectOptions(screen.getByLabelText("Región *"), "Región Metropolitana");
    await usuario.selectOptions(screen.getByLabelText("Comuna *"), "Santiago");
    await usuario.clear(screen.getByLabelText("Dirección *"));
    await usuario.type(screen.getByLabelText("Dirección *"), "Av. Siempre Viva 123");
    await usuario.selectOptions(screen.getByLabelText("Método de pago *"), "Tarjeta de débito (simulada)");
    await usuario.click(screen.getByLabelText(/Acepto que esta compra es una simulación/));
    await usuario.click(screen.getByRole("button", { name: "Confirmar compra simulada" }));

    expect(screen.getByRole("status")).toHaveTextContent(/fue registrado correctamente/);
    expect(JSON.parse(localStorage.getItem("novaSneakersCarrito"))).toEqual([]);
    const productosGuardados = JSON.parse(localStorage.getItem("novaSneakersProductos"));
    expect(productosGuardados.find((producto) => producto.codigo === "NS-001").stock).toBe(11);
  });

  it("muestra la sección Nosotros con el equipo", () => {
    abrir("/nosotros");
    expect(screen.getByRole("heading", { name: /Más que zapatillas/i })).toBeInTheDocument();
    expect(screen.getByText("Boris Astudillo")).toBeInTheDocument();
    expect(screen.getByText("Dennis Ponce")).toBeInTheDocument();
  });

  it("muestra las tarjetas del blog y el video en bucle", () => {
    abrir("/blog");
    expect(screen.getByRole("heading", { name: "Blog" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Descubre nuestros modelos en movimiento/i })).toBeInTheDocument();
    const video = document.querySelector("video");
    expect(video).not.toBeNull();
    expect(video).toHaveProperty("loop", true);
    expect(video).toHaveProperty("muted", true);
  });

  it("muestra el diseño de inicio de sesión de la EA1 y permite mostrar la contraseña", async () => {
    const usuario = userEvent.setup();
    abrir("/login");

    expect(screen.getByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();
    expect(screen.getByText("Acceso a la tienda")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Tu próximo par está aquí." })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Zapatilla Nova Motion naranja" })).toBeInTheDocument();

    const password = screen.getByLabelText("Contraseña *");
    expect(password).toHaveAttribute("type", "password");
    await usuario.click(screen.getByRole("button", { name: "Mostrar contraseña" }));
    expect(password).toHaveAttribute("type", "text");
    await usuario.click(screen.getByRole("button", { name: "Ocultar contraseña" }));
    expect(password).toHaveAttribute("type", "password");
  });

  it("inicia sesión con una cuenta de demostración de la EA1", async () => {
    const usuario = userEvent.setup();
    abrir("/login");
    await usuario.type(screen.getByLabelText("Correo *"), "cliente@gmail.com");
    await usuario.type(screen.getByLabelText("Contraseña *"), "1234");
    await usuario.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(await screen.findByRole("heading", { name: "Mi cuenta" })).toBeInTheDocument();
    expect(screen.getByText("Hola, Cliente.")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("novaSneakersUsuarioActivo"))).toMatchObject({
      correo: "cliente@gmail.com",
      tipo: "Cliente",
    });
  });

  it("redirige al inicio de sesión cuando se intenta abrir administración sin acceso", () => {
    abrir("/admin");
    expect(screen.getByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();
  });

  it("permite que el usuario administrador abra el panel administrativo", async () => {
    const usuario = userEvent.setup();
    abrir("/login");
    await usuario.type(screen.getByLabelText("Correo *"), "admin@gmail.com");
    await usuario.type(screen.getByLabelText("Contraseña *"), "1234");
    await usuario.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(await screen.findByRole("heading", { name: "Administración · Resumen" })).toBeInTheDocument();
  });

  it("rechaza correos no permitidos y contraseñas fuera del rango de la EA1", async () => {
    const usuario = userEvent.setup();
    abrir("/login");
    await usuario.type(screen.getByLabelText("Correo *"), "persona@ejemplo.com");
    await usuario.type(screen.getByLabelText("Contraseña *"), "123");
    await usuario.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(screen.getByText(/Usa un correo @duoc.cl/)).toBeInTheDocument();
    expect(screen.getByText(/entre 4 y 10 caracteres/)).toBeInTheDocument();
  });

  it("mantiene los tres campos del formulario de contacto como columnas directas", () => {
    abrir("/contacto");
    const formulario = document.getElementById("formulario-contacto");
    expect(formulario.querySelectorAll(":scope > .campo")).toHaveLength(3);
    expect(formulario.querySelector(":scope > .campo:nth-child(3) textarea")).toBeInTheDocument();
  });

  it("valida el formulario de contacto y acepta dominios permitidos", async () => {
    const usuario = userEvent.setup();
    abrir("/contacto");
    await usuario.click(screen.getByRole("button", { name: "Enviar mensaje" }));
    expect(screen.getByText("El nombre es requerido.")).toBeInTheDocument();
    expect(screen.getByText("El comentario es requerido.")).toBeInTheDocument();
    await usuario.type(screen.getByLabelText("Nombre *"), "Estudiante Nova");
    await usuario.type(screen.getByLabelText("Correo"), "estudiante@gmail.com");
    await usuario.type(screen.getByLabelText("Comentario *"), "Consulta de prueba");
    await usuario.click(screen.getByRole("button", { name: "Enviar mensaje" }));
    expect(screen.getByRole("status")).toHaveTextContent("Mensaje enviado correctamente");
  });



  it("valida y registra una cuenta con los campos exigidos en la EA1", async () => {
    const usuario = userEvent.setup();
    abrir("/registro");
    await usuario.type(screen.getByLabelText("RUN *"), "123456785");
    await usuario.type(screen.getByLabelText("Nombre *"), "Camila");
    await usuario.type(screen.getByLabelText("Apellidos *"), "Prueba Nova");
    await usuario.type(screen.getByLabelText("Correo *"), "camila@gmail.com");
    await usuario.type(screen.getByLabelText("Contraseña *"), "1234");
    await usuario.type(screen.getByLabelText("Confirmar contraseña *"), "1234");
    await usuario.selectOptions(screen.getByLabelText("Región *"), "Región Metropolitana");
    await usuario.selectOptions(screen.getByLabelText("Comuna *"), "Santiago");
    await usuario.type(screen.getByLabelText("Dirección *"), "Calle de prueba 123");
    await usuario.click(screen.getByRole("button", { name: "Crear cuenta" }));
    expect(screen.getByRole("status")).toHaveTextContent(/Registro completado correctamente/);
    expect(JSON.parse(localStorage.getItem("novaSneakersUsuarios"))).toContainEqual(expect.objectContaining({
      run: "123456785", correo: "camila@gmail.com", tipo: "Cliente", region: "Región Metropolitana", comuna: "Santiago",
    }));
  });

  it("permite agregar un producto desde la administración", async () => {
    const usuario = userEvent.setup();
    localStorage.setItem("novaSneakersUsuarioActivo", JSON.stringify({ nombre: "Administrador", correo: "admin@gmail.com", tipo: "Administrador" }));
    abrir("/admin/productos");
    await usuario.type(screen.getByLabelText("Código *"), "NS-TEST");
    await usuario.type(screen.getByLabelText("Nombre *"), "Nova Prueba Admin");
    await usuario.type(screen.getByLabelText("Precio (CLP) *"), "49990");
    await usuario.type(screen.getByLabelText("Stock *"), "3");
    await usuario.type(screen.getByLabelText("Descripción *"), "Producto creado durante una prueba.");
    await usuario.click(screen.getByRole("button", { name: "Agregar producto" }));
    expect(screen.getByText("Nova Prueba Admin")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("novaSneakersProductos"))).toContainEqual(expect.objectContaining({ codigo: "NS-TEST", precio: 49990, stock: 3 }));
  });

  it("rechaza un dominio no permitido en contacto", async () => {
    const usuario = userEvent.setup();
    abrir("/contacto");
    await usuario.type(screen.getByLabelText("Nombre *"), "Estudiante Nova");
    await usuario.type(screen.getByLabelText("Correo"), "estudiante@ejemplo.com");
    await usuario.type(screen.getByLabelText("Comentario *"), "Consulta de prueba");
    await usuario.click(screen.getByRole("button", { name: "Enviar mensaje" }));
    expect(screen.getByText(/Usa un correo @duoc.cl/)).toBeInTheDocument();
  });
});
