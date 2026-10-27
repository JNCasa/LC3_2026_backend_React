PRAGMA foreign_keys = ON;

-- Tabla de usuarios
CREATE TABLE Usuarios (
    id_usuario INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    rol TEXT NOT NULL,
    estado TEXT NOT NULL
);

-- Tabla de productos
CREATE TABLE Productos (
    id_producto INTEGER PRIMARY KEY,
    titulo TEXT NOT NULL,
    nombre_producto TEXT NOT NULL,
    imagen TEXT NOT NULL,
    stock INTEGER NOT NULL CHECK (stock >= 0),
    precio REAL NOT NULL CHECK (precio > 0),
    peso TEXT NOT NULL
);

-- Un ticket representa una compra; sus productos se guardan en el detalle.
CREATE TABLE Tickets (
    id_ticket INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    monto_total REAL NOT NULL CHECK (monto_total > 0),
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);

CREATE TABLE Tickets_Productos (
    id_ticket INTEGER NOT NULL,
    id_producto INTEGER NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    importe REAL NOT NULL CHECK (importe > 0),
    PRIMARY KEY (id_ticket, id_producto),
    FOREIGN KEY (id_ticket) REFERENCES Tickets(id_ticket),
    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
);

-- Impide registrar una línea si no existe el producto o no alcanza el stock.
CREATE TRIGGER trg_validar_stock_ticket
BEFORE INSERT ON Tickets_Productos
FOR EACH ROW
BEGIN
    SELECT CASE
        WHEN (SELECT stock FROM Productos WHERE id_producto = NEW.id_producto) IS NULL
        THEN RAISE(ABORT, 'Producto inexistente')
        WHEN (SELECT stock FROM Productos WHERE id_producto = NEW.id_producto) < NEW.cantidad
        THEN RAISE(ABORT, 'Stock insuficiente')
    END;
END;

CREATE TRIGGER trg_descuento_stock_ticket
AFTER INSERT ON Tickets_Productos
FOR EACH ROW
BEGIN
    UPDATE Productos
    SET stock = stock - NEW.cantidad
    WHERE id_producto = NEW.id_producto;
END;

-- Productos iniciales del frontend; el JSON no define stock, por eso se inicia en 20.
INSERT INTO Productos (
    id_producto, titulo, nombre_producto, imagen, stock, precio, peso
) VALUES
    (1, 'Producto 1', 'Té Ahumado Agos', 'im1.png', 20, 10, '600 grs.'),
    (2, 'Producto 2', 'Malta Orgánica J.JUNCO', 'im2.png', 20, 20, '1 Kg'),
    (3, 'Producto 3', 'Café José Velez', 'im3.png', 20, 30, '500 grs.'),
    (4, 'Producto 4', 'Jugo orgánico La Trigresa', 'im4.png', 20, 40, '1 lts.'),
    (5, 'Producto 5', 'Miel Orgámica el riojano', 'im5.png', 20, 50, '500 cc'),
    (6, 'Producto 6', 'H. de Coco Jorge Drexler', 'im6.png', 20, 60, '2 Kg'),
    (7, 'Producto 7', 'Té verde Elegante', 'im7.png', 20, 80, '420 gr'),
    (8, 'Producto 8', 'Granola Mirtha', 'im8.png', 20, 90, '101 gr'),
    (9, 'Producto 9', 'Azúcar Moreno Guille', 'im9.png', 20, 100, '1 kg'),
    (10, 'Producto 10', 'Miel Millei', 'im10.png', 20, 100, '800 cc');
