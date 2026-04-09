const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, BorderStyle, WidthType, ShadingType, LevelFormat } = require('docx');

const BLACK = "0A0A0A";
const DARK = "1A1A1A";
const MID = "4A4A4A";
const GRAY = "717171";
const LIGHT_GRAY = "A0A0A0";
const BORDER = "D0D0D0";
const BG_LIGHT = "F5F5F5";
const WHITE = "FFFFFF";
const FONT = "Calibri";

const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: WHITE };
const BORDERS_NONE = { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER };

function spacer(h = 120) {
  return new Paragraph({ spacing: { before: h, after: 0 }, children: [] });
}

function para(runs, opts = {}) {
  return new Paragraph({
    spacing: { before: opts.before || 0, after: opts.after || 140 },
    alignment: opts.align || AlignmentType.LEFT,
    children: Array.isArray(runs) ? runs : [new TextRun({ text: runs, font: FONT, size: 22, color: DARK })],
  });
}

function text(t, opts = {}) {
  return new TextRun({
    text: t,
    font: FONT,
    size: opts.size || 22,
    color: opts.color || DARK,
    bold: opts.bold || false,
    italics: opts.italics || false,
  });
}

const doc = new Document({
  styles: { default: { document: { run: { font: FONT, size: 22, color: DARK } } } },
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "\u25AA",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 460, hanging: 230 } } },
      }],
    }],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 0, right: 0, bottom: 1200, left: 0 },
      },
    },
    children: [

      // ─── HEADER ──────────────────────────────────────────────
      new Table({
        width: { size: 11906, type: WidthType.DXA },
        columnWidths: [7400, 4506],
        rows: [new TableRow({
          height: { value: 2200, rule: "atLeast" },
          children: [
            new TableCell({
              borders: BORDERS_NONE, width: { size: 7400, type: WidthType.DXA },
              shading: { fill: BLACK, type: ShadingType.CLEAR },
              margins: { top: 500, bottom: 400, left: 900, right: 200 },
              verticalAlign: "center",
              children: [
                new Paragraph({ spacing: { after: 40 }, children: [
                  new TextRun({ text: "THIAGO OLIVEIRA LIMA", bold: true, font: FONT, size: 32, characterSpacing: 180, color: WHITE }),
                ]}),
                new Paragraph({ spacing: { after: 0 }, children: [
                  new TextRun({ text: "WAREHOUSE OFFICE ADMINISTRATOR", font: FONT, size: 16, characterSpacing: 100, color: LIGHT_GRAY }),
                ]}),
              ],
            }),
            new TableCell({
              borders: BORDERS_NONE, width: { size: 4506, type: WidthType.DXA },
              shading: { fill: DARK, type: ShadingType.CLEAR },
              margins: { top: 400, bottom: 400, left: 300, right: 600 },
              verticalAlign: "center",
              children: [
                ...["0432 625 402", "caianthiago@gmail.com", "linkedin.com/in/thiagocaian", "114 Marine Parade, Southport QLD 4215"].map(line =>
                  new Paragraph({ spacing: { before: 20, after: 20 }, alignment: AlignmentType.RIGHT, children: [
                    new TextRun({ text: line, font: FONT, size: 16, color: LIGHT_GRAY }),
                  ]})
                ),
              ],
            }),
          ],
        })],
      }),

      // ─── LETTER BODY ─────────────────────────────────────────
      new Table({
        width: { size: 11906, type: WidthType.DXA },
        columnWidths: [11906],
        rows: [new TableRow({ children: [new TableCell({
          borders: BORDERS_NONE, width: { size: 11906, type: WidthType.DXA },
          margins: { top: 400, bottom: 200, left: 900, right: 900 },
          children: [

            // Date
            para([text("5 April 2026", { color: GRAY, size: 20 })], { after: 200 }),

            // Addressee
            para([text("Hiring Manager", { bold: true })], { after: 20 }),
            para([text("[Company Name]", { color: GRAY })], { after: 20 }),
            para([text("Brisbane Rd, Arundel / Labrador QLD", { color: GRAY })], { after: 280 }),

            // Subject
            para([
              text("RE: ", { color: GRAY, bold: true }),
              text("Warehouse Office Administrator / Warehouse Assistant", { bold: true, color: BLACK }),
            ], { after: 280 }),

            // Opening
            para([text("Dear Hiring Manager,")], { after: 200 }),

            // Para 1
            para([
              text("I\u2019m writing to express my strong interest in the Warehouse Office role at your company. As someone who lives in "),
              text("Southport \u2014 just minutes from Brisbane Rd and Arundel", { bold: true }),
              text(" \u2014 and with "),
              text("3+ years of hands-on warehouse operations and office administration experience", { bold: true }),
              text(" at RapidLED on the Gold Coast, I\u2019m confident I can hit the ground running and deliver real value from day one."),
            ]),

            // Para 2
            para([
              text("At RapidLED, I managed the full scope of warehouse office duties: stock receiving and dispatching, data entry, order processing, inventory reconciliation, supplier correspondence, and operational reporting. But I didn\u2019t stop there \u2014 I "),
              text("identified inefficiencies and built solutions", { bold: true }),
              text(". I implemented QR code-based data capture that reduced manual entry errors by 40%, introduced real-time dashboards that replaced weekly spreadsheet reporting, and set up automated stock alerts that eliminated the need for manual floor checks."),
            ]),

            // Para 3 - the differentiator
            para([
              text("What truly sets me apart is that I\u2019ve gone beyond the typical admin role. I "),
              text("built an entire warehouse management system from scratch", { bold: true }),
              text(" (CYTRON Platform \u2014 live at cytronai.com) featuring:"),
            ], { after: 80 }),

            // Bullet points
            new Paragraph({
              numbering: { reference: "bullets", level: 0 },
              spacing: { before: 40, after: 40 },
              children: [
                text("Real-time inventory dashboard", { bold: true }),
                text(" with automated low-stock alerts via Telegram and email", {}),
              ],
            }),
            new Paragraph({
              numbering: { reference: "bullets", level: 0 },
              spacing: { before: 40, after: 40 },
              children: [
                text("QR code scanning", { bold: true }),
                text(" for instant stock lookups and dispatch tracking", {}),
              ],
            }),
            new Paragraph({
              numbering: { reference: "bullets", level: 0 },
              spacing: { before: 40, after: 40 },
              children: [
                text("AI-powered quote generation", { bold: true }),
                text(" that reduced preparation time from 45 minutes to under 5", {}),
              ],
            }),
            new Paragraph({
              numbering: { reference: "bullets", level: 0 },
              spacing: { before: 40, after: 40 },
              children: [
                text("Automated compliance tracking", { bold: true }),
                text(" with renewal alerts and audit-ready PDF reports", {}),
              ],
            }),
            new Paragraph({
              numbering: { reference: "bullets", level: 0 },
              spacing: { before: 40, after: 80 },
              children: [
                text("Voice-to-data AI bot", { bold: true }),
                text(" that eliminates manual data entry entirely", {}),
              ],
            }),

            // Para 4
            para([
              text("I bring these same skills \u2014 "),
              text("n8n workflow automation, Claude AI, and GPT-4", { bold: true }),
              text(" \u2014 to every role I take on. This means that while I deliver reliable, accurate office administration, I also find ways to "),
              text("save the team hours every week", { bold: true }),
              text(" by automating the repetitive tasks that slow everyone down. I don\u2019t just manage the warehouse office \u2014 I make it run smarter."),
            ]),

            // Para 5 - availability
            para([
              text("I have "),
              text("full Australian work rights", { bold: true }),
              text(", am available for "),
              text("immediate start", { bold: true }),
              text(", and am open to part-time, full-time, or casual arrangements. I\u2019m bilingual in English and Portuguese, and I thrive in fast-paced, hands-on environments."),
            ]),

            // Closing
            para([
              text("I\u2019d welcome the opportunity to discuss how my warehouse operations experience and automation skills can benefit your team. I\u2019m available for an interview at your convenience."),
            ], { after: 280 }),

            para([text("Kind regards,")], { after: 120 }),

            // Signature
            para([text("Thiago Oliveira Lima", { bold: true, color: BLACK, size: 24 })], { after: 20 }),
            para([text("0432 625 402  |  caianthiago@gmail.com", { color: GRAY, size: 20 })], { after: 20 }),
            para([text("linkedin.com/in/thiagocaian  |  cytronai.com", { color: GRAY, size: 20 })], { after: 0 }),

          ],
        })]})],
      }),

    ],
  }],
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/Users/thiagocaian/projeto-x/cv/Thiago_Cover_Letter_Warehouse.docx", buffer);
  console.log("Cover Letter created!");
  console.log("File: /Users/thiagocaian/projeto-x/cv/Thiago_Cover_Letter_Warehouse.docx");
  console.log("Size:", (buffer.length / 1024).toFixed(1), "KB");
});
