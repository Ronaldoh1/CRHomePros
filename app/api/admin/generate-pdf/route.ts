import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { writeFileSync, readFileSync, unlinkSync, mkdirSync } from 'fs'
import { join } from 'path'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    // Build the Python script for PDF generation
    const tmpDir = '/tmp/pdf-gen'
    try { mkdirSync(tmpDir, { recursive: true }) } catch {}
    
    const jsonPath = join(tmpDir, `${Date.now()}.json`)
    const outPath = join(tmpDir, `${Date.now()}.pdf`)
    
    writeFileSync(jsonPath, JSON.stringify({ type, data }))

    const pythonScript = `
import json, sys, os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT

with open("${jsonPath}") as f:
    payload = json.load(f)

doc_type = payload["type"]
d = payload["data"]

WIDTH, HEIGHT = letter
BLUE = colors.HexColor("#1e3a5f")
GOLD = colors.HexColor("#c4a45f")
DARK = colors.HexColor("#0f172a")
GRAY = colors.HexColor("#64748b")

class DocTemplate(canvas.Canvas):
    pass

def build_pdf(output_path):
    c = canvas.Canvas(output_path, pagesize=letter)
    
    # ── HEADER ──
    # Blue header bar
    c.setFillColor(BLUE)
    c.rect(0, HEIGHT - 120, WIDTH, 120, fill=True, stroke=False)
    
    # Company name
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 26)
    c.drawString(60, HEIGHT - 55, "C&R")
    c.setFont("Helvetica", 11)
    c.drawString(60, HEIGHT - 72, "General Services Inc.")
    c.setFont("Helvetica", 8)
    c.setFillColor(GOLD)
    c.drawString(60, HEIGHT - 86, "Licensed  |  Insured  |  Bonded")
    c.setFont("Helvetica", 7)
    c.setFillColor(colors.HexColor("#94a3b8"))
    c.drawString(60, HEIGHT - 100, "www.crgenserv.com  |  (571) 237-7164  |  crhomepros@gmail.com")
    
    # Document type badge
    type_labels = {"invoice": "INVOICE", "change-order": "CHANGE ORDER", "contract": "CONTRACT"}
    badge = type_labels.get(doc_type, "DOCUMENT")
    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 18)
    c.drawRightString(WIDTH - 60, HEIGHT - 55, badge)
    
    # Doc number
    c.setFillColor(colors.white)
    c.setFont("Helvetica", 10)
    c.drawRightString(WIDTH - 60, HEIGHT - 75, f"#{d.get('number', '')}")
    
    # Gold accent bar
    c.setFillColor(GOLD)
    c.rect(0, HEIGHT - 124, WIDTH, 4, fill=True, stroke=False)
    
    y = HEIGHT - 155
    
    # ── DATE ──
    c.setFillColor(DARK)
    c.setFont("Helvetica", 10)
    c.drawString(60, y, f"Date: {d.get('date', '')}")
    if d.get("dueDate"):
        c.drawRightString(WIDTH - 60, y, f"Due: {d['dueDate']}")
    y -= 30
    
    # ── CLIENT INFO ──
    c.setFillColor(BLUE)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(60, y, "CLIENT")
    y -= 16
    c.setFillColor(DARK)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(60, y, d.get("clientName", ""))
    y -= 15
    c.setFont("Helvetica", 10)
    c.setFillColor(GRAY)
    if d.get("clientAddress"):
        for line in d["clientAddress"].split("\\n"):
            c.drawString(60, y, line.strip())
            y -= 14
    if d.get("clientPhone"):
        c.drawString(60, y, f"Phone: {d['clientPhone']}")
        y -= 14
    if d.get("clientEmail"):
        c.drawString(60, y, f"Email: {d['clientEmail']}")
        y -= 14
    
    # Property address (for change orders / contracts)
    if d.get("propertyAddress"):
        y -= 6
        c.setFillColor(BLUE)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(300, HEIGHT - 185, "PROPERTY")
        c.setFillColor(DARK)
        c.setFont("Helvetica", 10)
        py = HEIGHT - 201
        for line in d["propertyAddress"].split("\\n"):
            c.drawString(300, py, line.strip())
            py -= 14
    
    y -= 10
    
    # ── PROJECT NAME ──
    if d.get("projectName"):
        c.setFillColor(BLUE)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(60, y, "PROJECT")
        y -= 16
        c.setFillColor(DARK)
        c.setFont("Helvetica", 10)
        c.drawString(60, y, d["projectName"])
        y -= 25
    
    # ── LINE ITEMS TABLE ──
    items = d.get("items", [])
    if items and items[0].get("unitPrice") is not None:
        # Invoice / Change Order style - with pricing
        header = ["#", "Description", "Qty", "Unit Price", "Amount"]
        table_data = [header]
        for i, item in enumerate(items):
            qty = item.get("quantity", 1)
            price = item.get("unitPrice", 0)
            amount = qty * price
            table_data.append([
                str(i + 1),
                item.get("description", ""),
                str(qty),
                f"$ {price:,.2f}",
                f"$ {amount:,.2f}"
            ])
        
        col_widths = [30, 250, 40, 80, 90]
        t = Table(table_data, colWidths=col_widths)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), BLUE),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('ALIGN', (0, 0), (0, -1), 'CENTER'),
            ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]))
        
        tw, th = t.wrapOn(c, WIDTH - 120, 400)
        if y - th < 120:
            c.showPage()
            y = HEIGHT - 60
        t.drawOn(c, 60, y - th)
        y = y - th - 15
        
        # Totals
        subtotal = sum(item.get("quantity", 1) * item.get("unitPrice", 0) for item in items)
        tax_rate = d.get("taxRate", 0)
        tax = subtotal * (tax_rate / 100)
        total = subtotal + tax
        
        totals_x = WIDTH - 60
        c.setFont("Helvetica", 10)
        c.setFillColor(GRAY)
        c.drawRightString(totals_x, y, f"Subtotal:  $ {subtotal:,.2f}")
        y -= 16
        if tax_rate > 0:
            c.drawRightString(totals_x, y, f"Tax ({tax_rate}%):  $ {tax:,.2f}")
            y -= 16
        
        # Total highlight
        c.setFillColor(BLUE)
        c.rect(totals_x - 200, y - 8, 200, 26, fill=True, stroke=False)
        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", 13)
        c.drawRightString(totals_x - 8, y, f"TOTAL:  $ {total:,.2f}")
        y -= 35
    
    elif items:
        # Contract style - scope of work items (no pricing per line)
        y -= 5
        c.setFillColor(BLUE)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(60, y, "SCOPE OF WORK")
        y -= 20
        
        c.setFillColor(DARK)
        c.setFont("Helvetica", 9.5)
        for i, item in enumerate(items):
            desc = item.get("description", "")
            # Wrap long lines
            words = desc.split()
            lines = []
            current = f"{i+1}. "
            for w in words:
                if len(current + w) > 85:
                    lines.append(current)
                    current = "    " + w + " "
                else:
                    current += w + " "
            lines.append(current)
            
            for line in lines:
                if y < 120:
                    c.showPage()
                    y = HEIGHT - 60
                c.drawString(70, y, line.strip())
                y -= 14
            y -= 4
    
    # ── FREEFORM DESCRIPTION ──
    if d.get("freeformDescription"):
        y -= 5
        c.setFillColor(DARK)
        c.setFont("Helvetica", 9.5)
        for line in d["freeformDescription"].split("\\n"):
            if y < 120:
                c.showPage()
                y = HEIGHT - 60
            c.drawString(60, y, line)
            y -= 14
    
    # ── PAYMENT STRUCTURE ──
    if d.get("paymentStructure"):
        y -= 10
        c.setFillColor(BLUE)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(60, y, "PAYMENT STRUCTURE")
        y -= 18
        c.setFillColor(DARK)
        c.setFont("Helvetica", 9.5)
        for line in d["paymentStructure"].split("\\n"):
            if y < 120:
                c.showPage()
                y = HEIGHT - 60
            c.drawString(60, y, line)
            y -= 14
    
    # ── CONTRACT TERMS ──
    if d.get("contractTerms"):
        y -= 10
        c.setFillColor(BLUE)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(60, y, "TERMS & CONDITIONS")
        y -= 18
        c.setFillColor(DARK)
        c.setFont("Helvetica", 8.5)
        for line in d["contractTerms"].split("\\n"):
            if y < 120:
                c.showPage()
                y = HEIGHT - 60
            c.drawString(60, y, line)
            y -= 13
    
    # ── NOTES ──
    if d.get("notes"):
        y -= 10
        c.setFillColor(BLUE)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(60, y, "NOTES")
        y -= 16
        c.setFillColor(GRAY)
        c.setFont("Helvetica", 9)
        for line in d["notes"].split("\\n"):
            if y < 120:
                c.showPage()
                y = HEIGHT - 60
            c.drawString(60, y, line)
            y -= 13
    
    # ── SIGNATURE BLOCK ──
    if y < 200:
        c.showPage()
        y = HEIGHT - 60
    
    y -= 30
    
    # Separator
    c.setStrokeColor(colors.HexColor("#e2e8f0"))
    c.line(60, y, WIDTH - 60, y)
    y -= 30
    
    # Company signature
    c.setFillColor(DARK)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(60, y, "Provided and Guaranteed by:")
    y -= 25
    c.line(60, y, 250, y)
    y -= 14
    c.setFont("Helvetica-Bold", 10)
    c.drawString(60, y, "Carlos Hernandez")
    y -= 13
    c.setFont("Helvetica", 9)
    c.setFillColor(GRAY)
    c.drawString(60, y, "President, CRGS, Inc.")
    y -= 13
    c.drawString(60, y, "Date: _______________")
    
    # Client signature
    accept_y = y + 52
    c.setFillColor(DARK)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(320, accept_y, "Accepted and Agreed:")
    accept_y -= 25
    c.line(320, accept_y, WIDTH - 60, accept_y)
    accept_y -= 14
    c.setFont("Helvetica-Bold", 10)
    c.drawString(320, accept_y, d.get("clientName", ""))
    accept_y -= 13
    c.setFont("Helvetica", 9)
    c.setFillColor(GRAY)
    c.drawString(320, accept_y, "Date: _______________")
    
    # ── FOOTER ──
    c.setFillColor(BLUE)
    c.rect(0, 0, WIDTH, 40, fill=True, stroke=False)
    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 8)
    c.drawCentredString(WIDTH / 2, 22, "C&R GENERAL SERVICES INC.  |  We Are In This Business For You")
    c.setFillColor(colors.HexColor("#94a3b8"))
    c.setFont("Helvetica", 7)
    c.drawCentredString(WIDTH / 2, 10, "(571) 237-7164  |  crhomepros@gmail.com  |  MHIC #05-132359")
    
    c.save()

build_pdf("${outPath}")
`

    const scriptPath = join(tmpDir, 'gen.py')
    writeFileSync(scriptPath, pythonScript)

    const { stderr } = await execAsync(`python3 ${scriptPath}`)
    if (stderr) console.error('Python stderr:', stderr)

    const pdfBytes = readFileSync(outPath)

    // Cleanup
    try { unlinkSync(jsonPath); unlinkSync(outPath); unlinkSync(scriptPath) } catch {}

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${type}-${data.number || 'document'}.pdf"`,
      },
    })
  } catch (error: any) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
