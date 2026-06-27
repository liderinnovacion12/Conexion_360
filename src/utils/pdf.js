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
