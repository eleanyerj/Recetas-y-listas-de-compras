import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import type { RecipeRepository } from './recipe.repository.ts';

const idParamSchema = z.coerce.number().int().positive();

const createRecipeSchema = z.object({
  slug: z.string().trim().min(1).max(120),
  categoria_id: z.number().int().positive(),
  titulo: z.string().trim().min(1).max(160),
  resumen: z.string().trim().min(1),
  tiempo_minutos: z.number().int().min(1).max(1440),
  porciones_base: z.number().int().min(1).max(100),
  imagen: z.string().optional(),
  pasos: z.array(z.string()).optional(),
});

const updateRecipeSchema = createRecipeSchema.partial();

export function createRecipeRouter(repo: RecipeRepository): Router {
  const router = Router();

  // Listar recetas
  router.get('/', async (_req: Request, res: Response) => {
    const recipes = await repo.list();
    res.json(recipes);
  });

  // Ver una receta por ID
  router.get('/:id', async (req: Request, res: Response) => {
    const parsedId = idParamSchema.safeParse(req.params.id);
    if (!parsedId.success) {
      res.status(400).json({ error: 'ID inválido' });
      return;
    }

    const recipe = await repo.findById(parsedId.data);
    if (!recipe) {
      res.status(404).json({ error: 'Receta no encontrada' });
      return;
    }

    res.json(recipe);
  });

  // Crear receta
  router.post('/', async (req: Request, res: Response) => {
    const data = createRecipeSchema.parse(req.body);
    const created = await repo.create(data);
    res.status(201).json(created);
  });

  // Editar receta (PUT y PATCH)
  const handleUpdate = async (req: Request, res: Response) => {
    const parsedId = idParamSchema.safeParse(req.params.id);
    if (!parsedId.success) {
      res.status(400).json({ error: 'ID inválido' });
      return;
    }

    const data = updateRecipeSchema.parse(req.body);
    const updated = await repo.update(parsedId.data, data);
    if (!updated) {
      res.status(404).json({ error: 'Receta no encontrada' });
      return;
    }

    res.json(updated);
  };

  router.put('/:id', handleUpdate);
  router.patch('/:id', handleUpdate);

  // Borrar receta
  router.delete('/:id', async (req: Request, res: Response) => {
    const parsedId = idParamSchema.safeParse(req.params.id);
    if (!parsedId.success) {
      res.status(400).json({ error: 'ID inválido' });
      return;
    }

    const deleted = await repo.remove(parsedId.data);
    if (!deleted) {
      res.status(404).json({ error: 'Receta no encontrada' });
      return;
    }

    res.status(204).end();
  });

  return router;
}