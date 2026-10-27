-- Ejecutar una sola vez sobre la estructura anterior, donde cada fila de
-- Tickets representa un producto vendido. Agrupa filas con el mismo usuario
-- y fecha en una compra, conservando sus productos, cantidades e importes.
PRAGMA foreign_keys = OFF;

BEGIN IMMEDIATE;

DROP TRIGGER IF EXISTS trg_validar_stock_ticket;
DROP TRIGGER IF EXISTS trg_descuento_stock_ticket;

CREATE TEMP TABLE ticket_mapa AS
SELECT MIN(id_ticket) AS id_ticket, id_usuario, fecha
FROM Tickets
GROUP BY id_usuario, fecha;

CREATE TABLE Tickets_nueva (
    id_ticket INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    fecha DATETIME NOT NULL,
    monto_total REAL NOT NULL CHECK (monto_total > 0),
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);

INSERT INTO Tickets_nueva (id_ticket, id_usuario, fecha, monto_total)
SELECT mapa.id_ticket,
       mapa.id_usuario,
       mapa.fecha,
       ROUND(SUM(ticket.importe), 2)
FROM ticket_mapa AS mapa
JOIN Tickets AS ticket
  ON ticket.id_usuario = mapa.id_usuario
 AND ticket.fecha = mapa.fecha
GROUP BY mapa.id_ticket, mapa.id_usuario, mapa.fecha;

CREATE TABLE Tickets_Productos_nueva (
    id_ticket INTEGER NOT NULL,
    id_producto INTEGER NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    importe REAL NOT NULL CHECK (importe > 0),
    PRIMARY KEY (id_ticket, id_producto),
    FOREIGN KEY (id_ticket) REFERENCES Tickets_nueva(id_ticket),
    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
);

INSERT INTO Tickets_Productos_nueva (id_ticket, id_producto, cantidad, importe)
SELECT mapa.id_ticket,
       ticket.id_producto,
       SUM(ticket.cantidad),
       ROUND(SUM(ticket.importe), 2)
FROM Tickets AS ticket
JOIN ticket_mapa AS mapa
  ON mapa.id_usuario = ticket.id_usuario
 AND mapa.fecha = ticket.fecha
GROUP BY mapa.id_ticket, ticket.id_producto;

DROP TABLE Tickets;
ALTER TABLE Tickets_nueva RENAME TO Tickets;
ALTER TABLE Tickets_Productos_nueva RENAME TO Tickets_Productos;
DROP TABLE ticket_mapa;

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

COMMIT;

PRAGMA foreign_keys = ON;
