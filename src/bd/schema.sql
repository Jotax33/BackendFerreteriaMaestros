CREATE TABLE usuarios (
  id_usuario INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  correo VARCHAR(150) NOT NULL UNIQUE CHECK (correo = LOWER(correo)),
  nombre VARCHAR(100) NOT NULL,
  telefono VARCHAR(20),
  contrasenia_hash VARCHAR(100) NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'cliente'
    CHECK (rol IN ('cliente','admin')),
  activo BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE productos (
  codigo VARCHAR(30) PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  categoria VARCHAR(80) NOT NULL,
  subcategoria VARCHAR(80),
  marca VARCHAR(80),
  unidad VARCHAR(20) NOT NULL DEFAULT 'unidad',
  precio_compra NUMERIC(12,2) NOT NULL CHECK (precio_compra >= 0),
  precio_venta NUMERIC(12,2) NOT NULL CHECK (precio_venta > 0),
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  stock_minimo INT NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0)
);


 CREATE TABLE compras (
  id_compra INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_usuario INT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE RESTRICT,
  correo VARCHAR(150) NOT NULL REFERENCES usuarios(correo)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
  envio NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (envio >= 0),
  total NUMERIC(12,2) NOT NULL CHECK (total >= 0),
  metodo_envio VARCHAR(30) NOT NULL DEFAULT 'retiro',
  CHECK (total = subtotal + envio)
);
CREATE INDEX idx_compras_correo ON compras(correo);

CREATE TABLE detalle_compra (
  id_compra INT NOT NULL REFERENCES compras(id_compra) ON DELETE CASCADE,
  codigo VARCHAR(30) NOT NULL REFERENCES productos(codigo)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  cantidad INT NOT NULL CHECK (cantidad > 0),
  precio_unitario NUMERIC(12,2) NOT NULL CHECK (precio_unitario > 0),
  PRIMARY KEY (id_compra, codigo)
);

CREATE TABLE producto_visto (
  id_usuario INT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  codigo VARCHAR(30) NOT NULL REFERENCES productos(codigo)
    ON UPDATE CASCADE ON DELETE CASCADE,
  visto_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id_usuario, codigo)
);