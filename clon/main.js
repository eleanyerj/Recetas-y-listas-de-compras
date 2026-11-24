const RECETAS = [
  {
    id: "arepas-reina-pepiada",
    titulo: "Arepas rellenas de pollo y aguacate",
    categoria: "Desayuno",
    tiempo: "25 min",
    porcionesBase: 4,
    imagen: "Captura de pantalla 2026-11-19 192224.png",
    resumen: "Arepas doradas por fuera y suaves por dentro con relleno cremoso.",
    ingredientes: [
      { cantidad: 2, unidad: "tazas", nombre: "harina de maíz precocida" },
      { cantidad: 2.5, unidad: "tazas", nombre: "agua" },
      { cantidad: 1, unidad: "cucharadita", nombre: "sal" },
      { cantidad: 2, unidad: "tazas", nombre: "pollo desmechado" },
      { cantidad: 1, unidad: "unidad", nombre: "aguacate maduro" }
    ],
    pasos: [
      "Mezcla el agua y la sal, agrega la harina poco a poco y amasa hasta que quede suave.",
      "Forma discos y ásalos en budare o sartén hasta dorar ambos lados.",
      "Mezcla el pollo desmechado con aguacate, abre las arepas y rellena al gusto."
    ]
  },
  {
    id: "pabellon-casero",
    titulo: "Pabellón criollo",
    categoria: "Almuerzo",
    tiempo: "45 min",
    porcionesBase: 4,
    imagen: "Captura de pantalla 2026-11-19 192137.png",
    resumen: "Plato completo con carne mechada, caraotas negras, arroz blanco y tajadas.",
    ingredientes: [
      { cantidad: 1.5, unidad: "tazas", nombre: "arroz blanco cocido" },
      { cantidad: 2, unidad: "tazas", nombre: "caraotas negras guisadas" },
      { cantidad: 300, unidad: "g", nombre: "carne desmechada guisada" },
      { cantidad: 2, unidad: "unidades", nombre: "plátanos maduros en tajadas" }
    ],
    pasos: [
      "Fríe las tajadas de plátano maduro hasta dorar y escúrrelas en papel absorbente.",
      "Calienta por separado el arroz, las caraotas y la carne guisada.",
      "Sirve todo junto en el plato acompañado de las tajadas."
    ]
  },
  {
    id: "cachapas-maiz",
    titulo: "Cachapas de maíz tierno con queso",
    categoria: "Cena",
    tiempo: "30 min",
    porcionesBase: 4,
    imagen: "Captura de pantalla 2026-11-19 192826.png",
    resumen: "Tortas dulces y jugosas de maíz con queso fresco rallado o en lonjas.",
    ingredientes: [
      { cantidad: 4, unidad: "tazas", nombre: "granos de maíz tierno" },
      { cantidad: 2, unidad: "cucharadas", nombre: "azúcar" },
      { cantidad: 1, unidad: "pizca", nombre: "sal" },
      { cantidad: 200, unidad: "g", nombre: "queso blanco suave" }
    ],
    pasos: [
      "Licúa o muele el maíz con el azúcar, la sal y un toque de líquido hasta lograr una mezcla espesa.",
      "Vierte cucharones en sartén caliente con un poco de mantequilla y cocina hasta que salgan burbujas.",
      "Voltea, coloca el queso encima y dobla antes de servir."
    ]
  }
];

function formatearCantidad(valor) {
  const redondeado = Math.round(valor * 100) / 100;
  return Number.isInteger(redondeado) ? String(redondeado) : String(redondeado);
}

function renderizarIngredientes(ingredientes, porcionesBase, porcionesElegidas) {
  const factor = porcionesElegidas / porcionesBase;
  return ingredientes
    .map((ing) => {
      const cantidadAjustada = formatearCantidad(ing.cantidad * factor);
      return `<li>${cantidadAjustada} ${ing.unidad} de ${ing.nombre}</li>`;
    })
    .join("");
}

function crearTarjetaHTML(receta) {
  return `
    <article class="tarjeta">
      <img class="tarjeta-img" src="${receta.imagen}" alt="${receta.titulo}" />
      <div class="tarjeta-cuerpo">
        <span class="etiqueta">${receta.categoria} · ${receta.tiempo}</span>
        <h3>${receta.titulo}</h3>
        <p>${receta.resumen}</p>
        <div>
          <a class="boton" href="recetas.html?id=${encodeURIComponent(receta.id)}">Ver receta</a>
        </div>
      </div>
    </article>
  `;
}

function iniciarPortada() {
  const contenedor = document.getElementById("catalogo-recetas");
  if (!contenedor) return;

  contenedor.innerHTML = RECETAS.map(crearTarjetaHTML).join("");
}

function iniciarDetalle() {
  const contenedor = document.getElementById("detalle-receta");
  if (!contenedor) return;

  const params = new URLSearchParams(window.location.search);
  const idParam = params.get("id");
  const receta = RECETAS.find((item) => item.id === idParam) || RECETAS[0];
  const porcionesIniciales = receta.porcionesBase || 4;

  contenedor.innerHTML = `
    <span class="etiqueta">${receta.categoria} · ${receta.tiempo}</span>
    <h1>${receta.titulo}</h1>
    <p>${receta.resumen}</p>
    <img class="tarjeta-img" src="${receta.imagen}" alt="${receta.titulo}" style="max-width: 600px; margin-top: 12px; border-radius: 10px;" />

    <div style="margin-top: 18px; display: flex; flex-wrap: wrap; gap: 12px; align-items: center;">
      <label for="selector-porciones"><strong>Porciones:</strong></label>
      <select id="selector-porciones" style="padding: 8px 10px; border-radius: 8px; border: 1px solid #cbd5e1;">
        <option value="2">2 porciones</option>
        <option value="4" selected>4 porciones</option>
        <option value="6">6 porciones</option>
      </select>
    </div>

    <h2>Ingredientes</h2>
    <ul id="lista-ingredientes">
      ${renderizarIngredientes(receta.ingredientes, porcionesIniciales, porcionesIniciales)}
    </ul>

    <h2>Preparación</h2>
    <ol>
      ${receta.pasos.map((paso) => `<li>${paso}</li>`).join("")}
    </ol>
  `;

  const selectorPorciones = document.getElementById("selector-porciones");
  const listaIngredientes = document.getElementById("lista-ingredientes");

  if (selectorPorciones && listaIngredientes) {
    selectorPorciones.addEventListener("change", () => {
      const nuevasPorciones = Number(selectorPorciones.value) || porcionesIniciales;
      listaIngredientes.innerHTML = renderizarIngredientes(
        receta.ingredientes,
        porcionesIniciales,
        nuevasPorciones
      );
    });
  }
}

function iniciarBusqueda() {
  const formulario = document.getElementById("form-busqueda");
  const inputTexto = document.getElementById("input-busqueda");
  const selectCategoria = document.getElementById("select-categoria");
  const contenedor = document.getElementById("resultados-busqueda");
  if (!contenedor) return;

  function actualizarResultados() {
    const texto = inputTexto ? inputTexto.value.trim().toLowerCase() : "";
    const categoria = selectCategoria ? selectCategoria.value : "todas";

    const filtradas = RECETAS.filter((receta) => {
      const coincideCategoria = categoria === "todas" || receta.categoria === categoria;
      const coincideTexto =
        !texto ||
        receta.titulo.toLowerCase().includes(texto) ||
        receta.resumen.toLowerCase().includes(texto) ||
        receta.ingredientes.some((ing) => ing.nombre.toLowerCase().includes(texto));

      return coincideCategoria && coincideTexto;
    });

    if (filtradas.length === 0) {
      contenedor.innerHTML = "<p>No se encontraron recetas con ese filtro.</p>";
      return;
    }

    contenedor.innerHTML = filtradas.map(crearTarjetaHTML).join("");
  }

  if (formulario) {
    formulario.addEventListener("submit", (evento) => {
      evento.preventDefault();
      actualizarResultados();
    });
  }

  if (inputTexto) {
    inputTexto.addEventListener("input", actualizarResultados);
  }

  if (selectCategoria) {
    selectCategoria.addEventListener("change", actualizarResultados);
  }

  actualizarResultados();
}

document.addEventListener("DOMContentLoaded", () => {
  iniciarPortada();
  iniciarDetalle();
  iniciarBusqueda();
});