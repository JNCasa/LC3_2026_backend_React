PRAGMA foreign_keys = ON;

-- Tabla de usuarios
CREATE TABLE Usuario (
    id_usuario INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    rol TEXT NOT NULL,
    estado TEXT NOT NULL
);

-- Tabla de productos
CREATE TABLE Producto (
    id_producto INTEGER PRIMARY KEY,
    titulo TEXT NOT NULL,
    nombre_producto TEXT NOT NULL,
    imagen TEXT NOT NULL,
    stock INTEGER NOT NULL CHECK (stock >= 0),
    precio REAL NOT NULL CHECK (precio > 0),
    peso TEXT NOT NULL
);

-- Tabla de tickets
CREATE TABLE Ticket (
    id_ticket INTEGER PRIMARY KEY,
    fecha DATE NOT NULL,
    id_usuario INTEGER NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

-- Tabla intermedia Ticket_Producto (detalle de ventas)
CREATE TABLE Ticket_Producto (
    id_ticket INTEGER NOT NULL,
    id_producto INTEGER NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    PRIMARY KEY (id_ticket, id_producto),
    FOREIGN KEY (id_ticket) REFERENCES Ticket(id_ticket),
    FOREIGN KEY (id_producto) REFERENCES Producto(id_producto)
);

-- Trigger para controlar stock al insertar un producto en un ticket
CREATE TRIGGER trg_descuento_stock
AFTER INSERT ON Ticket_Producto
FOR EACH ROW
BEGIN
    -- Validar stock suficiente
    SELECT CASE
        WHEN (SELECT stock FROM Producto WHERE id_producto = NEW.id_producto) < NEW.cantidad
        THEN RAISE(ABORT, 'Stock insuficiente')
    END;

    -- Descontar stock
    UPDATE Producto
    SET stock = stock - NEW.cantidad
    WHERE id_producto = NEW.id_producto;
END;
