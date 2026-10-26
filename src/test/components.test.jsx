import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Header from "../components/Header.jsx";
import ProductCard from "../components/ProductCard.jsx";
import Saludando from "../components/Saludando.jsx";
import BotonConfirmar from "../components/BotonConfirmar.jsx";

const producto = {
  codigo: "NS-001",
  nombre: "Nova Air Street",
  descripcion: "Zapatilla urbana",
  precio: 59990,
  stock: 12,
  categoria: "Urbanas",
  publico: "Unisex",
  imagen: "img/productos/producto-generico.svg",
};

function enRuta(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("Componentes de interfaz", () => {
  it("muestra el saludo recibido por props", () => {
    render(<Saludando nombre="Nova" />);
    expect(screen.getByText("Hola Nova")).toBeInTheDocument();
  });

  it("muestra nombre y precio del producto", () => {
    enRuta(<ProductCard producto={producto} />);
    expect(screen.getByText("Nova Air Street")).toBeInTheDocument();
    expect(screen.getByText(/59\.990/)).toBeInTheDocument();
  });

  it("llama al callback al agregar al carrito", async () => {
    const onAgregar = vi.fn();
    enRuta(<ProductCard producto={producto} onAgregar={onAgregar} />);
    await userEvent.click(screen.getByRole("button", { name: "Agregar al carrito" }));
    expect(onAgregar).toHaveBeenCalledWith(producto);
  });

  it("llama al callback al agregar a favoritos", async () => {
    const onFavorito = vi.fn();
    enRuta(<ProductCard producto={producto} onFavorito={onFavorito} />);
    await userEvent.click(screen.getByRole("button", { name: /Agregar Nova Air Street a favoritos/ }));
    expect(onFavorito).toHaveBeenCalledWith(producto);
  });

  it("expone el estado de favorito con aria-pressed", () => {
    enRuta(<ProductCard producto={producto} favorito />);
    expect(screen.getByRole("button", { name: /Quitar Nova Air Street de favoritos/ })).toHaveAttribute("aria-pressed", "true");
  });

  it("muestra navegación, acceso a cuenta y contador del carrito", () => {
    enRuta(<Header cantidadCarrito={3} />);
    expect(screen.getByRole("link", { name: "Productos" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Mi cuenta" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Carrito, 3 productos/ })).toBeInTheDocument();
  });

  it("permite abrir el buscador desde el encabezado", async () => {
    const usuario = userEvent.setup();
    enRuta(<Header />);
    await usuario.click(screen.getByRole("button", { name: "Buscar productos" }));
    expect(screen.getByLabelText("Buscar zapatillas")).toBeInTheDocument();
  });

  it("confirma una acción con el componente de demostración", async () => {
    render(<BotonConfirmar />);
    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByText(/confirmada/i)).toBeInTheDocument();
  });
});
