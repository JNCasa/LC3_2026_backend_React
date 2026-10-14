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
  models/
    Usuario.js               Modelo de Usuario
    Producto.js              Modelo de Producto
    Ticket.js                Modelo de Ticket
    TicketProducto.js        Modelo de Ticket_Producto
    associations.js          Relaciones entre los modelos
  services/
    product.service.js       Consultas y operaciones sobre productos
    user.service.js          Consulta segura de usuarios
routes/
  products.routes.js         Rutas /api/productos
  users.routes.js            Rutas /api/usuarios
```

## 3. Preparar e iniciar el backend

En una terminal, entrá a la carpeta `TPI_P3_2026 Backend`:

```powershell
cd "C:\Users\LENOVO\Documents\P3 2026\TPI_P3_2026 Backend"
npm install
npm run dev
```

El servidor queda disponible en `http://localhost:3000`. Para producción local sin modo de observación, usá `npm start`.

Opcionalmente, copiá `.env.example` a `.env` para cambiar el puerto o el origen permitido:

```env
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173
```

El puerto `5173` es el predeterminado de Vite. Si el frontend muestra otra dirección al iniciarse, usá esa dirección en `FRONTEND_ORIGIN`.

## 4. Comprobar que la API responde

Con el backend iniciado, probá estas direcciones en el navegador:

- `http://localhost:3000/api/health` — estado de la API.
- `http://localhost:3000/api/productos` — lista de productos.
- `http://localhost:3000/api/productos/1` — producto con ID 1.
- `http://localhost:3000/api/usuarios` — lista de usuarios sin contraseñas.

La API también permite crear, reemplazar y eliminar productos con `POST`, `PUT` y `DELETE` en `/api/productos`. Un producto requiere `titulo`, `nombre_producto`, `imagen`, `stock`, `precio` y `peso`.

## 5. Mostrar los productos en React con `useEffect`

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

## 6. Cómo seguir el patrón del profesor

Para agregar otra entidad o ruta, repetí estos pasos:

1. **Modelo:** creá un archivo en `src/models/` que describa los campos existentes y escribí el nombre exacto de la tabla con `tableName`.
2. **Servicio:** creá las operaciones en `src/services/`; validá los datos y respondé errores con estados HTTP adecuados.
3. **Ruta:** creá un router en `routes/` que conecte los métodos HTTP con las funciones del servicio.
4. **Registro:** importá el router en `src/index.js` y montalo con `app.use`.
5. **Frontend:** pedí el endpoint con `fetch` dentro de `useEffect` para cargar datos al montar el componente.
6. **Prueba:** abrí el endpoint en el navegador y comprobá que React muestra la respuesta.

## 7. Cuidado con la base existente

`src/db.js` señala a `dietetica.db` dentro de la carpeta del backend. El servidor usa `sequelize.authenticate()` para comprobar la conexión; **no ejecuta `sequelize.sync()` ni recrea las tablas**. Así se preservan los datos importados y el trigger `trg_descuento_stock`, que descuenta inventario cuando se inserta una línea de ticket.

Los modelos coinciden con las tablas `Usuario`, `Producto`, `Ticket` y `Ticket_Producto`. El modelo de usuario y el endpoint público omiten el campo `password`. Las contraseñas actuales son datos de demostración en texto plano: no sirven para autenticación real. Antes de implementar login, deben reemplazarse por hashes seguros.

> Los productos se cargaron con stock inicial 0 porque los JSON de origen no incluían inventario.
