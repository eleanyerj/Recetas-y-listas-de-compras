// Prueba de integración: la API completa contra un PostgreSQL REAL (base app_test).
// Requisito: la base debe estar corriendo →  docker compose up -d
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app/create-app.ts';
import { createPool } from '../../src/shared/db.ts';

try {
  process.loadEnvFile('.env');
} catch {
  // En CI no hay .env.
}

const pool = createPool(process.env.TEST_DATABASE_URL!);
const app = createApp({ pool });

beforeEach(async () => {
  await pool.query(
    'TRUNCATE receta_ingredientes, recetas, ingredientes, categorias, listas_compras RESTART IDENTITY CASCADE',
  );
  await pool.query(
    `INSERT INTO categorias (slug, nombre) VALUES ('criolla', 'Comida criolla')`,
  );
});

afterAll(async () => {
  await pool.end();
});

const baseRecipe = {
  slug: 'arepa-reina-pepiada',
  categoria_id: 1,
  titulo: 'Arepa Reina Pepiada',
  resumen: 'Arepa rellena con ensalada de pollo y aguacate',
  tiempo_minutos: 25,
  porciones_base: 4,
  imagen: '',
  pasos: ['Preparar la masa', 'Armar el relleno', 'Rellenar y servir'],
};

describe('API /api/recipes', () => {
  it('GET /api/health responde ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('crea una receta y la devuelve en la lista', async () => {
    const created = await request(app).post('/api/recipes').send(baseRecipe);
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({
      id: 1,
      titulo: 'Arepa Reina Pepiada',
      porciones_base: 4,
    });

    const list = await request(app).get('/api/recipes');
    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(1);
  });

  it('rechaza un título vacío con 400', async () => {
    const res = await request(app).post('/api/recipes').send({
      ...baseRecipe,
      titulo: '   ',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Datos no válidos');
  });

  it('edita una receta existente', async () => {
    await request(app).post('/api/recipes').send(baseRecipe);
    const res = await request(app).put('/api/recipes/1').send({
      titulo: 'Arepa Reina Pepiada Especial',
      porciones_base: 6,
    });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      titulo: 'Arepa Reina Pepiada Especial',
      porciones_base: 6,
    });
  });

  it('elimina una receta y luego responde 404', async () => {
    await request(app).post('/api/recipes').send(baseRecipe);
    expect((await request(app).delete('/api/recipes/1')).status).toBe(204);
    expect((await request(app).get('/api/recipes/1')).status).toBe(404);
  });

  it('no permite inyección SQL en el título: se guarda como texto', async () => {
    const malicious = "x'); DROP TABLE recetas; --";
    const res = await request(app).post('/api/recipes').send({
      ...baseRecipe,
      slug: 'prueba-sqli',
      titulo: malicious,
    });
    expect(res.status).toBe(201);
    expect(res.body.titulo).toBe(malicious);
    expect((await request(app).get('/api/recipes')).body).toHaveLength(1);
  });
});
