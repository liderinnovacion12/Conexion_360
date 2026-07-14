import { jsPDF } from 'jspdf'
import { formatCOP, formatDate } from './format.js'

// Paleta para los PDF (jsPDF usa RGB).
const NAVY = [10, 14, 26]
const TEAL = [0, 131, 143]
const VIOLET = [123, 47, 190]
const GRAY = [110, 119, 147]

function header(doc, subtitle) {
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, 210, 32, 'F')
  // Marca
  doc.setFillColor(...TEAL)
  doc.roundedRect(16, 9, 14, 14, 3, 3, 'F')
  doc.setFillColor(...VIOLET)
  doc.roundedRect(24, 13, 8, 10, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.text('CONEXIÓN 360', 36, 16)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(180, 190, 215)
  doc.text('TODO ÁGIL CTA', 36, 21)
  doc.setFontSize(9)
  doc.text(subtitle, 194, 18, { align: 'right' })
}

function footer(doc) {
  doc.setDrawColor(220, 224, 235)
  doc.line(16, 270, 194, 270)
  doc.setFontSize(7.5)
  doc.setTextColor(...GRAY)
  doc.text('Documento generado por la plataforma Conexión 360 · Todo Ágil CTA', 16, 276)
  doc.text(`Emitido: ${formatDate(new Date())}`, 194, 276, { align: 'right' })
  doc.text('Este documento es una muestra del prototipo y no tiene validez legal.', 105, 282, { align: 'center' })
}

// Certificado laboral con campos auto-completados desde el registro del empleado.
export function generateLaborCertificate(emp) {
  const doc = new jsPDF()
  header(doc, 'Certificado laboral')

  doc.setTextColor(...NAVY)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('CERTIFICADO LABORAL', 105, 50, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(40, 46, 66)

  const today = formatDate(new Date())
  const body = [
    'La empresa CONEXIÓN 360 · TODO ÁGIL CTA, identificada con NIT 900.000.000-0,',
    '',
    `CERTIFICA QUE:`,
    '',
    `El(la) señor(a) ${emp.name}, identificado(a) con documento No. ${emp.doc}, se`,
    `encuentra vinculado(a) a nuestra organización desempeñando el cargo de`,
    `"${emp.position}" en el área de ${emp.area}, mediante contrato a término`,
    `${emp.contract.toLowerCase()}, desde el ${formatDate(emp.start)}${emp.end ? ` hasta el ${formatDate(emp.end)}` : ' y se encuentra vigente a la fecha'}.`,
    '',
    `Su asignación salarial mensual es de ${formatCOP(emp.salary)} (${emp.contract === 'Prestación de servicios' ? 'honorarios' : 'salario'}).`,
    `Estado actual de nómina: ${emp.state}.`,
    '',
    `La presente certificación se expide a solicitud del interesado, en la ciudad de`,
    `Bogotá D.C., a los ${today}.`,
  ]

  let y = 66
  body.forEach((line) => {
    if (line === 'CERTIFICA QUE:') {
      doc.setFont('helvetica', 'bold')
      doc.text(line, 105, y, { align: 'center' })
      doc.setFont('helvetica', 'normal')
    } else {
      doc.text(line, 20, y)
    }
    y += 7
  })

  // Firma
  y += 16
  doc.setDrawColor(...NAVY)
  doc.line(20, y, 90, y)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Departamento de Talento Humano', 20, y + 6)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GRAY)
  doc.text('Conexión 360 · Todo Ágil CTA', 20, y + 11)

  footer(doc)
  doc.save(`certificado_laboral_${emp.name.replace(/\s+/g, '_')}.pdf`)
}

// Factura electrónica (estilo ERP) con líneas de ítems, IVA y total.
export function generateInvoicePdf(invoice, client) {
  const doc = new jsPDF()
  header(doc, `Factura ${invoice.number}`)

  doc.setTextColor(...NAVY)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('FACTURA ELECTRÓNICA DE VENTA', 105, 46, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(40, 46, 66)
  doc.text(`N.°: ${invoice.number}`, 20, 58)
  doc.text(`Fecha de emisión: ${formatDate(invoice.issueDate)}`, 20, 64)
  doc.text(`Fecha de vencimiento: ${formatDate(invoice.dueDate)}`, 20, 70)
  doc.text(`Estado: ${invoice.status}`, 150, 58)

  doc.setFont('helvetica', 'bold')
  doc.text('Cliente', 20, 82)
  doc.setFont('helvetica', 'normal')
  doc.text(`${client?.name || '—'}`, 20, 88)
  doc.text(`NIT: ${client?.nit || '—'}`, 20, 94)
  doc.text(`${client?.address || ''}${client?.city ? `, ${client.city}` : ''}`, 20, 100)

  // Tabla de ítems
  let y = 114
  doc.setFillColor(...NAVY)
  doc.rect(16, y - 6, 178, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('Descripción', 20, y)
  doc.text('Cant.', 130, y, { align: 'right' })
  doc.text('Valor unit.', 160, y, { align: 'right' })
  doc.text('Total', 190, y, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(40, 46, 66)
  y += 10
  invoice.items.forEach((item) => {
    doc.text(item.description, 20, y, { maxWidth: 100 })
    doc.text(String(item.qty), 130, y, { align: 'right' })
    doc.text(formatCOP(item.unitPrice), 160, y, { align: 'right' })
    doc.text(formatCOP(item.qty * item.unitPrice), 190, y, { align: 'right' })
    y += 8
  })

  y += 4
  doc.setDrawColor(220, 224, 235)
  doc.line(120, y, 194, y)
  y += 7
  doc.text('Subtotal', 160, y, { align: 'right' })
  doc.text(formatCOP(invoice.subtotal), 190, y, { align: 'right' })
  y += 7
  doc.text('IVA (19%)', 160, y, { align: 'right' })
  doc.text(formatCOP(invoice.tax), 190, y, { align: 'right' })
  y += 8
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('Total', 160, y, { align: 'right' })
  doc.text(formatCOP(invoice.total), 190, y, { align: 'right' })

  footer(doc)
  doc.save(`${invoice.number}.pdf`)
}

// Certificado de finalización de curso.
export function generateCourseCertificate(name, course, score) {
  const doc = new jsPDF({ orientation: 'landscape' })
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, 297, 210, 'F')
  doc.setDrawColor(...TEAL)
  doc.setLineWidth(1.5)
  doc.rect(10, 10, 277, 190)

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('CONEXIÓN 360 · TODO ÁGIL CTA', 148.5, 35, { align: 'center' })

  doc.setFontSize(30)
  doc.text('CERTIFICADO DE FINALIZACIÓN', 148.5, 75, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(13)
  doc.setTextColor(180, 190, 215)
  doc.text('Se otorga el presente certificado a', 148.5, 95, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(26)
  doc.setTextColor(25, 227, 217)
  doc.text(name, 148.5, 115, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(13)
  doc.setTextColor(230, 235, 250)
  doc.text(`Por completar satisfactoriamente el curso "${course}"`, 148.5, 132, { align: 'center' })
  if (score != null) doc.text(`Calificación obtenida: ${score}/100`, 148.5, 143, { align: 'center' })

  doc.setFontSize(10)
  doc.setTextColor(150, 160, 185)
  doc.text(`Fecha de emisión: ${formatDate(new Date())}`, 148.5, 175, { align: 'center' })
  doc.save(`certificado_curso_${name.replace(/\s+/g, '_')}.pdf`)
}

// Rasteriza un nodo del DOM (la "hoja" del documento) y lo exporta como PDF A4.
// Usa html2canvas para preservar el formato exacto del editor + la firma.
export async function exportNodeToPdf(node, filename) {
  const { default: html2canvas } = await import('html2canvas')
  const canvas = await html2canvas(node, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
  })
  const img = canvas.toDataURL('image/jpeg', 0.95)
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageW = 210
  const pageH = 297
  const imgH = (canvas.height * pageW) / canvas.width
  let heightLeft = imgH
  let position = 0
  pdf.addImage(img, 'JPEG', 0, position, pageW, imgH)
  heightLeft -= pageH
  while (heightLeft > 0) {
    position -= pageH
    pdf.addPage()
    pdf.addImage(img, 'JPEG', 0, position, pageW, imgH)
    heightLeft -= pageH
  }
  pdf.save(filename)
}

// Estampa el sello de firma sobre un PDF EXISTENTE cargado por el usuario.
// Rasteriza el nodo del sello y lo incrusta en la última página (esquina
// inferior derecha) usando pdf-lib, preservando el documento original.
export async function stampSealOnPdf(fileBuffer, sealNode, filename) {
  const [{ PDFDocument }, { default: html2canvas }] = await Promise.all([
    import('pdf-lib'),
    import('html2canvas'),
  ])
  const canvas = await html2canvas(sealNode, { scale: 2, backgroundColor: '#ffffff', logging: false })
  const png = canvas.toDataURL('image/png')

  const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true })
  const image = await pdfDoc.embedPng(png)
  const page = pdfDoc.getPages()[pdfDoc.getPageCount() - 1]
  const { width } = page.getSize()
  const w = Math.min(200, width - 60)
  const h = (image.height / image.width) * w
  page.drawImage(image, { x: width - w - 30, y: 30, width: w, height: h })

  const bytes = await pdfDoc.save()
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// Estampa el sello en una posición/tamaño EXACTOS elegidos por el usuario.
// placement = { page: índice base 0, xr, yr, wr } — ratios relativos al
// tamaño de la página (yr medido desde el borde superior).
export async function stampSealOnPdfAt(fileBuffer, sealNode, placement, filename) {
  const [{ PDFDocument }, { default: html2canvas }] = await Promise.all([
    import('pdf-lib'),
    import('html2canvas'),
  ])
  const canvas = await html2canvas(sealNode, { scale: 2, backgroundColor: '#ffffff', logging: false })
  const png = canvas.toDataURL('image/png')

  const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true })
  const image = await pdfDoc.embedPng(png)
  const pages = pdfDoc.getPages()
  const page = pages[Math.min(placement.page, pages.length - 1)]
  const { width, height } = page.getSize()
  const w = placement.wr * width
  const h = w * (image.height / image.width)
  const x = placement.xr * width
  const y = height - placement.yr * height - h
  page.drawImage(image, { x, y, width: w, height: h })

  const bytes = await pdfDoc.save()
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// Exportación simple a CSV (compatible con Excel).
export function exportToCSV(filename, rows, headers) {
  const head = headers.map((h) => h.label).join(';')
  const body = rows
    .map((r) => headers.map((h) => `"${String(h.value ? h.value(r) : r[h.key] ?? '').replace(/"/g, '""')}"`).join(';'))
    .join('\n')
  const csv = '﻿' + head + '\n' + body
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
