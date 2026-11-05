/* Wake Up · PURAMENTE — los 50 audios para despertar la mente.
   Diez por módulo, uno por cada neurona del cerebro. Esta es la lista única:
   la leen el cerebro (puramente-neural-brain-preview.html) y Oazis.

   Para publicar un audio: pon su página en public/lecciones/ y añade a su línea
   `url` (relativa a public/) y `min` (duración en minutos). Sin `url` el audio
   aparece como «Próximamente» y su neurona no se puede abrir.

   `id` es la clave de progreso: al terminar, la página del audio guarda
   localStorage['<id>'] = 'completed' y la neurona se enciende. No cambies un id
   ya publicado. `free` marca los audios abiertos sin Oazis Plus.

   Publicados: CALMA 1 · Llegar y CALMA 2 · Volver. Los títulos de CALMA 3–5 y
   FOCO 1 son títulos de trabajo heredados del curso anterior; los demás audios
   aún no tienen título. */
(() => {
  const MODULES = [['CALMA', 'calma'], ['FOCO', 'foco'], ['IDEAS', 'ideas'], ['INTUICIÓN', 'intuicion'], ['ACCIÓN', 'accion']];
  const KNOWN = {
    CALMA: [
      { id: 'calma.n01.llegar', title: 'Llegar', url: 'lecciones/llegar.html', min: 2, free: true,
        desc: 'Aterriza en 90 segundos. Llegas con la cabeza llena, te quedas con una luz y sales con tu primera neurona encendida.',
        desc_en: 'Land in 90 seconds. You arrive with a full head, stay with one light and leave with your first neuron lit.' },
      { id: 'calma.n02.volver', title: 'Volver', url: 'lecciones/volver.html', min: 3,
        desc: 'El gimnasio de la atención. Te vas a ir y vas a volver: cada regreso enciende un camino en tu cerebro.',
        desc_en: 'The attention gym. You will drift and you will come back: every return lights up a path in your brain.' },
      { id: 'calma.n03.espacio', title: 'Hacer espacio' },
      { id: 'calma.n04.voz', title: 'Darme voz' },
      { id: 'calma.n05.resonancia', title: 'Encontrar mi resonancia' },
    ],
    FOCO: [
      { id: 'puramente-foco-01', title: 'Recupera tu atención' },
    ],
  };
  window.PURAMENTE_AUDIOS = MODULES.flatMap(([module, slug]) =>
    Array.from({ length: 10 }, (_, i) => ({
      module, n: i + 1, id: `${slug}.n${String(i + 1).padStart(2, '0')}`, title: '',
      ...((KNOWN[module] || [])[i] || {}),
    })));
})();
