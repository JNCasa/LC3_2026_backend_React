-- Usar una vez cuando ya existen las tablas Usuarios y Productos.
PRAGMA foreign_keys = ON;

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
