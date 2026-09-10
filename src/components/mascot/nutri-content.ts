import type { SchoolTool } from './NutriSVG';

export const NUTRI_TIPS: Record<string, string[]> = {
  dashboard: [
    '¡Bienvenido, Profe! Desde aquí controlas todo tu universo educativo.',
    'Crea tu primer juego y tus estudiantes podrán unirse con un código.',
    'Las métricas te muestran qué conceptos necesitan más práctica.',
    '¿Sabías que puedes tener varios salones activos al mismo tiempo?',
    'Personaliza tus juegos por materia, grado y objetivo de aprendizaje.',
  ],
  juegos: [
    'Cada juego puede tener múltiples rondas de preguntas.',
    'Usa imágenes y fórmulas en tus preguntas para hacerlas más dinámicas.',
    'Puedes duplicar un juego existente para modificarlo fácilmente.',
    'Los juegos guardados en borrador no son visibles para los estudiantes aún.',
  ],
  salones: [
    'Un salón activo genera un código único para que tus estudiantes entren.',
    'Puedes pausar o reiniciar una sesión desde aquí en tiempo real.',
    'El historial del salón guarda el rendimiento de cada sesión.',
  ],
  metricas: [
    'Las métricas se actualizan en tiempo real durante el juego.',
    'Puedes exportar los resultados de cualquier sesión.',
    'La gráfica de progreso muestra la evolución por estudiante.',
  ],
  'crear-juego': [
    '¡Tip! Usa preguntas de opción múltiple para juegos más rápidos.',
    'Añade un temporizador para aumentar la emoción del juego.',
    'Las preguntas se pueden reordenar con arrastrar y soltar.',
    'Puedes previsualizar el juego antes de publicarlo.',
  ],
};

export interface CuriousFact {
  text: string;
  subject: 'biología' | 'matemáticas' | 'historia' | 'física' | 'arte' | 'geografía';
}

export const NUTRI_FACTS: CuriousFact[] = [
  { subject: 'biología',    text: '¡Las nutrias se toman de las patas mientras duermen para no separarse! Se llama "balsa de nutrias". 🦦' },
  { subject: 'matemáticas', text: 'El número Pi (π) tiene más de 100 billones de decimales calculados. ¡Y sigue sin repetirse!' },
  { subject: 'biología',    text: 'Los pulpos tienen tres corazones y sangre azul gracias a la hemocianina.' },
  { subject: 'historia',    text: 'La Gran Muralla China no es visible desde el espacio a simple vista. ¡Eso es un mito!' },
  { subject: 'física',      text: 'Un rayo alcanza temperaturas de hasta 30 000 K — cinco veces más caliente que la superficie del Sol.' },
  { subject: 'geografía',   text: 'Colombia tiene la mayor biodiversidad de aves del mundo: más de 1 900 especies.' },
  { subject: 'biología',    text: 'El cerebro humano genera suficiente electricidad para encender una bombilla de baja potencia.' },
  { subject: 'matemáticas', text: 'La secuencia de Fibonacci aparece en los pétalos de las flores, las conchas y las galaxias.' },
  { subject: 'historia',    text: 'Los mayas desarrollaron el concepto del cero de forma independiente hace más de 1 500 años.' },
  { subject: 'arte',        text: 'Wassily Kandinsky era sinestésico: "escuchaba" los colores al pintar.' },
  { subject: 'física',      text: 'La luz tarda 8 minutos y 20 segundos en viajar del Sol a la Tierra.' },
  { subject: 'matemáticas', text: 'Existe un número llamado "googol": es 1 seguido de 100 ceros. ¡Ni el universo tiene tantos átomos!' },
  { subject: 'geografía',   text: 'El río Amazonas descarga tanta agua que desaliniza el océano Atlántico durante kilómetros.' },
  { subject: 'historia',    text: 'La primera biblioteca pública de América Latina se fundó en Colombia, en 1777.' },
  { subject: 'biología',    text: 'Las abejas reconocen los rostros humanos con la misma técnica que usamos nosotros.' },
  { subject: 'física',      text: 'Un astronauta en el espacio no puede eructar porque la gravedad no separa los gases de los líquidos en el estómago.' },
  { subject: 'arte',        text: 'Leonardo da Vinci podía escribir con una mano y dibujar con la otra al mismo tiempo.' },
  { subject: 'geografía',   text: 'El desierto de Atacama en Chile es el lugar más seco de la Tierra; en algunas zonas nunca se ha registrado lluvia.' },
  { subject: 'matemáticas', text: 'El símbolo del infinito (∞) se llama lemniscata y fue introducido por el matemático John Wallis en 1655.' },
  { subject: 'biología',    text: 'Los delfines duermen con un solo hemisferio cerebral a la vez para poder salir a respirar.' },
  { subject: 'historia',    text: 'La biblioteca de Alejandría fue una de las más grandes del mundo antiguo, con más de 40 000 rollos de papiro.' },
  { subject: 'física',      text: 'El 99% de la masa del sistema solar está concentrada en el Sol.' },
  { subject: 'arte',        text: 'La Mona Lisa no tiene cejas ni pestañas porque era una moda del Renacimiento depilarlas.' },
  { subject: 'geografía',   text: 'Canadá tiene más lagos que todos los demás países del mundo juntos: cerca de 3 millones.' },
  { subject: 'matemáticas', text: 'Un número perfecto es igual a la suma de sus divisores propios. El más pequeño es el 6 (1+2+3=6).' },
  { subject: 'biología',    text: 'Las estrellas de mar pueden regenerar un brazo perdido y en algunas especies, ¡un brazo puede regenerar un cuerpo entero!' },
  { subject: 'historia',    text: 'El Imperio Romano no cayó en un día; su declive tomó más de 300 años.' },
  { subject: 'física',      text: 'Si el núcleo de un átomo fuera del tamaño de una canica, el átomo completo sería del tamaño de un estadio de fútbol.' },
  { subject: 'arte',        text: 'El pintor Vincent van Gogh solo vendió un cuadro en vida, a pesar de haber creado más de 2 000 obras.' },
  { subject: 'geografía',   text: 'El Monte Everest crece aproximadamente 4 milímetros cada año por el movimiento de las placas tectónicas.' },
  { subject: 'matemáticas', text: 'Los números primos son infinitos. Euclides lo demostró hace más de 2 300 años y sigue siendo válido.' },
];

// Útiles escolares que Andrés puede sacar del bolsillo
export const SCHOOL_TOOLS: SchoolTool[] = [
  'ruler',
  'pencil',
  'compass',
  'eraser',
  'calculator',
  'book',
  'flask',
];

export const SCHOOL_TOOLS_LABELS: Record<SchoolTool, string> = {
  ruler:      '📏 ¡Siempre mide dos veces!',
  pencil:     '✏️ ¡A escribir con claridad!',
  compass:    '📐 ¡Círculos perfectos!',
  eraser:     '🧹 ¡Los errores se corrigen!',
  calculator: '🧮 ¡Matemáticas al rescate!',
  book:       '📖 ¡La lectura es poder!',
  flask:      '🧪 ¡A experimentar, Profe!',
};
