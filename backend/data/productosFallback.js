/* ============================================ data/productosFallback.js - Datos mock de productos ============================================ */
/* Array estático usado como fallback cuando PostgreSQL no está disponible.
   Incluye 11 productos representativos de distintas categorías con IDs slug. */

const productos = [
  { id: 'sax-alto-yamaha', nombre: 'Saxofón Alto', marca: 'Yamaha YAS-280', categoria: 'viento', precio: 2850, stock: 'disponible', emoji: '🎷', descripcion: 'Ideal para principiantes. Sonido brillante.' },
  { id: 'sax-tenor-jupiter', nombre: 'Saxofón Tenor', marca: 'Jupiter JTS-700', categoria: 'viento', precio: 3400, stock: 'disponible', emoji: '🎷', descripcion: 'Potente sonido para intermedios.' },
  { id: 'trompeta-bach', nombre: 'Trompeta', marca: 'Bach TR300H2', categoria: 'viento', precio: 1750, stock: 'disponible', emoji: '🎺', descripcion: 'Sonido clásico.' },
  { id: 'clarinete-buffet', nombre: 'Clarinete', marca: 'Buffet Crampon B12', categoria: 'viento', precio: 1200, stock: 'agotado', emoji: '🪗', descripcion: 'Alta calidad.' },
  { id: 'flauta-yamaha', nombre: 'Flauta Traversa', marca: 'Yamaha YFL-222', categoria: 'viento', precio: 980, stock: 'disponible', emoji: '🎶', descripcion: 'Mecánica confiable.' },
  { id: 'guitarra-clasica-fender', nombre: 'Guitarra Clásica', marca: 'Fender CN-60S', categoria: 'cuerda', precio: 980, stock: 'disponible', emoji: '🎸', descripcion: 'Tapa de abeto.' },
  { id: 'guitarra-electrica-squier', nombre: 'Guitarra Eléctrica', marca: 'Squier Stratocaster', categoria: 'cuerda', precio: 1350, stock: 'disponible', emoji: '🎸', descripcion: 'Sonido Stratocaster.' },
  { id: 'bateria-pearl', nombre: 'Batería Completa', marca: 'Pearl Roadshow RS525', categoria: 'percusion', precio: 3200, stock: 'disponible', emoji: '🥁', descripcion: 'Set 5 piezas.' },
  { id: 'cajon-meinl', nombre: 'Cajón Peruano', marca: 'Meinl JC50B', categoria: 'percusion', precio: 480, stock: 'disponible', emoji: '🪘', descripcion: 'Cajón clásico.' },
  { id: 'piano-roland', nombre: 'Piano Digital', marca: 'Roland FP-30X', categoria: 'teclado', precio: 4100, stock: 'disponible', emoji: '🎹', descripcion: '88 teclas.' }
];

module.exports = productos;
