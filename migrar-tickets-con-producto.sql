-- Ejecutar una sola vez en una base que ya tenga Usuarios, Productos,
-- Tickets (id_ticket, fecha, id_usuario) y Tickets_Productos.
-- Conserva cada detalle de venta como una fila de Tickets.
PRAGMA foreign_keys = OFF;

BEGIN TRANSACTION;

DROP TRIGGER IF EXISTS trg_descuento_stock;
DROP TRIGGER IF EXISTS trg_validar_stock_ticket;
DROP TRIGGER IF EXISTS trg_descuento_stock_ticket;

CREATE TABLE Tickets_nueva (
    id_ticket INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    id_producto INTEGER NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    importe REAL NOT NULL CHECK (importe > 0),
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario),
    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
);

INSERT INTO Tickets_nueva (id_usuario, id_producto, cantidad, importe, fecha)
SELECT t.id_usuario,
       tp.id_producto,
       tp.cantidad,
       ROUND(p.precio * tp.cantidad, 2),
       COALESCE(datetime(t.fecha), CURRENT_TIMESTAMP)
FROM Tickets AS t
JOIN Tickets_Productos AS tp ON tp.id_ticket = t.id_ticket
JOIN Productos AS p ON p.id_producto = tp.id_producto
ORDER BY t.id_ticket, tp.id_producto;

DROP TABLE Tickets_Productos;
DROP TABLE Tickets;
ALTER TABLE Tickets_nueva RENAME TO Tickets;

CREATE TRIGGER trg_validar_stock_ticket
BEFORE INSERT ON Tickets
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
AFTER INSERT ON Tickets
FOR EACH ROW
BEGIN
    UPDATE Productos
    SET stock = stock - NEW.cantidad
    WHERE id_producto = NEW.id_producto;
END;

COMMIT;

PRAGMA foreign_keys = ON;
