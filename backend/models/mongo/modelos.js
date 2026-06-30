const mongoose = require('mongoose');
const { Schema } = mongoose;

// =============================================
// Esquema: Producto (catálogo ampliado en MongoDB)
// =============================================
const productoSchema = new Schema({
  productoId:    { type: Number, index: true },
  nombre:        { type: String, required: true },
  marca:         { type: String, required: true },
  categoria:     { type: String, required: true, index: true },
  precio:        { type: Number, required: true, min: 0 },
  stock:         { type: String, enum: ['disponible', 'agotado', 'pedido'], default: 'disponible' },
  descripcion:   { type: String, default: '' },
  emoji:         { type: String, default: '🎵' },
  especificaciones: { type: Map, of: String, default: {} },
  imagenes:      [{ type: String }],
  tags:          [{ type: String }],
  puntuacion:    { type: Number, default: 0, min: 0, max: 5 },
  total_resenas: { type: Number, default: 0 },
  destacado:     { type: Boolean, default: false },
  creado_en:     { type: Date, default: Date.now },
  actualizado_en: { type: Date, default: Date.now }
});

productoSchema.index({ nombre: 'text', marca: 'text', descripcion: 'text' });
productoSchema.index({ categoria: 1, precio: 1 });

// =============================================
// Esquema: Blog
// =============================================
const blogSchema = new Schema({
  titulo:    { type: String, required: true },
  slug:      { type: String, unique: true },
  resumen:   { type: String, required: true },
  contenido: { type: String, required: true },
  emoji:     { type: String, default: '📝' },
  autor:     { type: String, default: 'RiveraSound' },
  tags:      [{ type: String }],
  imagen:    { type: String },
  lecturas:  { type: Number, default: 0 },
  fecha:     { type: Date, default: Date.now },
  publicado: { type: Boolean, default: true }
});

blogSchema.index({ slug: 1 });
blogSchema.index({ fecha: -1 });
blogSchema.index({ tags: 1 });

blogSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.titulo
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 80);
  }
  next();
});

// =============================================
// Esquema: Reseña (reviews de productos)
// =============================================
const resenaSchema = new Schema({
  producto_id:     { type: String, required: true, index: true },
  producto_nombre: { type: String, default: '' },
  usuario_id:      { type: String, required: true },
  usuario_nombre:  { type: String, default: 'Anónimo' },
  puntuacion:      { type: Number, required: true, min: 1, max: 5 },
  comentario:      { type: String, default: '' },
  respondido:      { type: Boolean, default: false },
  respuesta:       { type: String, default: '' },
  creado_en:       { type: Date, default: Date.now }
});

resenaSchema.index({ producto_id: 1, creado_en: -1 });
resenaSchema.index({ usuario_id: 1 });

// =============================================
// Registrar modelos
// =============================================
mongoose.model('Producto', productoSchema);
mongoose.model('Blog', blogSchema);
mongoose.model('Resena', resenaSchema);

module.exports = {
  Producto: mongoose.model('Producto'),
  Blog: mongoose.model('Blog'),
  Resena: mongoose.model('Resena')
};
