// Datos de prueba (historia H10.3). Ejecuta: npm run seed
import pg from 'pg';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('Falta DATABASE_URL. Copia .env.example a .env.');
  process.exit(1);
}

const TOTAL = 10_000;
const client = new pg.Client({ connectionString: url });
await client.connect();

try {
  await client.query('BEGIN');

  // Limpia en orden por claves foráneas y reinicia identidades
  await client.query(
    'TRUNCATE TABLE receta_ingredientes, listas_compras, recetas, ingredientes, categorias RESTART IDENTITY CASCADE',
  );

  // Categorías base
  await client.query(`
    INSERT INTO categorias (nombre, descripcion) VALUES
      ('Desayuno', 'Platos para comenzar el día'),
      ('Almuerzo', 'Comidas principales del mediodía'),
      ('Cena', 'Opciones ligeras o tradicionales para la noche')
  `);

  // Ingredientes base
  await client.query(`
    INSERT INTO ingredientes (nombre, unidad_base) VALUES
      ('harina de maíz precocida', 'tazas'),
      ('pollo desmechado', 'tazas'),
      ('aguacate maduro', 'unidad'),
      ('queso blanco suave', 'g'),
      ('arroz blanco cocido', 'tazas'),
      ('caraotas negras guisadas', 'tazas')
  `);

  // 10.000 recetas generadas con generate_series
  await client.query(
    `INSERT INTO recetas (slug, categoria_id, titulo, resumen, tiempo_minutos, porciones_base, imagen, pasos)
     SELECT
       'receta-prueba-' || n,
       ((n - 1) % 3) + 1,
       'Receta de prueba #' || n,
       'Descripción de prueba generada automáticamente para la receta ' || n,
       15 + (n % 60),
       2 + ((n % 3) * 2),
       'placeholder-receta.png',
       '["Preparar los ingredientes base.", "Cocinar a fuego medio y servir."]'::jsonb
     FROM generate_series(1, $1::int) AS n`,
    [TOTAL],
  );

  // Relación N:M de ejemplo en las primeras 10.000 filas o sobre recetas base
  await client.query(`
    INSERT INTO receta_ingredientes (receta_id, ingrediente_id, cantidad, unidad)
    SELECT
      r.id,
      ((r.id - 1) % 6) + 1,
      1 + ((r.id % 4) * 0.5),
      'tazas'
    FROM recetas r
    WHERE r.id <= 500
    ON CONFLICT DO NOTHING
  `);

  await client.query('COMMIT');
  console.log(`Listo: ${TOTAL.toLocaleString('es-VE')} recetas de prueba insertadas.`);
} catch (error) {
  await client.query('ROLLBACK');
  console.error('No se pudieron cargar los datos:', (error as Error).message);
  process.exitCode = 1;
} finally {
  await client.end();
}