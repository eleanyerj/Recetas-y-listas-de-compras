-- Migración H10.1 / H10.2: Modelo Entidad-Relación para Recetas y Listas de Compras

CREATE TABLE categorias (
  id          BIGSERIAL    PRIMARY KEY,
  nombre      VARCHAR(80)  NOT NULL UNIQUE,
  descripcion TEXT         NOT NULL DEFAULT ''
);

CREATE TABLE recetas (
  id               BIGSERIAL     PRIMARY KEY,
  slug             VARCHAR(120)  NOT NULL UNIQUE,
  categoria_id     BIGINT        NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
  titulo           VARCHAR(160)  NOT NULL,
  resumen          TEXT          NOT NULL,
  tiempo_minutos   INTEGER       NOT NULL CHECK (tiempo_minutos > 0 AND tiempo_minutos <= 1440),
  porciones_base   INTEGER       NOT NULL CHECK (porciones_base > 0 AND porciones_base <= 100),
  imagen           TEXT          NOT NULL DEFAULT '',
  pasos            JSONB         NOT NULL DEFAULT '[]'::jsonb,
  creado_en        TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE TABLE ingredientes (
  id           BIGSERIAL     PRIMARY KEY,
  nombre       VARCHAR(120)  NOT NULL UNIQUE,
  unidad_base  VARCHAR(40)   NOT NULL CHECK (char_length(trim(unidad_base)) > 0)
);

-- Relación Muchos a Muchos (N:M) entre recetas e ingredientes
CREATE TABLE receta_ingredientes (
  receta_id       BIGINT         NOT NULL REFERENCES recetas(id) ON DELETE CASCADE,
  ingrediente_id  BIGINT         NOT NULL REFERENCES ingredientes(id) ON DELETE RESTRICT,
  cantidad        NUMERIC(10, 2) NOT NULL CHECK (cantidad > 0),
  unidad          VARCHAR(40)    NOT NULL CHECK (char_length(trim(unidad)) > 0),
  PRIMARY KEY (receta_id, ingrediente_id)
);

CREATE TABLE listas_compras (
  id          BIGSERIAL    PRIMARY KEY,
  nombre      VARCHAR(140) NOT NULL CHECK (char_length(trim(nombre)) > 0),
  estado      VARCHAR(20)  NOT NULL DEFAULT 'activa'
                CHECK (estado IN ('activa', 'completada', 'archivada')),
  creada_en   TIMESTAMPTZ  NOT NULL DEFAULT now()
); 