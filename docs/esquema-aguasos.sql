-- aguaSOS · traducción SQL del modelo Convex (7 tablas)
-- Fuente de verdad: docs/modelo-datos.md
-- Esto NO es el backend. Convex no ejecuta este archivo.
-- Sirve para leer, comparar y dibujar el ER en cualquier herramienta SQL.
--
-- Convex añade _id y _creationTime a cada fila.
-- Aquí: id uuid + creado_en timestamptz.
-- Los timestamps de dominio que en Convex son number (epoch ms)
-- se expresan como timestamptz.

BEGIN;

CREATE SCHEMA IF NOT EXISTS aguasos;
SET search_path TO aguasos, public;

-- ── Literales del modelo (v.union en Convex) ───────────────────────────────

CREATE TYPE rol_usuario AS ENUM (
  'miembro',
  'consumidor',
  'suministrador',
  'admin'
);

CREATE TYPE tipo_organizacion AS ENUM (
  'universidad',
  'ong_humanitaria',
  'ong_otra',
  'gobierno',
  'cuerpo_socorro'
);

CREATE TYPE estado_verificacion AS ENUM (
  'pendiente',
  'aprobado',
  'rechazado'
);

CREATE TYPE tipo_zona AS ENUM (
  'departamento',
  'municipio',
  'distrito'
);

CREATE TYPE personas_rango AS ENUM (
  '1-5',
  '6-20',
  '21-100',
  '101-500',
  '500+'
);

CREATE TYPE impacto_espacial AS ENUM (
  'casa',
  'pasaje',
  'comunidad'
);

CREATE TYPE estado_reporte AS ENUM (
  'publicado',
  'oculto',
  'rechazado'
);

CREATE TYPE tipo_suministro AS ENUM (
  'embotellada',
  'pozo',
  'nacimiento',
  'tanque',
  'donacion'
);

CREATE TYPE nivel_riesgo AS ENUM (
  'normal',
  'vigilancia',
  'emergencia'
);

CREATE TYPE nivel_alerta AS ENUM (
  'vigilancia',
  'emergencia'
);

-- ── 1. usuarios  (Convex: usuarios) ────────────────────────────────────────
-- Clerk es la identidad. Aquí viven rol y perfil.

CREATE TABLE usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text NOT NULL UNIQUE,          -- by_clerk
  rol rol_usuario NOT NULL,
  nombre text NOT NULL,
  apellidos text,
  email text NOT NULL,
  telefono text,                               -- obligatorio si rol = suministrador
  tipo_organizacion tipo_organizacion,         -- solo consumidor
  organizacion text,
  estado_verificacion estado_verificacion NOT NULL,
  creado_en timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (rol = 'suministrador' AND telefono IS NOT NULL)
    OR rol <> 'suministrador'
  ),
  CHECK (
    (rol = 'consumidor' AND tipo_organizacion IS NOT NULL)
    OR rol <> 'consumidor'
  )
);

CREATE INDEX by_rol_estado ON usuarios (rol, estado_verificacion);

-- ── 2. zonas  (Convex: zonas) ──────────────────────────────────────────────
-- departamento → municipio → distrito. El cantón es texto libre en el reporte.

CREATE TABLE zonas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo tipo_zona NOT NULL,
  nombre text NOT NULL,
  codigo text NOT NULL,
  padre_id uuid REFERENCES zonas (id) ON DELETE RESTRICT,
  centroide_lat double precision NOT NULL,
  centroide_lng double precision NOT NULL,
  poblacion integer,                           -- denominador del umbral de emergencia
  creado_en timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tipo, codigo),                       -- by_codigo, único por tipo
  CHECK (
    (tipo = 'departamento' AND padre_id IS NULL)
    OR (tipo <> 'departamento' AND padre_id IS NOT NULL)
  )
);

CREATE INDEX by_tipo ON zonas (tipo);
CREATE INDEX by_padre ON zonas (padre_id);

-- ── 3. reportes_escasez  (Convex: reportesEscasez) ─────────────────────────
-- Se escribe una vez. El decaimiento se calcula al leer:
--   peso = severidad_base * 0.5 ^ (dias / 14)
--   activo ⇔ peso >= 0.5
-- No hay columna activo ni vence_en.

CREATE TABLE reportes_escasez (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  autor_id uuid REFERENCES usuarios (id) ON DELETE SET NULL,  -- NULL = invitado
  clave_idempotencia text NOT NULL UNIQUE,     -- by_idempotencia; UUID del cliente
  escasez_desde timestamptz NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  precision_m double precision,
  distrito_id uuid NOT NULL REFERENCES zonas (id) ON DELETE RESTRICT,
  canton text,                                 -- texto libre, no catálogo
  personas_rango personas_rango NOT NULL,
  personas_est numeric NOT NULL,               -- punto medio del rango
  menores numeric NOT NULL,
  impacto impacto_espacial NOT NULL,
  -- Unión discriminada embebida, igual que en Convex:
  -- [{tipo:'siembra', cultivo, hectareas, porcentajePerdida} | {tipo:'otra', descripcion}]
  afectacion_economica jsonb NOT NULL DEFAULT '[]'::jsonb,
  severidad_base numeric NOT NULL,             -- congelada en el insert
  estado estado_reporte NOT NULL DEFAULT 'publicado',
  creado_en timestamptz NOT NULL DEFAULT now(),
  CHECK (jsonb_typeof(afectacion_economica) = 'array')
);

CREATE INDEX by_autor ON reportes_escasez (autor_id);
CREATE INDEX by_distrito ON reportes_escasez (distrito_id);
CREATE INDEX by_lat ON reportes_escasez (lat);

-- ── 4. fuentes_suministro  (Convex: fuentesSuministro) ─────────────────────
-- El suministrador es un usuario. Contacto y transporte viven aquí.
-- El teléfono es público (consentimiento en el alta).

CREATE TABLE fuentes_suministro (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  propietario_id uuid NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
  nombre_lugar text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  distrito_id uuid NOT NULL REFERENCES zonas (id) ON DELETE RESTRICT,
  canton text,
  tipos_suministro tipo_suministro[] NOT NULL,
  tiene_transporte boolean NOT NULL DEFAULT false,
  contacto_nombre text NOT NULL,
  contacto_telefono text NOT NULL,
  contacto_email text,
  disponible boolean NOT NULL DEFAULT true,
  verificada boolean NOT NULL DEFAULT false,   -- la marca el admin
  creado_en timestamptz NOT NULL DEFAULT now(),
  CHECK (cardinality(tipos_suministro) >= 1)
);

CREATE INDEX by_propietario ON fuentes_suministro (propietario_id);
CREATE INDEX by_fuente_lat ON fuentes_suministro (lat);
CREATE INDEX by_fuente_distrito ON fuentes_suministro (distrito_id);

-- ── 5. riesgo_zona  (Convex: riesgoZona) ───────────────────────────────────
-- Agregado materializado. Una fila por zona (1:1).
-- riesgo = Σ peso(reporte) al momento del cálculo.

CREATE TABLE riesgo_zona (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zona_id uuid NOT NULL UNIQUE REFERENCES zonas (id) ON DELETE CASCADE,  -- by_zona
  riesgo numeric NOT NULL,
  reportes_activos integer NOT NULL,
  personas_afectadas numeric NOT NULL,
  nivel nivel_riesgo NOT NULL,
  calculado_en timestamptz NOT NULL,
  creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX by_nivel ON riesgo_zona (nivel);

-- ── 6. api_keys  (Convex: apiKeys) ─────────────────────────────────────────
-- El token en claro se muestra una vez. Aquí solo el SHA-256.

CREATE TABLE api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  propietario_id uuid NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
  nombre text NOT NULL,
  hash text NOT NULL UNIQUE,                   -- by_hash; SHA-256
  prefijo text NOT NULL,                       -- primeros 8 caracteres
  ultimo_uso timestamptz,
  revocada_en timestamptz,                     -- NULL = vigente; no se borra la fila
  creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX by_propietario_clave ON api_keys (propietario_id);

-- ── 7. alertas_emergencia  (Convex: alertasEmergencia) ─────────────────────
-- Historial de transiciones. cerrada_en IS NULL ⇒ alerta abierta.

CREATE TABLE alertas_emergencia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zona_id uuid NOT NULL REFERENCES zonas (id) ON DELETE RESTRICT,
  nivel nivel_alerta NOT NULL,
  riesgo_al_abrir numeric NOT NULL,
  cerrada_en timestamptz,
  reconocida_por uuid REFERENCES usuarios (id) ON DELETE SET NULL,
  reconocida_en timestamptz,
  creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX by_alerta_zona ON alertas_emergencia (zona_id);
CREATE INDEX by_abiertas ON alertas_emergencia (cerrada_en);

COMMIT;
