export interface Recipe {
  id: number;
  slug: string;
  categoria_id: number;
  titulo: string;
  resumen: string;
  tiempo_minutos: number;
  porciones_base: number;
  imagen: string;
  pasos: string[];
  creado_en: string;
}

export interface CreateRecipeInput {
  slug: string;
  categoria_id: number;
  titulo: string;
  resumen: string;
  tiempo_minutos: number;
  porciones_base: number;
  imagen?: string;
  pasos?: string[];
}

export type UpdateRecipeInput = Partial<CreateRecipeInput>;