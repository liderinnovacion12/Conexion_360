// ============================================================
// Biblioteca de plantillas de contrato (norma colombiana).
// El cuerpo es HTML editable con placeholders {{tal}} que la
// emisión reemplaza por los datos reales de la persona.
// Estas plantillas son un punto de partida editable, no asesoría legal.
// ============================================================

const COMMON_PLACEHOLDERS = [
  { key: 'nombre', label: 'Nombre completo' },
  { key: 'documento', label: 'N.° de documento' },
  { key: 'cargo', label: 'Cargo / objeto' },
  { key: 'ciudad', label: 'Ciudad' },
  { key: 'fecha', label: 'Fecha' },
]

export const LEGAL_TEMPLATES = [
  {
    id: 'tpl-fijo',
    key: 'laboral_fijo',
    category: 'Laboral Término Fijo',
    name: 'Contrato Laboral a Término Fijo',
    placeholders: [...COMMON_PLACEHOLDERS, { key: 'salario', label: 'Salario mensual' }, { key: 'duracion', label: 'Duración del contrato' }],
    body:
      '<p>Entre los suscritos, <b>CONEXIÓN 360 · TODO ÁGIL CTA</b>, identificada con NIT 900.000.000-0, en adelante “EL EMPLEADOR”, ' +
      'y <b>{{nombre}}</b>, identificado(a) con documento No. <b>{{documento}}</b>, en adelante “EL TRABAJADOR”, se celebra el presente ' +
      '<b>CONTRATO DE TRABAJO A TÉRMINO FIJO</b>, regido por el Código Sustantivo del Trabajo, en especial los artículos 46 y siguientes, ' +
      'bajo las cláusulas que se enuncian a continuación:</p>' +
      '<h2>PRIMERA. Objeto</h2><p>EL TRABAJADOR se obliga a prestar sus servicios personales como <b>{{cargo}}</b>.</p>' +
      '<h2>SEGUNDA. Duración</h2><p>El presente contrato tendrá una duración de <b>{{duracion}}</b>, prorrogable en los términos de ley.</p>' +
      '<h2>TERCERA. Salario</h2><p>EL EMPLEADOR pagará a EL TRABAJADOR un salario mensual de <b>{{salario}}</b>.</p>' +
      '<h2>CUARTA. Lugar y fecha</h2><p>Se firma en {{ciudad}}, a los {{fecha}}.</p>',
  },
  {
    id: 'tpl-indefinido',
    key: 'laboral_indefinido',
    category: 'Laboral Término Indefinido',
    name: 'Contrato Laboral a Término Indefinido',
    placeholders: [...COMMON_PLACEHOLDERS, { key: 'salario', label: 'Salario mensual' }],
    body:
      '<p>Entre los suscritos, <b>CONEXIÓN 360 · TODO ÁGIL CTA</b>, identificada con NIT 900.000.000-0, en adelante “EL EMPLEADOR”, ' +
      'y <b>{{nombre}}</b>, identificado(a) con documento No. <b>{{documento}}</b>, en adelante “EL TRABAJADOR”, se celebra el presente ' +
      '<b>CONTRATO DE TRABAJO A TÉRMINO INDEFINIDO</b>, conforme al artículo 47 del Código Sustantivo del Trabajo.</p>' +
      '<h2>PRIMERA. Objeto</h2><p>EL TRABAJADOR se obliga a prestar sus servicios personales como <b>{{cargo}}</b>.</p>' +
      '<h2>SEGUNDA. Vigencia</h2><p>El contrato rige por tiempo indefinido a partir de la fecha de firma.</p>' +
      '<h2>TERCERA. Salario</h2><p>EL EMPLEADOR pagará a EL TRABAJADOR un salario mensual de <b>{{salario}}</b>.</p>' +
      '<h2>CUARTA. Lugar y fecha</h2><p>Se firma en {{ciudad}}, a los {{fecha}}.</p>',
  },
  {
    id: 'tpl-prestacion',
    key: 'prestacion_servicios',
    category: 'Prestación de Servicios',
    name: 'Contrato de Prestación de Servicios',
    placeholders: [...COMMON_PLACEHOLDERS, { key: 'honorarios', label: 'Valor de honorarios' }, { key: 'duracion', label: 'Plazo de ejecución' }],
    body:
      '<p>Entre <b>CONEXIÓN 360 · TODO ÁGIL CTA</b>, NIT 900.000.000-0, en adelante “EL CONTRATANTE”, y <b>{{nombre}}</b>, identificado(a) ' +
      'con documento No. <b>{{documento}}</b>, en adelante “EL CONTRATISTA”, se celebra el presente <b>CONTRATO DE PRESTACIÓN DE SERVICIOS</b>, ' +
      'de naturaleza civil e independiente, sin subordinación laboral, conforme al artículo 1495 del Código Civil.</p>' +
      '<h2>PRIMERA. Objeto</h2><p>EL CONTRATISTA prestará sus servicios profesionales como <b>{{cargo}}</b>, de manera autónoma e independiente.</p>' +
      '<h2>SEGUNDA. Plazo</h2><p>El plazo de ejecución será de <b>{{duracion}}</b>.</p>' +
      '<h2>TERCERA. Honorarios</h2><p>EL CONTRATANTE pagará honorarios por valor de <b>{{honorarios}}</b>.</p>' +
      '<h2>CUARTA. Independencia</h2><p>EL CONTRATISTA no tendrá vínculo laboral con EL CONTRATANTE, conservando plena autonomía técnica y administrativa.</p>' +
      '<h2>QUINTA. Lugar y fecha</h2><p>Se firma en {{ciudad}}, a los {{fecha}}.</p>',
  },
  {
    id: 'tpl-otrosi',
    key: 'otrosi',
    category: 'OTROSÍ',
    name: 'OTROSÍ Modificatorio',
    placeholders: [...COMMON_PLACEHOLDERS, { key: 'contrato_original', label: 'Contrato que se modifica' }, { key: 'clausula_modificada', label: 'Cláusula modificada' }],
    body:
      '<p>Entre <b>CONEXIÓN 360 · TODO ÁGIL CTA</b> y <b>{{nombre}}</b>, identificado(a) con documento No. <b>{{documento}}</b>, ' +
      'se suscribe el presente <b>OTROSÍ</b> al contrato <b>{{contrato_original}}</b>.</p>' +
      '<h2>PRIMERA. Modificación</h2><p>Se modifica la siguiente cláusula: <b>{{clausula_modificada}}</b>.</p>' +
      '<h2>SEGUNDA. Vigencia</h2><p>Las demás condiciones del contrato original permanecen sin modificación.</p>' +
      '<h2>TERCERA. Lugar y fecha</h2><p>Se firma en {{ciudad}}, a los {{fecha}}.</p>',
  },
  {
    id: 'tpl-aprendizaje',
    key: 'aprendizaje',
    category: 'Contrato de Aprendizaje',
    name: 'Contrato de Aprendizaje',
    placeholders: [...COMMON_PLACEHOLDERS, { key: 'apoyo_sostenimiento', label: 'Apoyo de sostenimiento mensual' }, { key: 'duracion', label: 'Duración de la etapa práctica' }],
    body:
      '<p>Entre <b>CONEXIÓN 360 · TODO ÁGIL CTA</b>, en calidad de patrocinador, y <b>{{nombre}}</b>, identificado(a) con documento No. ' +
      '<b>{{documento}}</b>, en calidad de aprendiz, se celebra el presente <b>CONTRATO DE APRENDIZAJE</b>, conforme a la Ley 789 de 2002.</p>' +
      '<h2>PRIMERA. Objeto</h2><p>El aprendiz realizará su etapa práctica como <b>{{cargo}}</b>.</p>' +
      '<h2>SEGUNDA. Duración</h2><p>La etapa práctica tendrá una duración de <b>{{duracion}}</b>.</p>' +
      '<h2>TERCERA. Apoyo de sostenimiento</h2><p>El patrocinador reconocerá un apoyo de sostenimiento mensual de <b>{{apoyo_sostenimiento}}</b>, ' +
      'con afiliación a riesgos laborales según la ley.</p>' +
      '<h2>CUARTA. Lugar y fecha</h2><p>Se firma en {{ciudad}}, a los {{fecha}}.</p>',
  },
]
