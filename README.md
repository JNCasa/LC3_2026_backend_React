# Backend de Dietética

Backend de práctica con el mismo stack y organización general del proyecto del profesor: **Node.js, Express, Sequelize y SQLite**. La API usa la base existente `dietetica.db`.

## 1. Cómo se conectan las partes

```text
React (useEffect) -> HTTP/fetch -> Express -> servicio -> modelo Sequelize -> dietetica.db
```

- **Express** recibe solicitudes HTTP.
- **Las rutas** enlazan una URL con una función de servicio.
- **Los servicios** consultan o modifican registros mediante Sequelize.
- **Los modelos** describen las tablas que ya existen en SQLite.
- **React `useEffect`** solicita los datos a la API cuando se monta el componente.

## 2. Archivos importantes

```text
src/
  config.js                  Puerto y origen permitido del frontend
  db.js                      Conexión Sequelize a dietetica.db
  index.js                   Inicio de Express y conexión a SQLite
  middleware/
    auth.js                  Verificación del JWT y autorización por rol
  models/
    Usuario.js               Modelo de Usuario
    Producto.js              Modelo de Producto
    Ticket.js                Modelo de compra (ticket)
    DetalleTicket.js         Productos de cada ticket
    associations.js          Relaciones entre los modelos
  services/
    auth.service.js          Registro, login y emisión del JWT
    product.service.js       Consultas y operaciones sobre productos
    user.service.js          Consulta segura de usuarios
routes/
  auth.routes.js             Rutas /api/auth
  products.routes.js         Rutas /api/productos
  users.routes.js            Rutas /api/usuarios
  tickets.routes.js          Rutas /api/Tickets
```

## 3. Preparar e iniciar el backend

En una terminal, entrá a la carpeta `TPI_P3_2026 Backend`:

```powershell
cd "C:\Users\LENOVO\Documents\P3 2026\TPI_P3_2026 Backend"
npm install
npm run dev
```

El servidor queda disponible en `http://localhost:3000`. Para producción local sin modo de observación, usá `npm start`.

Antes de iniciar el servidor, copiá `.env.example` a `.env` y configurá estas variables:

```env
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173
JWT_SECRET=PEGA_AQUI_UNA_CLAVE_ALEATORIA
```

El puerto `5173` es el predeterminado de Vite. Si el frontend muestra otra dirección al iniciarse, usá esa dirección en `FRONTEND_ORIGIN`.
Para generar una clave JWT segura, ejecutá `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"` y copiá el resultado como valor de `JWT_SECRET`. La clave debe tener al menos 32 bytes. No compartas ni subas el archivo `.env`.

## 4. Autenticación y permisos para probar con Postman

El backend implementa autenticación JWT, con tokens que vencen en una hora. Registrá una cuenta cliente en `POST http://localhost:3000/api/auth/register`:

```json
{
  "nombre": "Cliente de prueba",
  "email": "cliente@example.com",
  "password": "Cliente123"
}
```

El registro público siempre crea cuentas con rol `Cliente`. La contraseña requiere al menos 8 caracteres, una mayúscula, una minúscula y un número. Para iniciar sesión, enviá `POST /api/auth/login`:

```json
{
  "email": "cliente@example.com",
  "password": "Cliente123"
}
```

Copiá `token` de la respuesta. En Postman, abrí **Authorization → Bearer Token** y pegalo para probar rutas privadas. También podés enviarlo en el header `Authorization: Bearer <token>`. `GET /api/auth/me` devuelve la cuenta autenticada.

Permisos aplicados en el servidor:

- **Administrador:** lista, crea y cambia rol/estado de usuarios (`GET/POST /api/Usuarios`, `PATCH /api/Usuarios/:id`) y puede editar tickets.
- **Vendedor:** consulta y hace ABM de productos (`GET/POST/PUT/DELETE /api/Productos`).
- **Cliente:** consulta productos, crea compras y solo puede consultar sus propios tickets.
- Todas las rutas de productos, usuarios y tickets requieren iniciar sesión. Las rutas de registro y login son públicas; el registro público no permite elegir un rol.
- Sin token o con token inválido/expirado se responde `401`; si el rol no tiene permiso, `403`.

Al iniciar sesión correctamente por primera vez, las cuentas de demostración cuya contraseña todavía está en texto plano se actualizan automáticamente a bcrypt. Cuentas con estado distinto de `Activo` no pueden iniciar sesión.

## 5. Comprobar que la API responde

Con el backend iniciado, probá estas direcciones en el navegador:

- `http://localhost:3000/api/health` — estado de la API.
- `http://localhost:3000/api/productos` — lista de productos.
- `http://localhost:3000/api/productos/1` — producto con ID 1.
- `http://localhost:3000/api/usuarios` — lista de usuarios sin contraseñas.
- `http://localhost:3000/api/Tickets` — compras con `id_ticket`, `fecha`, `monto_total` y sus productos.
- `http://localhost:3000/api/Tickets/1` — compra con ID 1 y sus productos.

La API también permite crear, reemplazar y eliminar productos con `POST`, `PUT` y `DELETE` en `/api/productos`. Un producto requiere `titulo`, `nombre_producto`, `imagen`, `stock`, `precio` y `peso`.

Para registrar una compra con `POST /api/Tickets` o reemplazar los datos y productos de una compra con `PUT /api/Tickets/1`, enviá el usuario y todos los productos:

```json
{
  "id_usuario": 1,
  "productos": [
    { "id_producto": 1, "cantidad": 2 },
    { "id_producto": 3, "cantidad": 1 }
  ]
}
```

La respuesta contiene un solo ticket con `id_ticket`, `fecha`, `monto_total`, `usuario` y el arreglo `productos`. El importe de cada línea y el total se calculan usando los precios actuales de la base; el stock se descuenta por producto.

## 6. Mostrar los productos en React con `useEffect`

En el componente del frontend que muestra el catálogo, usá un efecto para pedir los datos a la API. Ejemplo mínimo:

```jsx
import { useEffect, useState } from "react";

function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function cargarProductos() {
      try {
        const respuesta = await fetch(
          "http://localhost:3000/api/productos",
          { signal: controller.signal }
        );
        if (!respuesta.ok) {
          throw new Error(`Error HTTP ${respuesta.status}`);
        }
        setProductos(await respuesta.json());
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("No se pudieron cargar los productos.");
          console.error(err);
        }
      }
    }

    cargarProductos();
    return () => controller.abort();
  }, []);

  if (error) return <p role="alert">{error}</p>;

  return (
    <ul>
      {productos.map((producto) => (
        <li key={producto.id_producto}>
          {producto.nombre_producto} — ${producto.precio}
        </li>
      ))}
    </ul>
  );
}

export default Catalogo;
```

El arreglo vacío `[]` indica que la carga se hace al montar el componente. React Strict Mode puede iniciar y cancelar una solicitud adicional en desarrollo; `AbortController` limpia la solicitud al desmontar el componente.

## 7. Cómo seguir el patrón del profesor

Para agregar otra entidad o ruta, repetí estos pasos:

1. **Modelo:** creá un archivo en `src/models/` que describa los campos existentes y escribí el nombre exacto de la tabla con `tableName`.
2. **Servicio:** creá las operaciones en `src/services/`; validá los datos y respondé errores con estados HTTP adecuados.
3. **Ruta:** creá un router en `routes/` que conecte los métodos HTTP con las funciones del servicio.
4. **Registro:** importá el router en `src/index.js` y montalo con `app.use`.
5. **Frontend:** pedí el endpoint con `fetch` dentro de `useEffect` para cargar datos al montar el componente.
6. **Prueba:** abrí el endpoint en el navegador y comprobá que React muestra la respuesta.

## 8. Cuidado con la base existente

`src/db.js` señala a `dietetica.db` dentro de la carpeta del backend. El servidor usa `sequelize.authenticate()` para comprobar la conexión; **no ejecuta `sequelize.sync()` ni recrea las tablas**. `Tickets` almacena una compra (`id_ticket`, `id_usuario`, `fecha`, `monto_total`) y `Tickets_Productos` almacena sus líneas (`id_ticket`, `id_producto`, `cantidad`, `importe`). El trigger de stock actúa al insertar cada línea.

Para convertir una base existente donde cada fila de `Tickets` representa un producto, hacé una copia de seguridad y ejecutá una sola vez `migrar-compras-con-detalle.sql`. La migración agrupa las filas por usuario y fecha, preserva sus importes/productos y no vuelve a descontar el stock.

Los modelos coinciden con las tablas `Usuarios`, `Productos`, `Tickets` y `Tickets_Productos`. El modelo de usuario y los endpoints omiten el campo `password`.

> Los productos se cargaron con stock inicial 0 porque los JSON de origen no incluían inventario.
