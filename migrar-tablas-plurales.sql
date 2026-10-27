-- Ejecutar una sola vez sobre una base existente con tablas Usuario, Producto,
-- Ticket y Ticket_Producto. Conserva los registros y renombra las tablas.
PRAGMA foreign_keys = OFF;

BEGIN TRANSACTION;

ALTER TABLE Usuario RENAME TO Usuarios;
ALTER TABLE Producto RENAME TO Productos;
ALTER TABLE Ticket RENAME TO Tickets;
ALTER TABLE Ticket_Producto RENAME TO Tickets_Productos;

DROP TRIGGER IF EXISTS trg_descuento_stock;

CREATE TRIGGER trg_descuento_stock
AFTER INSERT ON Tickets_Productos
FOR EACH ROW
BEGIN
    SELECT CASE
        WHEN (SELECT stock FROM Productos WHERE id_producto = NEW.id_producto) < NEW.cantidad
        THEN RAISE(ABORT, 'Stock insuficiente')
    END;

    UPDATE Productos
    SET stock = stock - NEW.cantidad
    WHERE id_producto = NEW.id_producto;
END;

COMMIT;

PRAGMA foreign_keys = ON;
