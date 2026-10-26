# NOVA SNEAKERS — React + Vite

Proyecto académico de tienda de zapatillas adaptado desde el sitio HTML, CSS y JavaScript de la EA1. La prioridad de esta versión es conservar la identidad visual original y organizar la interfaz en componentes React fáciles de leer y explicar. Se eliminaron las importaciones CSS duplicadas que provocaban el error de Vite con `@import`.

## Requisitos

- Node.js LTS instalado (incluye npm).
- Visual Studio Code o cualquier editor.
- Navegador actualizado.
- Conexión a Internet para descargar dependencias la primera vez y para cargar las fuentes de Google Fonts.

## Instalación y ejecución en Windows

1. Descomprime el ZIP en una carpeta local, por ejemplo `Documentos/NOVA-SNEAKERS-REACT`.
2. Abre esa carpeta en Visual Studio Code.
3. Abre **Terminal → Nueva terminal**.
4. Confirma que la terminal está ubicada en la carpeta que contiene `package.json`.
5. Ejecuta una vez:

   ```bash
   npm install
   ```

6. Para iniciar el sitio:

   ```bash
   npm run dev
   ```

7. Abre la URL que muestra Vite, normalmente `http://localhost:5173/`.
8. Para detenerlo, vuelve a la terminal y presiona `Ctrl + C`.

No ejecutes `npm install` en cada inicio; normalmente solo necesitas `npm run dev` después de la primera instalación.

## Cuentas de demostración

Al iniciar sesión se habilitan estas cuentas locales de la EA1:

| Perfil | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@gmail.com` | `1234` |
| Vendedor | `vendedor@gmail.com` | `1234` |
| Cliente | `cliente@gmail.com` | `1234` |

El correo debe utilizar uno de los dominios permitidos por el proyecto: `@gmail.com`, `@duoc.cl` o `@profesor.duoc.cl`. La contraseña de inicio de sesión debe tener entre 4 y 10 caracteres. Estas cuentas son únicamente para demostración académica.

## Pruebas automatizadas

Ejecutar todas las pruebas una vez:

```bash
npm run test:run
```

Ejecutar Vitest en modo interactivo:

```bash
npm test
```

Comprobar que la aplicación se compila para producción:

```bash
npm run build
```

Los casos manuales para revisar visualmente y probar los flujos principales están en `PRUEBAS-MANUALES.md`. La suite incluye 39 casos automatizados; en este entorno se verificó la sintaxis, pero no se pudo ejecutar Vitest/Vite porque no se pudieron descargar las dependencias desde npm.

## Estructura del proyecto

```text
NOVA-SNEAKERS-REACT/
├── public/
│   ├── img/                 # Imágenes originales de la EA1
│   └── video/               # Video de presentación del blog
├── css/estilos.css          # Hoja de estilos base del sitio original
├── src/
│   ├── components/          # Header, Footer, ProductCard y componentes reutilizables
│   ├── data/products.js     # Catálogo de productos de demostración
│   ├── test/                # Pruebas automatizadas de componentes y flujos
│   ├── utils/storage.js     # Cálculos, filtros, validaciones y persistencia local
│   ├── App.jsx              # Rutas y páginas principales
│   ├── index.css            # Ajustes visuales específicos de React
│   └── main.jsx             # Punto de entrada de React
├── ERS/                    # Documento de requisitos incluido en el proyecto
├── PRUEBAS-MANUALES.md
├── package.json
└── vite.config.js
```

## Rutas principales

- `/` — Inicio
- `/productos` — Catálogo con filtros, búsqueda, ordenamiento y carrusel circular
- `/producto/NS-001` — Detalle de producto (el código puede variar)
- `/carrito` — Carrito y modificación de cantidades
- `/favoritos` — Productos favoritos
- `/registro` y `/login` — Registro con RUN chileno, datos personales, región/comuna, validaciones e inicio de sesión de demostración
- `/cuenta` — Cuenta protegida por inicio de sesión
- `/checkout` — Despacho, método de pago demostrativo, términos y confirmación de compra simulada
- `/nosotros`, `/blog`, `/blog/1`, `/blog/2`, `/contacto`
- `/admin`, `/admin/productos`, `/admin/usuarios`, `/admin/pedidos` — Panel administrativo local con restricciones por perfil y acciones de gestión

## Decisiones y límites importantes

- Los datos se guardan en `localStorage` del navegador. Si se limpia el almacenamiento del sitio, se borran las cuentas, favoritos, carrito y pedidos de prueba.
- El registro e inicio de sesión son **demostrativos**. No hay backend, base de datos remota, cifrado de contraseñas ni recuperación real de cuentas.
- El checkout registra un pedido local de demostración. No procesa pagos ni envía pedidos a una tienda real.
- El formulario de contacto valida los campos en el navegador y muestra una confirmación, pero no envía correo electrónico.
- El panel administrativo es local y de demostración. Incluye alta, edición y eliminación de productos, cambio de perfil y eliminación de usuarios (sin poder eliminar o cambiar el perfil de la sesión activa), actualización del estado de pedidos y vista de detalle. No reemplaza un backend real ni constituye un sistema de seguridad de producción.
- El video del blog utiliza el archivo local `public/video/nova-sneakers-showcase.mp4` y se reproduce en silencio y en bucle, sujeto a las políticas del navegador.

## Tecnologías

React, React Router, Vite, CSS, Bootstrap (para utilidades de tabla), Vitest, Testing Library y jsdom.
