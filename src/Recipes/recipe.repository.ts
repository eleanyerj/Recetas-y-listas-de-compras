import type { Pool } from '../shared/db.ts';
import type { CreateRecipeInput, Recipe, UpdateRecipeInput } from './recipe.model.ts';

export interface RecipeRepository {
  list(): Promise<Recipe[]>;
  findById(id: number): Promise<Recipe | null>;
  create(input: CreateRecipeInput): Promise<Recipe>;
  update(id: number, input: UpdateRecipeInput): Promise<Recipe | null>;
  remove(id: number): Promise<boolean>;
}

const SELECT_FIELDS = `
  id::int AS id,
  slug,
  categoria_id::int AS categoria_id,
  titulo,
  resumen,
  tiempo_minutos,
  porciones_base,
  imagen,
  pasos,
  creado_en::text AS creado_en
`;

export function createRecipeRepository(pool: Pool): RecipeRepository {
  return {
    async list() {
      const { rows } = await pool.query<Recipe>(
        `SELECT ${SELECT_FIELDS}
         FROM recetas
         ORDER BY id DESC
         LIMIT 100`,
      );
      return rows;
    },

    async findById(id) {
      const { rows } = await pool.query<Recipe>(
        `SELECT ${SELECT_FIELDS}
         FROM recetas
         WHERE id = $1`,
        [id],
      );
      return rows[0] ?? null;
    },

    async create(input) {
      const { rows } = await pool.query<Recipe>(
        `INSERT INTO recetas (
           slug, categoria_id, titulo, resumen, tiempo_minutos, porciones_base, imagen, pasos
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
         RETURNING ${SELECT_FIELDS}`,
        [
          input.slug,
          input.categoria_id,
          input.titulo,
          input.resumen,
          input.tiempo_minutos,
          input.porciones_base,
          input.imagen ?? '',
          JSON.stringify(input.pasos ?? []),
        ],
      );
      return rows[0]!;
    },

    async update(id, input) {
      const { rows } = await pool.query<Recipe>(
        `UPDATE recetas
         SET slug           = COALESCE($2, slug),
             categoria_id   = COALESCE($3, categoria_id),
             titulo         = COALESCE($4, titulo),
             resumen        = COALESCE($5, resumen),
             tiempo_minutos = COALESCE($6, tiempo_minutos),
             porciones_base = COALESCE($7, porciones_base),
             imagen         = COALESCE($8, imagen),
             pasos          = COALESCE($9::jsonb, pasos)
         WHERE id = $1
         RETURNING ${SELECT_FIELDS}`,
        [
          id,
          input.slug ?? null,
          input.categoria_id ?? null,
          input.titulo ?? null,
          input.resumen ?? null,
          input.tiempo_minutos ?? null,
          input.porciones_base ?? null,
          input.imagen ?? null,
          input.pasos ? JSON.stringify(input.pasos) : null,
        ],
      );
      return rows[0] ?? null;
    },

    async remove(id) {
      const result = await pool.query('DELETE FROM recetas WHERE id = $1', [id]);
      return (result.rowCount ?? 0) > 0;
    },
  };
}