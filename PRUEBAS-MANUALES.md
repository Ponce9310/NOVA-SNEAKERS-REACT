# Guía de pruebas manuales — NOVA SNEAKERS

Realiza las pruebas en este orden. Usa datos ficticios y recuerda que esta es una tienda académica de demostración.

## A. Arranque y navegación

1. Ejecuta `npm install` (solo la primera vez) y después `npm run dev`.
2. Abre la URL local que aparece en la terminal.
3. Comprueba que no aparece un error de compilación en la terminal.
4. Recorre Inicio, Productos, Nosotros, Blog y Contacto usando el menú.
5. Comprueba que la sección actual queda resaltada en el menú y que el logo vuelve a Inicio.
6. En Inicio, haz clic en el botón azul integrado en el banner: debe abrir Productos. Haz clic en las imágenes laterales: no deben navegar a otra sección.
7. En una pantalla estrecha, abre y cierra el menú hamburguesa.

## B. Inicio

1. Comprueba el banner de tres imágenes y que se vea completo el texto incrustado en la imagen principal.
2. Comprueba que se muestran cuatro tarjetas de productos destacados y el panel de comunidad.
3. En una tarjeta con stock, pulsa **Agregar al carrito** y revisa que el contador del encabezado aumenta.
4. Pulsa el corazón de una tarjeta. Debe cambiar el estado de favorito.
5. Escribe un correo válido en el formulario de comunidad y pulsa **Suscribirme**. Debe aparecer una confirmación. La suscripción se guarda solo en este navegador.

## C. Catálogo y carrusel

1. Entra en Productos y confirma que aparecen los filtros, el buscador, el ordenamiento y cuatro tarjetas en escritorio.
2. Escribe `Nova Runner Pro`: el contador debe mostrar un resultado.
3. Borra la búsqueda y selecciona `Running`: deben quedar solo productos de esa categoría.
4. Selecciona `Mujer` o `Niños` para comprobar el filtro por público.
5. Cambia el orden a precio menor a mayor y comprueba que los precios se ordenan de forma ascendente.
6. Pulsa la flecha siguiente varias veces hasta la última página; al pulsarla otra vez debe regresar a la primera. La flecha anterior desde la primera debe ir a la última.
7. Comprueba que los indicadores inferiores cambian la página seleccionada.
8. Deja el carrusel sin interactuar durante unos segundos: debe avanzar automáticamente. Al pasar el cursor sobre él o enfocarlo con teclado debe pausarse temporalmente.
9. Pulsa **Ver detalle**: debe abrir el detalle de ese producto.
10. En un producto sin stock, el botón de agregar debe estar deshabilitado.

## D. Carrito y favoritos

1. Agrega dos productos distintos al carrito.
2. Abre el carrito desde el encabezado y comprueba que aparecen los productos, cantidades, subtotales y total.
3. Cambia una cantidad y comprueba que el total se actualiza.
4. Quita un producto y comprueba que desaparece.
5. Entra en Favoritos desde el pie de página y comprueba que se muestran los productos marcados.
6. Desmarca un favorito y comprueba que se elimina de la lista.

## E. Registro, inicio de sesión y cuenta

1. Entra en Registro e intenta enviar el formulario vacío: deben mostrarse errores.
2. Registra una cuenta de prueba con RUN chileno válido (por ejemplo `123456785`), nombre, apellidos, correo permitido, contraseña de 4 a 10 caracteres y confirmación coincidente. Completa región, comuna y dirección; la fecha de nacimiento es opcional y no puede ser futura.
3. Prueba un RUN inválido, una confirmación de contraseña distinta y un correo de dominio no permitido: el formulario debe indicar los errores.
4. Intenta registrar el mismo correo o RUN de nuevo: debe rechazarse como duplicado.
5. Entra en Iniciar sesión y prueba una cuenta de demostración: `cliente@gmail.com` con contraseña `1234`.
6. Comprueba que se abre Mi cuenta. Usa `admin@gmail.com` con contraseña `1234` para entrar al panel administrativo y `vendedor@gmail.com` con contraseña `1234` para probar el perfil vendedor.
7. En el formulario de inicio de sesión, comprueba que el botón del ojo muestra y oculta la contraseña.
8. Prueba un correo de dominio no permitido y una contraseña menor de 4 o mayor de 10 caracteres: deben aparecer errores.
9. Cierra sesión y comprueba que se vuelve a Inicio.
10. Intenta entrar directamente a `/cuenta` o `/admin` sin sesión: debe redirigir al inicio de sesión. Un cliente no debe poder entrar a administración ni un vendedor debe entrar a la gestión de usuarios.

## F. Checkout y administración

1. Inicia sesión como Cliente (`cliente@gmail.com`, contraseña `1234`), agrega un producto y continúa al checkout. Si intentas entrar al checkout sin sesión, debe redirigirte al login y permitir volver después de autenticarte.
2. Envía el formulario incompleto: deben aparecer validaciones.
3. Completa nombre, correo, región, comuna, dirección, método de pago y aceptación de condiciones; confirma la compra simulada.
4. Comprueba que aparece un número de pedido, el carrito queda vacío y el stock se descuenta.
5. Abre `/admin/pedidos`: debe aparecer el pedido de prueba, el estado editable y el enlace al detalle.
6. Abre `/admin/productos`, agrega un producto de prueba, edítalo y luego elimínalo. Para eliminar, confirma el diálogo del navegador.
7. Abre `/admin/usuarios`, cambia el perfil de otro usuario y prueba eliminar un usuario que no sea la sesión activa.
8. Recarga la página y comprueba que los cambios se mantienen en este navegador.

## G. Nosotros, Blog y Contacto

1. En Nosotros, revisa la imagen de la tienda, la descripción, las tres tarjetas informativas y las dos tarjetas del equipo.
2. En Blog, revisa las dos tarjetas de artículos, sus enlaces y la sección NOVA SNEAKERS TV.
3. Comprueba que el video aparece, reproduce en silencio y repite en bucle. Si el navegador bloquea la reproducción automática, usa el control de reproducción.
4. Abre cada artículo con **Leer artículo** y vuelve al Blog.
5. En Contacto, intenta enviar el formulario vacío: deben aparecer errores para nombre y comentario.
6. Prueba un correo `persona@ejemplo.com`: debe rechazarse. Prueba `persona@gmail.com`, `persona@duoc.cl` o `persona@profesor.duoc.cl`: debe aceptarse si el resto de los campos está correcto.
7. Comprueba que el mensaje de confirmación aclara que no se envía un correo real.

## H. Compilación final

Ejecuta en la terminal:

```bash
npm run test:run
npm run build
```

Registra cualquier error que aparezca. Una prueba automatizada aprobada no sustituye la revisión visual en Chrome.

## Resultado esperado

La navegación y las interacciones de demostración funcionan sin errores de consola, el diseño mantiene el sistema visual de la EA1 y los formularios muestran mensajes claros. El sitio no incluye backend ni pagos reales.
