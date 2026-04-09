const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, BorderStyle, WidthType, ShadingType, TabStopType,
        TabStopPosition, LevelFormat, PageBreak } = require('docx');

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

function sectionTitle(text) {
  return new Paragraph({
    spacing: { before: 280, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BLACK, space: 4 } },
    children: [
      new TextRun({ text: text.toUpperCase(), bold: true, font: FONT, size: 22, characterSpacing: 160, color: BLACK }),
    ],
  });
}

function jobTitle(title, date) {
  return new Paragraph({
    spacing: { before: 180, after: 20 },
    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
    children: [
      new TextRun({ text: title, bold: true, font: FONT, size: 22, color: BLACK }),
      new TextRun({ text: "\t", font: FONT }),
      new TextRun({ text: date, font: FONT, size: 19, color: GRAY, italics: true }),
    ],
  });
}

function companyInfo(company, location) {
  return new Paragraph({
    spacing: { before: 0, after: 80 },
    children: [
      new TextRun({ text: company, font: FONT, size: 20, color: MID, italics: true }),
      new TextRun({ text: `  \u2022  ${location}`, font: FONT, size: 19, color: GRAY }),
    ],
  });
}

function bulletItem(text, ref = "mainBullets") {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { before: 30, after: 30 },
    children: [new TextRun({ text, font: FONT, size: 20, color: DARK })],
  });
}

function boldBullet(boldPart, rest, ref = "mainBullets") {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { before: 30, after: 30 },
    children: [
      new TextRun({ text: boldPart, font: FONT, size: 20, color: BLACK, bold: true }),
      new TextRun({ text: rest, font: FONT, size: 20, color: DARK }),
    ],
  });
}

function spacer(h = 120) {
  return new Paragraph({ spacing: { before: h, after: 0 }, children: [] });
}

const doc = new Document({
  styles: { default: { document: { run: { font: FONT, size: 20, color: DARK } } } },
  numbering: {
    config: [
      { reference: "mainBullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u25AA", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 460, hanging: 230 } } } }] },
      { reference: "skillBulletsL", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u25AA", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 300, hanging: 200 } } } }] },
      { reference: "skillBulletsR", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u25AA", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 300, hanging: 200 } } } }] },
      { reference: "projBullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2013", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 460, hanging: 230 } } } }] },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 0, right: 0, bottom: 900, left: 0 },
      },
    },
    children: [

      // ─── HEADER ──────────────────────────────────────────────
      new Table({
        width: { size: 11906, type: WidthType.DXA },
        columnWidths: [7200, 4706],
        rows: [new TableRow({
          height: { value: 2800, rule: "atLeast" },
          children: [
            new TableCell({
              borders: BORDERS_NONE, width: { size: 7200, type: WidthType.DXA },
              shading: { fill: BLACK, type: ShadingType.CLEAR },
              margins: { top: 600, bottom: 400, left: 900, right: 200 },
              verticalAlign: "center",
              children: [
                new Paragraph({ spacing: { after: 60 }, children: [
                  new TextRun({ text: "THIAGO OLIVEIRA LIMA", bold: true, font: FONT, size: 38, characterSpacing: 200, color: WHITE }),
                ]}),
                new Paragraph({ spacing: { after: 0 }, children: [
                  new TextRun({ text: "WAREHOUSE OFFICE ADMINISTRATOR", font: FONT, size: 18, characterSpacing: 120, color: LIGHT_GRAY }),
                ]}),
                new Paragraph({ spacing: { before: 40, after: 0 }, children: [
                  new TextRun({ text: "Inventory Management  |  AI Process Automation", font: FONT, size: 16, characterSpacing: 80, color: GRAY }),
                ]}),
              ],
            }),
            new TableCell({
              borders: BORDERS_NONE, width: { size: 4706, type: WidthType.DXA },
              shading: { fill: DARK, type: ShadingType.CLEAR },
              margins: { top: 500, bottom: 400, left: 400, right: 600 },
              verticalAlign: "center",
              children: [
                ...["0432 625 402", "caianthiago@gmail.com", "linkedin.com/in/thiagocaian", "114 Marine Parade, Southport QLD 4215"].map(line =>
                  new Paragraph({ spacing: { before: 25, after: 25 }, alignment: AlignmentType.RIGHT, children: [
                    new TextRun({ text: line, font: FONT, size: 17, color: LIGHT_GRAY }),
                  ]})
                ),
              ],
            }),
          ],
        })],
      }),

      // ─── CONTENT ─────────────────────────────────────────────
      new Table({
        width: { size: 11906, type: WidthType.DXA },
        columnWidths: [11906],
        rows: [new TableRow({ children: [new TableCell({
          borders: BORDERS_NONE, width: { size: 11906, type: WidthType.DXA },
          margins: { top: 200, bottom: 200, left: 900, right: 900 },
          children: [

            // ─── SUMMARY ───────────────────────────────────
            sectionTitle("Professional Summary"),
            new Paragraph({
              spacing: { before: 80, after: 100 },
              children: [
                new TextRun({ text: "Organised, hands-on Warehouse Office Administrator with ", font: FONT, size: 20, color: DARK }),
                new TextRun({ text: "3+ years of real-world warehouse operations experience", font: FONT, size: 20, color: BLACK, bold: true }),
                new TextRun({ text: " (RapidLED, Gold Coast) managing stock control, order processing, data entry, dispatch coordination, and operational reporting in a high-volume e-commerce environment. I bring a unique edge: ", font: FONT, size: 20, color: DARK }),
                new TextRun({ text: "I built a complete warehouse management system from scratch", font: FONT, size: 20, color: BLACK, bold: true }),
                new TextRun({ text: " (CYTRON Platform) featuring real-time inventory dashboards, QR code scanning, automated low-stock alerts, and AI-powered data entry \u2014 the same tools I use to make any warehouse office run faster and error-free. Based in Southport, seeking a warehouse office role in the Brisbane Rd / Arundel corridor where I can deliver reliable administration support and introduce smart automations that save the team hours every week.", font: FONT, size: 20, color: DARK }),
              ],
            }),

            // ─── WAREHOUSE OFFICE SKILLS ───────────────────
            sectionTitle("What I Bring to Your Warehouse Office"),

            // Headers
            new Table({
              width: { size: 10106, type: WidthType.DXA },
              columnWidths: [5053, 5053],
              rows: [
                new TableRow({ children: [
                  new TableCell({ borders: BORDERS_NONE, width: { size: 5053, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 0, right: 120 }, shading: { fill: BG_LIGHT, type: ShadingType.CLEAR }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Warehouse Office Essentials", bold: true, font: FONT, size: 19, color: BLACK })] }),
                  ]}),
                  new TableCell({ borders: BORDERS_NONE, width: { size: 5053, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 120, right: 0 }, shading: { fill: BLACK, type: ShadingType.CLEAR }, children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "My AI & Automation Edge", bold: true, font: FONT, size: 19, color: WHITE })] }),
                  ]}),
                ]}),
                ...([
                  ["Stock receiving, dispatching & tracking", "Real-time inventory dashboard with automated low-stock alerts"],
                  ["Purchase orders & supplier coordination", "AI auto-generates POs when stock hits threshold \u2014 zero delay"],
                  ["Data entry & warehouse records", "AI extracts data from delivery dockets, invoices, and forms instantly"],
                  ["Picking, packing & dispatch documentation", "QR code scanning for instant lookups and dispatch tracking"],
                  ["WH&S compliance & safety records", "Automated compliance tracking with expiry alerts and PDF reports"],
                  ["Delivery scheduling & driver coordination", "n8n workflows auto-schedule and send driver notifications"],
                  ["Reporting to warehouse manager", "Live dashboards \u2014 always accurate, one-click export, no spreadsheets"],
                  ["Email, phone & client communication", "Automated follow-ups and status updates via n8n + AI"],
                ].map(([left, right]) =>
                  new TableRow({ children: [
                    new TableCell({ borders: BORDERS_NONE, width: { size: 5053, type: WidthType.DXA }, margins: { top: 30, bottom: 30, left: 0, right: 80 }, children: [
                      new Paragraph({ numbering: { reference: "skillBulletsL", level: 0 }, children: [new TextRun({ text: left, font: FONT, size: 19, color: DARK })] }),
                    ]}),
                    new TableCell({ borders: BORDERS_NONE, width: { size: 5053, type: WidthType.DXA }, margins: { top: 30, bottom: 30, left: 80, right: 0 }, children: [
                      new Paragraph({ numbering: { reference: "skillBulletsR", level: 0 }, children: [new TextRun({ text: right, font: FONT, size: 19, color: MID, italics: true })] }),
                    ]}),
                  ]})
                )),
              ],
            }),

            // ─── EXPERIENCE ────────────────────────────────
            sectionTitle("Professional Experience"),

            // RapidLED
            jobTitle("Warehouse Operations & Office Administrator", "2023 \u2013 2026"),
            companyInfo("RapidLED", "Gold Coast, QLD  \u2022  3 years"),
            boldBullet("Stock Management: ", "Managed receiving, dispatching, and inventory tracking across a high-volume e-commerce warehouse \u2014 maintaining accurate stock levels and processing daily orders"),
            boldBullet("Data Entry & Records: ", "Handled all warehouse data entry, order processing, supplier correspondence, and operational documentation with attention to accuracy and deadlines"),
            boldBullet("Process Improvement: ", "Identified inefficiencies in stock tracking and dispatch workflows, implementing QR code-based data capture that reduced manual entry errors by 40%"),
            boldBullet("Reporting: ", "Produced regular inventory reports, stock reconciliation summaries, and operational KPIs for warehouse management decision-making"),
            boldBullet("Technology: ", "Introduced real-time dashboards and automated alerts, replacing manual spreadsheet tracking and saving 10+ hours per week of admin time"),
            boldBullet("WH&S: ", "Maintained awareness of workplace health and safety standards, ensuring compliance in daily warehouse operations"),

            // CYTRON
            jobTitle("Warehouse Systems Developer & Automation Specialist", "2026 \u2013 Present"),
            companyInfo("CYTRON Platform (cytronai.com)", "Gold Coast, QLD"),
            boldBullet("Built Stock Guardian: ", "Complete warehouse management system with real-time inventory dashboard, QR code scanning for instant stock lookups, and automated Telegram + email alerts when stock drops below threshold"),
            boldBullet("AI Data Entry: ", "Developed voice-to-data bot (GPT-4 + Whisper) that transcribes speech and updates inventory database in real-time \u2014 eliminates manual data entry entirely"),
            boldBullet("Automated Quoting: ", "Built AI-powered quote generator (Claude AI) that produces fully itemised quotes in under 5 minutes \u2014 previously 45 minutes of manual work"),
            boldBullet("Compliance Automation: ", "Created automated compliance tracking with expiry date alerts, renewal reminders, and audit-ready PDF report generation"),
            boldBullet("Workflow Engine: ", "Designed 20+ n8n automation workflows connecting warehouse operations to email, calendars, messaging, and reporting systems"),

            // Stefanini
            jobTitle("QA Analyst & Data Quality Specialist", "2021 \u2013 2023"),
            companyInfo("Stefanini Group @ Sicoob (Financial Sector)", "Brazil"),
            boldBullet("Data Accuracy: ", "Tested enterprise systems processing 10,000+ daily transactions \u2014 ensuring data integrity, system reliability, and regulatory compliance across all records"),
            boldBullet("Documentation: ", "Created comprehensive test plans, defect reports, and process documentation supporting large-scale system migrations"),
            boldBullet("Database Management: ", "Worked extensively with SQL databases for data verification, query optimisation, and management reporting"),

          ],
        })]})],
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════ PAGE 2 ═══════════════════════

      new Table({
        width: { size: 11906, type: WidthType.DXA },
        columnWidths: [11906],
        rows: [new TableRow({ children: [new TableCell({
          borders: BORDERS_NONE, width: { size: 11906, type: WidthType.DXA },
          margins: { top: 600, bottom: 200, left: 900, right: 900 },
          children: [

            // ─── AUTOMATION IMPACT TABLE ───────────────────
            sectionTitle("How I Transform Warehouse Office Work"),
            new Paragraph({
              spacing: { before: 60, after: 100 },
              children: [new TextRun({ text: "Real examples of manual warehouse tasks I\u2019ve automated with n8n + AI:", font: FONT, size: 20, color: MID, italics: true })],
            }),

            new Table({
              width: { size: 10106, type: WidthType.DXA },
              columnWidths: [2800, 3653, 3653],
              rows: [
                new TableRow({ children: [
                  ...["WAREHOUSE TASK", "BEFORE (MANUAL)", "AFTER (AUTOMATED)"].map((h, i) =>
                    new TableCell({
                      borders: BORDERS_NONE, width: { size: [2800, 3653, 3653][i], type: WidthType.DXA },
                      margins: { top: 60, bottom: 60, left: 100, right: 100 },
                      shading: { fill: BLACK, type: ShadingType.CLEAR },
                      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, font: FONT, size: 16, color: WHITE, characterSpacing: 80 })] })],
                    })
                  ),
                ]}),
                ...([
                  ["Stock level checks", "Walk the floor or check spreadsheet", "Live dashboard + Telegram alert when low"],
                  ["Receiving deliveries", "Paper docket, manual data entry", "QR scan \u2192 instant database update"],
                  ["Supplier PO creation", "Type up PO, email manually", "Auto-generated when stock hits reorder point"],
                  ["Dispatch documentation", "Fill forms, print labels manually", "One-click generate from system data"],
                  ["Inventory reports", "Hours in Excel every Friday", "Real-time dashboard, always accurate"],
                  ["Quote preparation", "45 min, manual calculations", "5 min \u2014 Claude AI generates complete quote"],
                  ["WH&S compliance docs", "Paper files, missed renewals", "Auto-alerts 30 days before expiry + PDF"],
                  ["Follow-up comms", "Forget, leads/orders go cold", "n8n auto-sends at the right time"],
                ].map(([task, before, after], idx) =>
                  new TableRow({ children: [
                    new TableCell({
                      borders: BORDERS_NONE, width: { size: 2800, type: WidthType.DXA },
                      margins: { top: 40, bottom: 40, left: 100, right: 60 },
                      shading: { fill: idx % 2 === 0 ? BG_LIGHT : WHITE, type: ShadingType.CLEAR },
                      children: [new Paragraph({ children: [new TextRun({ text: task, bold: true, font: FONT, size: 18, color: BLACK })] })],
                    }),
                    new TableCell({
                      borders: BORDERS_NONE, width: { size: 3653, type: WidthType.DXA },
                      margins: { top: 40, bottom: 40, left: 80, right: 60 },
                      shading: { fill: idx % 2 === 0 ? BG_LIGHT : WHITE, type: ShadingType.CLEAR },
                      children: [new Paragraph({ children: [new TextRun({ text: before, font: FONT, size: 18, color: GRAY })] })],
                    }),
                    new TableCell({
                      borders: BORDERS_NONE, width: { size: 3653, type: WidthType.DXA },
                      margins: { top: 40, bottom: 40, left: 80, right: 60 },
                      shading: { fill: idx % 2 === 0 ? BG_LIGHT : WHITE, type: ShadingType.CLEAR },
                      children: [new Paragraph({ children: [new TextRun({ text: after, font: FONT, size: 18, color: BLACK, bold: true })] })],
                    }),
                  ]})
                )),
              ],
            }),

            // ─── TOOLS ────────────────────────────────────
            sectionTitle("Tools & Technologies"),

            new Table({
              width: { size: 10106, type: WidthType.DXA },
              columnWidths: [2800, 7306],
              rows: [
                ["Warehouse Systems", "Inventory management, QR code scanning, barcode systems, stock control, dispatch tracking"],
                ["Office Suite", "Microsoft 365 (Word, Excel, Outlook, Teams), Google Workspace (Docs, Sheets, Gmail, Calendar)"],
                ["AI Tools", "Claude AI, ChatGPT / GPT-4, Whisper (voice-to-text), AI document & report generation"],
                ["Automation", "n8n (advanced \u2014 20+ production workflows), Zapier, Make, webhook orchestration"],
                ["Databases", "PostgreSQL, Supabase, Airtable, Excel/Sheets for inventory & data management"],
                ["Development", "Next.js, TypeScript, React, REST APIs, Vercel deployment"],
                ["Communication", "Slack, Teams, Telegram Bot API, automated email workflows"],
                ["Security & WH&S", "CompTIA A+, Network+, Security+ track (in progress), WH&S awareness"],
              ].map(([cat, detail], idx) =>
                new TableRow({ children: [
                  new TableCell({
                    borders: BORDERS_NONE, width: { size: 2800, type: WidthType.DXA },
                    margins: { top: 50, bottom: 50, left: 100, right: 60 },
                    shading: { fill: idx % 2 === 0 ? BG_LIGHT : WHITE, type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: cat, bold: true, font: FONT, size: 19, color: BLACK })] })],
                  }),
                  new TableCell({
                    borders: BORDERS_NONE, width: { size: 7306, type: WidthType.DXA },
                    margins: { top: 50, bottom: 50, left: 120, right: 60 },
                    shading: { fill: idx % 2 === 0 ? BG_LIGHT : WHITE, type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: detail, font: FONT, size: 19, color: DARK })] })],
                  }),
                ]})
              ),
            }),

            // ─── EDUCATION ─────────────────────────────────
            sectionTitle("Education & Certifications"),

            new Paragraph({ spacing: { before: 100, after: 40 }, children: [
              new TextRun({ text: "Cybersecurity Professional Bootcamp", bold: true, font: FONT, size: 20, color: BLACK }),
              new TextRun({ text: "  \u2014  In Progress", font: FONT, size: 19, color: GRAY, italics: true }),
            ]}),
            new Paragraph({ spacing: { before: 0, after: 20 }, children: [
              new TextRun({ text: "Lumify Learn  \u2022  CompTIA Track: A+, Network+, Security+", font: FONT, size: 19, color: MID }),
            ]}),
            spacer(40),
            new Paragraph({ spacing: { before: 0, after: 40 }, children: [
              new TextRun({ text: "QA & Programming Certifications", bold: true, font: FONT, size: 20, color: BLACK }),
            ]}),
            new Paragraph({ spacing: { before: 0, after: 20 }, children: [
              new TextRun({ text: "Java, Python, SQL, Selenium, Jenkins", font: FONT, size: 19, color: MID }),
            ]}),

            // ─── ADDITIONAL ────────────────────────────────
            sectionTitle("Additional Information"),

            bulletItem("Full Australian work rights \u2014 available for immediate start"),
            bulletItem("Based in Southport, QLD \u2014 minutes from Brisbane Rd / Arundel warehouse corridor"),
            bulletItem("Available for part-time, full-time, casual, and flexible hours"),
            bulletItem("Languages: Portuguese (native), English (professional working proficiency)"),
            bulletItem("Live demo of warehouse system: cytronai.com"),

            spacer(250),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              border: { top: { style: BorderStyle.SINGLE, size: 2, color: BORDER, space: 8 } },
              children: [new TextRun({ text: "References available upon request", font: FONT, size: 18, color: LIGHT_GRAY, italics: true })],
            }),

          ],
        })]})],
      }),

    ],
  }],
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/Users/thiagocaian/projeto-x/cv/Thiago_Oliveira_Lima_Warehouse_CV.docx", buffer);
  console.log("Warehouse CV created!");
  console.log("File: /Users/thiagocaian/projeto-x/cv/Thiago_Oliveira_Lima_Warehouse_CV.docx");
  console.log("Size:", (buffer.length / 1024).toFixed(1), "KB");
});
