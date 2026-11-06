/* ============================================================
   WAKE UP — CONTENIDO EDITABLE DE LOS MÓDULOS
   ------------------------------------------------------------
   Igual que projects.js: este es el archivo que tocas para poner el
   contenido real de cada clase. Guarda, haz push a main y el programa
   (wakeup-program.html) y la página de venta (wakeup.html) se
   actualizan solos.

   Campos de cada módulo:
   - num:         número del módulo (1 a 10, define el orden y el
                  bloqueo — no se puede entrar al 4 sin completar el 3)
   - title:       nombre del módulo (sale en MAYÚSCULAS)
   - kicker:      la categoría corta que sale arriba del título
   - lesson:      el contenido de la clase. La primera frase sale también
                  como adelanto en la página de venta.
   - task:        la tarea que debe hacer la persona
   - deliverable: qué tiene que entregar/mostrar para marcarlo listo
   - media:       (opcional) link al video o audio de la clase. Acepta
                  YouTube, Vimeo, un .mp3/.m4a (audio) o un .mp4 (video).
                  Si lo dejas en "" no aparece nada.

   Para que la clase se lea como clase y no como un solo bloque: separa
   párrafos con \n\n y haz listas poniendo "- " al inicio de cada línea.
   ------------------------------------------------------------ */

/* A dónde mandamos a la persona cuando termina los 10 módulos.
   Cambia la url por el link de invitación del Discord cuando lo tengas. */
const WAKEUP_COMMUNITY = {
  label: "Únete a la comunidad CREATV MYNDZ →",
  url: "https://instagram.com/creatvmyndz"
};

const MODULES = [
  {
    num: 1,
    title: "DESPIERTA TU MIRADA",
    kicker: "Fundamentos",
    lesson: "La creatividad no es un talento de unos pocos: es un músculo que se durmió.\n\nTu cerebro filtra casi todo lo que ves para no saturarte. Por eso dejaste de \"ver\" tu calle, tu rutina, tu ciudad. No es que no haya nada interesante: es que el piloto automático te lo esconde.\n\nDespertar la mirada no es tener una idea genial hoy. Es volver a mirar. Tres cosas que vas a notar cuando lo hagas:\n- Texturas, sombras y colores que llevaban años frente a ti.\n- Cómo la gente usa las cosas de formas para las que no fueron hechas.\n- Que las ideas no llegan de la nada: llegan de lo que miras.",
    task: "Durante un día completo, cada vez que agarres el celular, antes de desbloquearlo, mira 5 segundos algo que tengas cerca — una textura, una sombra, un objeto — como si lo vieras por primera vez. Anota 5 cosas que \"viste\" hoy y que normalmente ignoras.",
    deliverable: "Tu lista de 5 cosas. No tiene que ser bonita ni profunda — solo real.",
    media: ""   // p. ej. "https://youtu.be/XXXXXXXXXXX" o "assets/audio/modulo-01.mp3"
  },
  {
    num: 2,
    title: "ROMPE EL BLOQUEO",
    kicker: "Desbloqueo creativo",
    lesson: "El bloqueo creativo casi nunca es falta de ideas: es miedo a que la idea sea mala.\n\nTu cerebro te protege del ridículo cerrando la puerta antes de que algo \"malo\" pueda salir. El problema es que por esa misma puerta salen las buenas. Cerrada, no sale nada.\n\nLa única forma de romper eso es sacar tantas ideas malas que dejen de darte miedo. Cantidad primero, calidad después. Las ideas número 15, 18 y 20 casi siempre son mejores que la 1 — porque para llegar a ellas ya soltaste el juicio.",
    task: "Ponte un timer de 10 minutos y escribe 20 ideas para resolver un problema simple de tu día a día (cómo no perder las llaves, cómo desayunar mejor, lo que sea). No te detengas a evaluar ninguna mientras escribes. Si te trabas, escribe una ridícula a propósito y sigue.",
    deliverable: "Tu lista de 20 ideas, completa — buenas, malas y ridículas. Marca con una estrella las 3 que te sorprendieron.",
    media: ""
  },
  {
    num: 3,
    title: "OBSERVA COMO CREATIVO",
    kicker: "Inspiración",
    lesson: "Inspirarse no es esperar un rayo: es exponerte a más ideas de las que tu cerebro puede combinar por accidente.\n\nLos creativos no tienen más ideas que tú. Tienen más materia prima cruzándose en la cabeza. Un color de un empaque, una frase de una canción, la forma de un edificio — todo eso se mezcla solo cuando lo tienes a mano.\n\nObservar como creativo es coleccionar piezas sueltas a propósito, sin saber todavía para qué las vas a usar. Ese \"todavía\" es la clave: si lo filtras por utilidad, te quedas sin material.",
    task: "Arma una carpeta (en el celular o donde sea) llamada \"Inspiración\". Durante 3 días, cada vez que algo te llame la atención — un color, una frase, un diseño, un empaque, un meme — captúralo ahí, sin filtrar si \"sirve\" o no.",
    deliverable: "Tu carpeta con mínimo 15 capturas, y una frase: ¿qué se repite en lo que te llamó la atención?",
    media: ""
  },
  {
    num: 4,
    title: "LA IDEA NO BASTA",
    kicker: "Ideación",
    lesson: "Tener una idea se siente como el logro. No lo es.\n\nLa idea es el punto de partida más barato que existe: todo el mundo tiene ideas. Lo que la vuelve valiosa es lo que decides hacer con ella, y para eso primero hay que elegir una.\n\nDe todas las que ya generaste, ¿cuál te da miedo bueno? Ese cosquilleo — \"¿y si de verdad lo hago?\" — es la señal. La comodidad nunca lo es. Elegir es soltar las otras, y eso también da miedo: por eso la mayoría se queda con la lista y nunca con la idea.",
    task: "Vuelve a tu lista del Módulo 2 (o genera 10 ideas nuevas). Elige UNA. Escribe en 3 frases: qué es, para quién es, y por qué tú eres la persona indicada para hacerla.",
    deliverable: "Tus 3 frases sobre la idea que elegiste.",
    media: ""
  },
  {
    num: 5,
    title: "PROTOTIPA RÁPIDO",
    kicker: "Materialización",
    lesson: "Una idea que vive solo en tu cabeza no existe para nadie más.\n\nPrototipar no es \"hacerlo bien\": es hacerlo visible, aunque sea feo, aunque sea con lo que tengas a mano. Un dibujo en una servilleta ya es un prototipo. Una nota de voz explicándola también.\n\nEl primer prototipo siempre da vergüenza. Esa vergüenza es la prueba de que ya lo sacaste de tu cabeza — y ahí es donde empieza a ser real. Reglas para hoy:\n- Menos de 2 horas.\n- Con lo que tengas: papel, cartón, el celular.\n- Que se pueda ver, tocar o escuchar.",
    task: "Convierte la idea del Módulo 4 en algo que se pueda tocar, ver o probar en menos de 2 horas — un dibujo, una maqueta con cartón, un mockup, una grabación de voz explicándola. No busques que quede perfecto.",
    deliverable: "Una foto o archivo de tu prototipo.",
    media: ""
  },
  {
    num: 6,
    title: "CUENTA LA HISTORIA",
    kicker: "Storytelling",
    lesson: "Nadie se conecta con un producto: se conecta con la historia detrás.\n\nLa gente no recuerda características. Recuerda cómo algo la hizo sentir. Contar tu historia no es inventar un cuento: es encontrar el \"por qué\" real detrás de lo que hiciste y decirlo simple.\n\nUna historia que funciona tiene cuatro piezas, y todas son tuyas:\n- El problema que viste.\n- Por qué te importó a ti.\n- Qué hiciste con eso.\n- Qué esperas que sienta quien lo reciba.",
    task: "Escribe la historia de tu idea en 4 frases, una por pieza: el problema que viste, por qué te importó, qué hiciste, y qué esperas que sienta quien la reciba. Léela en voz alta: si suena a comercial, vuelve a escribirla como se la contarías a un amigo.",
    deliverable: "Tus 4 frases.",
    media: ""
  },
  {
    num: 7,
    title: "CRITICA Y MEJORA",
    kicker: "Feedback",
    lesson: "El feedback no es un ataque a lo que hiciste: es información gratis sobre cómo se ve desde afuera.\n\nLos creativos que más rápido mejoran son los que piden feedback antes de sentirse \"listos\", no después. Esperar a estar listo es esperar para siempre.\n\nRecibirlo bien es una habilidad, y se entrena igual que crear. Dos reglas:\n- No lo defiendas. Si tienes que explicarlo, esa explicación es el feedback.\n- Anota lo que dijeron tal cual. Tu memoria lo va a suavizar.",
    task: "Muéstrale tu prototipo (Módulo 5) a alguien fuera de tu cabeza — un amigo, familia, quien sea. Pídele que te diga qué no entendió y qué cambiaría. No lo defiendas, solo anótalo.",
    deliverable: "3 comentarios reales que recibiste, escritos tal cual te los dijeron, y 1 cosa que vas a cambiar por eso.",
    media: ""
  },
  {
    num: 8,
    title: "ENCUENTRA TU ESTILO",
    kicker: "Identidad",
    lesson: "Tu estilo no se inventa: se descubre revisando qué se repite en lo que ya hiciste, incluso sin querer.\n\nNo es una decisión de un día. Es un patrón que emerge con el tiempo, y solo se ve mirando hacia atrás. Por eso este módulo llega ahora y no al principio: ya tienes material tuyo para mirar.\n\nDejar de copiar referencias y empezar a mezclar las tuyas propias es donde aparece. No busques ser \"original\": busca ser reconocible.",
    task: "Mira todo lo que has hecho en este programa hasta ahora (tus notas, tu carpeta de inspiración, tu prototipo, tu historia). Escribe 3 palabras que describan cómo haces las cosas cuando nadie te está corrigiendo.",
    deliverable: "Tus 3 palabras, más una frase explicando por qué las elegiste.",
    media: ""
  },
  {
    num: 9,
    title: "COMPARTE TU TRABAJO",
    kicker: "Visibilidad",
    lesson: "Lo que no se comparte no existe para nadie más que para ti.\n\nCompartir da miedo porque expone el trabajo a juicio. Pero también es la única forma de que alguien se conecte con lo que hiciste, te dé una oportunidad o te ayude a mejorar.\n\nPublicar imperfecto le gana a guardar perfecto. Siempre. Lo perfecto que nunca sale no le sirve a nadie — ni a ti.",
    task: "Comparte tu prototipo o tu historia (Módulos 5 y 6) en un lugar donde alguien más lo vea — redes, un grupo, la comunidad CREATV MYNDZ. No pidas permiso, solo publícalo.",
    deliverable: "El link o una captura de dónde lo compartiste.",
    media: ""
  },
  {
    num: 10,
    title: "NUNCA PARES DE CREAR",
    kicker: "Hábito",
    lesson: "La creatividad no se mantiene despierta sola: se apaga si dejas de usarla, igual que un músculo.\n\nTodo lo que hiciste en este programa no fue para \"terminar\" un curso. Fue para probar que el hábito se puede construir con constancia, no esperando la inspiración. Ya lo probaste: 9 módulos, con tus propias manos.\n\nLo que sigue es más simple y más difícil a la vez: repetirlo. Chico, pero cada semana. Un compromiso que puedas cumplir en tu peor semana vale más que uno ambicioso que abandonas en la segunda.",
    task: "Define un compromiso simple y sostenible: una acción creativa que vas a repetir cada semana, aunque sea tan chica como anotar una idea nueva. Escríbelo como una promesa a ti mismo, con día y hora.",
    deliverable: "Tu compromiso semanal, por escrito.",
    media: ""
  }
];
