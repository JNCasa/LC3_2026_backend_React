import { Productos } from "../models/Producto.js";

const writableFields = [
  "titulo",
  "nombre_producto",
  "imagen",
  "stock",
  "precio",
  "peso",
];

function readProductInput(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "El cuerpo de la solicitud debe ser un objeto JSON." };
  }

  const product = Object.fromEntries(
    writableFields.map((field) => [field, body[field]]),
  );

  for (const field of ["titulo", "nombre_producto", "imagen", "peso"]) {
    if (typeof product[field] !== "string" || !product[field].trim()) {
      return { error: `El campo ${field} es obligatorio.` };
    }
    product[field] = product[field].trim();
  }

  if (!Number.isInteger(product.stock) || product.stock < 0) {
    return { error: "El stock debe ser un número entero igual o mayor que cero." };
  }

  if (
    typeof product.precio !== "number" ||
    !Number.isFinite(product.precio) ||
    product.precio <= 0
  ) {
    return { error: "El precio debe ser un número mayor que cero." };
  }

  return { product };
}

function parseId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export async function findProducts(_req, res, next) {
  try {
    const products = await Productos.findAll({
      order: [["id_producto", "ASC"]],
    });
    res.json(products);
  } catch (error) {
    next(error);
  }
}

export async function findProduct(req, res, next) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "El ID del producto no es válido." });
  }

  try {
    const product = await Productos.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req, res, next) {
  const { product, error } = readProductInput(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  try {
    const createdProduct = await Productos.create(product);
    res.status(201).json(createdProduct);
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "El ID del producto no es válido." });
  }

  const { product, error } = readProductInput(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  try {
    const existingProduct = await Productos.findByPk(id);
    if (!existingProduct) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }

    await existingProduct.update(product);
    res.json(existingProduct);
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "El ID del producto no es válido." });
  }

  try {
    const product = await Productos.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }

    await product.destroy();
    return res.status(204).end();
  } catch (error) {
    next(error);
  }
}
