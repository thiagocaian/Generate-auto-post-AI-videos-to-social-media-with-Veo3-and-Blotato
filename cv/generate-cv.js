const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, BorderStyle, WidthType, ShadingType, TabStopType,
        TabStopPosition, LevelFormat, PageBreak } = require('docx');

// ─── DESIGN TOKENS ─────────────────────────────────────────────
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

// ─── HELPERS ────────────────────────────────────────────────────

function spacer(h = 120) {
  return new Paragraph({ spacing: { before: h, after: 0 }, children: [] });
}

function sectionTitle(text) {
  return new Paragraph({
    spacing: { before: 280, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BLACK, space: 4 } },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        font: FONT,
        size: 22,
        characterSpacing: 160,
        color: BLACK,
      }),
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
    children: [
      new TextRun({ text, font: FONT, size: 20, color: DARK }),
    ],
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

// ─── DOCUMENT ───────────────────────────────────────────────────

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: FONT, size: 20, color: DARK } },
    },
  },
  numbering: {
    config: [
      {
        reference: "mainBullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u25AA",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 460, hanging: 230 } } },
        }],
      },
      {
        reference: "skillBulletsL",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u25AA",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 300, hanging: 200 } } },
        }],
      },
      {
        reference: "skillBulletsR",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u25AA",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 300, hanging: 200 } } },
        }],
      },
      {
        reference: "projBullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2013",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 460, hanging: 230 } } },
        }],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 0, right: 0, bottom: 900, left: 0 },
        },
      },
      children: [

        // ─── DARK HEADER ───────────────────────────────────────
        new Table({
          width: { size: 11906, type: WidthType.DXA },
          columnWidths: [7200, 4706],
          rows: [
            new TableRow({
              height: { value: 2800, rule: "atLeast" },
              children: [
                new TableCell({
                  borders: BORDERS_NONE,
                  width: { size: 7200, type: WidthType.DXA },
                  shading: { fill: BLACK, type: ShadingType.CLEAR },
                  margins: { top: 600, bottom: 400, left: 900, right: 200 },
                  verticalAlign: "center",
                  children: [
                    new Paragraph({
                      spacing: { after: 60 },
                      children: [
                        new TextRun({
                          text: "THIAGO OLIVEIRA LIMA",
                          bold: true,
                          font: FONT,
                          size: 38,
                          characterSpacing: 200,
                          color: WHITE,
                        }),
                      ],
                    }),
                    new Paragraph({
                      spacing: { after: 0 },
                      children: [
                        new TextRun({
                          text: "OFFICE ADMINISTRATOR  |  AI & PROCESS AUTOMATION",
                          font: FONT,
                          size: 18,
                          characterSpacing: 120,
                          color: LIGHT_GRAY,
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  borders: BORDERS_NONE,
                  width: { size: 4706, type: WidthType.DXA },
                  shading: { fill: DARK, type: ShadingType.CLEAR },
                  margins: { top: 500, bottom: 400, left: 400, right: 600 },
                  verticalAlign: "center",
                  children: [
                    ...[
                      "0432 625 402",
                      "caianthiago@gmail.com",
                      "linkedin.com/in/thiagocaian",
                      "Gold Coast, QLD, Australia",
                    ].map(line =>
                      new Paragraph({
                        spacing: { before: 25, after: 25 },
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({ text: line, font: FONT, size: 17, color: LIGHT_GRAY }),
                        ],
                      })
                    ),
                  ],
                }),
              ],
            }),
          ],
        }),

        // ─── CONTENT ───────────────────────────────────────────
        new Table({
          width: { size: 11906, type: WidthType.DXA },
          columnWidths: [11906],
          rows: [new TableRow({
            children: [new TableCell({
              borders: BORDERS_NONE,
              width: { size: 11906, type: WidthType.DXA },
              margins: { top: 200, bottom: 200, left: 900, right: 900 },
              children: [

                // ─── PROFESSIONAL SUMMARY ──────────────────────
                sectionTitle("Professional Summary"),
                new Paragraph({
                  spacing: { before: 80, after: 100 },
                  children: [
                    new TextRun({
                      text: "Organised and proactive Office Administrator with ",
                      font: FONT, size: 20, color: DARK,
                    }),
                    new TextRun({
                      text: "3+ years of hands-on operations and service delivery experience",
                      font: FONT, size: 20, color: BLACK, bold: true,
                    }),
                    new TextRun({
                      text: " in a fast-paced Gold Coast business (RapidLED). Experienced in managing day-to-day office tasks \u2014 data entry, reporting, scheduling, client communication, document preparation, and inventory tracking. What sets me apart: I bring ",
                      font: FONT, size: 20, color: DARK,
                    }),
                    new TextRun({
                      text: "advanced AI and automation skills (n8n, Claude AI, GPT-4)",
                      font: FONT, size: 20, color: BLACK, bold: true,
                    }),
                    new TextRun({
                      text: " that allow me to identify repetitive office tasks and build automated workflows that save hours every week. I don\u2019t just do the admin work \u2014 I make it faster, smarter, and error-free. Seeking a part-time office role in Southport/Gold Coast where I can deliver reliable administration support while introducing time-saving automations that genuinely transform how the office runs.",
                      font: FONT, size: 20, color: DARK,
                    }),
                  ],
                }),

                // ─── WHAT I BRING TO YOUR OFFICE ───────────────
                sectionTitle("What I Bring to Your Office"),

                new Table({
                  width: { size: 10106, type: WidthType.DXA },
                  columnWidths: [5053, 5053],
                  rows: [
                    ["Reliable Office Administration", "AI-Powered Efficiency"],
                  ].map(([left, right]) =>
                    new TableRow({
                      children: [
                        new TableCell({
                          borders: BORDERS_NONE,
                          width: { size: 5053, type: WidthType.DXA },
                          margins: { top: 60, bottom: 60, left: 0, right: 120 },
                          shading: { fill: BG_LIGHT, type: ShadingType.CLEAR },
                          children: [new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [new TextRun({ text: left, bold: true, font: FONT, size: 19, color: BLACK })],
                          })],
                        }),
                        new TableCell({
                          borders: BORDERS_NONE,
                          width: { size: 5053, type: WidthType.DXA },
                          margins: { top: 60, bottom: 60, left: 120, right: 0 },
                          shading: { fill: BLACK, type: ShadingType.CLEAR },
                          children: [new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [new TextRun({ text: right, bold: true, font: FONT, size: 19, color: WHITE })],
                          })],
                        }),
                      ],
                    })
                  ),
                }),

                // Two columns of skills
                new Table({
                  width: { size: 10106, type: WidthType.DXA },
                  columnWidths: [5053, 5053],
                  rows: [
                    ...([
                      ["Email & calendar management", "Auto-sort, auto-reply, and flag priority emails using AI rules"],
                      ["Data entry & database management", "Eliminate manual entry \u2014 AI extracts data from invoices, forms, photos"],
                      ["Document preparation & formatting", "Generate reports, quotes, and letters in seconds with Claude AI"],
                      ["Client communication & follow-up", "Automated follow-up sequences via n8n \u2014 no lead falls through the cracks"],
                      ["Scheduling & appointment booking", "Smart scheduling workflows that sync calendars and send reminders"],
                      ["Filing, compliance & record-keeping", "Automated compliance tracking with expiry alerts and audit-ready reports"],
                      ["Inventory & stock tracking", "Real-time stock dashboard with automated low-stock alerts (Telegram + email)"],
                      ["Reporting & data analysis", "Live dashboards that replace manual spreadsheet tracking"],
                    ].map(([left, right]) =>
                      new TableRow({
                        children: [
                          new TableCell({
                            borders: BORDERS_NONE,
                            width: { size: 5053, type: WidthType.DXA },
                            margins: { top: 30, bottom: 30, left: 0, right: 80 },
                            children: [new Paragraph({
                              numbering: { reference: "skillBulletsL", level: 0 },
                              children: [new TextRun({ text: left, font: FONT, size: 19, color: DARK })],
                            })],
                          }),
                          new TableCell({
                            borders: BORDERS_NONE,
                            width: { size: 5053, type: WidthType.DXA },
                            margins: { top: 30, bottom: 30, left: 80, right: 0 },
                            children: [new Paragraph({
                              numbering: { reference: "skillBulletsR", level: 0 },
                              children: [new TextRun({ text: right, font: FONT, size: 19, color: MID, italics: true })],
                            })],
                          }),
                        ],
                      })
                    )),
                  ],
                }),

                // ─── PROFESSIONAL EXPERIENCE ───────────────────
                sectionTitle("Professional Experience"),

                // --- RapidLED ---
                jobTitle("Office Operations & Service Delivery Analyst", "2023 \u2013 2026"),
                companyInfo("RapidLED", "Gold Coast, QLD  \u2022  3 years"),
                boldBullet("Office Administration: ", "Managed daily operations in a high-volume e-commerce environment \u2014 data entry, order processing, inventory records, correspondence, and operational reporting"),
                boldBullet("Process Improvement: ", "Identified critical inefficiencies in data tracking and service delivery, then designed and implemented automated solutions that reduced manual data entry errors by 40%"),
                boldBullet("Reporting & Data Integrity: ", "Maintained accurate records across systems through systematic reconciliation, producing data-driven reports for management decision-making"),
                boldBullet("Stakeholder Coordination: ", "Collaborated with team members and management to define priorities, coordinate schedules, and ensure smooth day-to-day office operations"),
                boldBullet("Technology Implementation: ", "Introduced QR code-based workflows, real-time dashboards, and automated alerts \u2014 replacing manual spreadsheets and saving 10+ hours per week"),

                // --- CYTRON ---
                jobTitle("Founder & Automation Specialist", "2026 \u2013 Present"),
                companyInfo("CYTRON Platform (cytronai.com)", "Gold Coast, QLD"),
                boldBullet("Built a complete office automation platform: ", "automated quoting (Claude AI reduces 45 min \u2192 5 min), compliance tracking with expiry alerts, inventory management with QR scanning, and team scheduling"),
                boldBullet("AI Document Generation: ", "Claude AI generates professional quotes, reports, and compliance documents instantly \u2014 the same technology I bring to any office environment"),
                boldBullet("Workflow Automation (n8n): ", "Designed 20+ automated workflows connecting email, calendars, databases, Telegram, and social media \u2014 eliminating repetitive manual tasks"),
                boldBullet("Voice-to-Data: ", "Built AI voice bot that transcribes speech and updates databases in real-time \u2014 zero manual data entry required"),

                // --- Stefanini ---
                jobTitle("QA Analyst & Systems Tester", "2021 \u2013 2023"),
                companyInfo("Stefanini Group @ Sicoob (Financial Sector)", "Brazil"),
                boldBullet("Attention to Detail: ", "Tested enterprise financial systems processing 10,000+ daily transactions \u2014 ensuring data accuracy, system reliability, and regulatory compliance"),
                boldBullet("Documentation: ", "Created comprehensive test documentation, defect reports, and process documentation across multiple release cycles"),
                boldBullet("Data Management: ", "Worked extensively with SQL databases for data management, query optimisation, and reporting"),

                // --- Maco ---
                jobTitle("Office & Marketing Automation Consultant", "2026"),
                companyInfo("Maco Electrics", "Gold Coast, QLD"),
                boldBullet("Office Process Analysis: ", "Audited all administrative processes and identified 12+ manual tasks suitable for AI automation, preparing ROI projections for the business owner"),
                boldBullet("Automated Communications: ", "Built n8n workflows for lead capture, automated follow-up emails, and appointment scheduling \u2014 reducing admin time by 80%"),

              ],
            })],
          })],
        }),

        new Paragraph({ children: [new PageBreak()] }),

        // ══════════════════════════════════════════════════════════
        // PAGE 2
        // ══════════════════════════════════════════════════════════

        new Table({
          width: { size: 11906, type: WidthType.DXA },
          columnWidths: [11906],
          rows: [new TableRow({
            children: [new TableCell({
              borders: BORDERS_NONE,
              width: { size: 11906, type: WidthType.DXA },
              margins: { top: 600, bottom: 200, left: 900, right: 900 },
              children: [

                // ─── AUTOMATION IMPACT ─────────────────────────
                sectionTitle("Real-World Automation Impact"),
                new Paragraph({
                  spacing: { before: 60, after: 100 },
                  children: [
                    new TextRun({
                      text: "Examples of how I\u2019ve used n8n + Claude AI to transform everyday office tasks:",
                      font: FONT, size: 20, color: MID, italics: true,
                    }),
                  ],
                }),

                // Impact table
                new Table({
                  width: { size: 10106, type: WidthType.DXA },
                  columnWidths: [3200, 3453, 3453],
                  rows: [
                    // Header
                    new TableRow({
                      children: [
                        ...["OFFICE TASK", "BEFORE (MANUAL)", "AFTER (AUTOMATED)"].map((h, i) =>
                          new TableCell({
                            borders: BORDERS_NONE,
                            width: { size: [3200, 3453, 3453][i], type: WidthType.DXA },
                            margins: { top: 60, bottom: 60, left: 100, right: 100 },
                            shading: { fill: BLACK, type: ShadingType.CLEAR },
                            children: [new Paragraph({
                              children: [new TextRun({ text: h, bold: true, font: FONT, size: 16, color: WHITE, characterSpacing: 80 })],
                            })],
                          })
                        ),
                      ],
                    }),
                    // Data rows
                    ...([
                      ["Quote preparation", "45 min per quote, manual calculations", "Under 5 min \u2014 Claude AI generates complete quote"],
                      ["Data entry from forms", "Manual typing, frequent errors", "AI extracts data automatically, 40% fewer errors"],
                      ["Follow-up emails", "Staff forgets, leads go cold", "n8n auto-sends at right time, zero missed leads"],
                      ["Stock monitoring", "Check spreadsheet daily", "Real-time alerts via Telegram when stock is low"],
                      ["Compliance tracking", "Paper files, missed deadlines", "Automated expiry alerts + audit-ready PDF reports"],
                      ["Social media posting", "2\u20133 hours per week", "Fully automated: photo \u2192 video \u2192 post (zero effort)"],
                      ["Report generation", "Hours compiling spreadsheets", "Live dashboard, always up-to-date, one-click export"],
                      ["Appointment scheduling", "Phone calls, back-and-forth", "Automated booking + calendar sync + reminders"],
                    ].map(([task, before, after], idx) =>
                      new TableRow({
                        children: [
                          new TableCell({
                            borders: BORDERS_NONE,
                            width: { size: 3200, type: WidthType.DXA },
                            margins: { top: 40, bottom: 40, left: 100, right: 60 },
                            shading: { fill: idx % 2 === 0 ? BG_LIGHT : WHITE, type: ShadingType.CLEAR },
                            children: [new Paragraph({
                              children: [new TextRun({ text: task, bold: true, font: FONT, size: 18, color: BLACK })],
                            })],
                          }),
                          new TableCell({
                            borders: BORDERS_NONE,
                            width: { size: 3453, type: WidthType.DXA },
                            margins: { top: 40, bottom: 40, left: 80, right: 60 },
                            shading: { fill: idx % 2 === 0 ? BG_LIGHT : WHITE, type: ShadingType.CLEAR },
                            children: [new Paragraph({
                              children: [new TextRun({ text: before, font: FONT, size: 18, color: GRAY })],
                            })],
                          }),
                          new TableCell({
                            borders: BORDERS_NONE,
                            width: { size: 3453, type: WidthType.DXA },
                            margins: { top: 40, bottom: 40, left: 80, right: 60 },
                            shading: { fill: idx % 2 === 0 ? BG_LIGHT : WHITE, type: ShadingType.CLEAR },
                            children: [new Paragraph({
                              children: [new TextRun({ text: after, font: FONT, size: 18, color: BLACK, bold: true })],
                            })],
                          }),
                        ],
                      })
                    )),
                  ],
                }),

                // ─── TOOLS & TECHNOLOGIES ──────────────────────
                sectionTitle("Tools & Technologies"),

                new Table({
                  width: { size: 10106, type: WidthType.DXA },
                  columnWidths: [2800, 7306],
                  rows: [
                    ["Office Suite", "Microsoft 365 (Word, Excel, Outlook, Teams), Google Workspace (Docs, Sheets, Gmail, Calendar)"],
                    ["AI Tools", "Claude AI, ChatGPT / GPT-4, Whisper (voice-to-text), AI document generation"],
                    ["Automation", "n8n (advanced \u2014 20+ production workflows), Zapier, Make, webhook orchestration"],
                    ["Databases", "PostgreSQL, Supabase, Airtable, Excel/Sheets for data management"],
                    ["Communication", "Slack, Teams, Telegram Bot API, automated email workflows"],
                    ["Development", "Next.js, TypeScript, React, Tailwind CSS, REST APIs, Vercel"],
                    ["QA & Testing", "Selenium, Postman, Jenkins CI/CD, manual & automated testing"],
                    ["Security", "CompTIA A+, Network+, Security+ track (in progress)"],
                  ].map(([cat, detail], idx) =>
                    new TableRow({
                      children: [
                        new TableCell({
                          borders: BORDERS_NONE,
                          width: { size: 2800, type: WidthType.DXA },
                          margins: { top: 50, bottom: 50, left: 100, right: 60 },
                          shading: { fill: idx % 2 === 0 ? BG_LIGHT : WHITE, type: ShadingType.CLEAR },
                          children: [new Paragraph({
                            children: [new TextRun({ text: cat, bold: true, font: FONT, size: 19, color: BLACK })],
                          })],
                        }),
                        new TableCell({
                          borders: BORDERS_NONE,
                          width: { size: 7306, type: WidthType.DXA },
                          margins: { top: 50, bottom: 50, left: 120, right: 60 },
                          shading: { fill: idx % 2 === 0 ? BG_LIGHT : WHITE, type: ShadingType.CLEAR },
                          children: [new Paragraph({
                            children: [new TextRun({ text: detail, font: FONT, size: 19, color: DARK })],
                          })],
                        }),
                      ],
                    })
                  ),
                }),

                // ─── EDUCATION ─────────────────────────────────
                sectionTitle("Education & Certifications"),

                new Paragraph({
                  spacing: { before: 100, after: 40 },
                  children: [
                    new TextRun({ text: "Cybersecurity Professional Bootcamp", bold: true, font: FONT, size: 20, color: BLACK }),
                    new TextRun({ text: "  \u2014  In Progress", font: FONT, size: 19, color: GRAY, italics: true }),
                  ],
                }),
                new Paragraph({
                  spacing: { before: 0, after: 20 },
                  children: [
                    new TextRun({ text: "Lumify Learn  \u2022  CompTIA Track: A+, Network+, Security+", font: FONT, size: 19, color: MID }),
                  ],
                }),
                spacer(40),
                new Paragraph({
                  spacing: { before: 0, after: 40 },
                  children: [
                    new TextRun({ text: "QA & Programming Certifications", bold: true, font: FONT, size: 20, color: BLACK }),
                  ],
                }),
                new Paragraph({
                  spacing: { before: 0, after: 20 },
                  children: [
                    new TextRun({ text: "Java, Python, SQL, Selenium, Jenkins", font: FONT, size: 19, color: MID }),
                  ],
                }),

                // ─── ADDITIONAL INFO ───────────────────────────
                sectionTitle("Additional Information"),

                bulletItem("Full Australian work rights \u2014 available for immediate start"),
                bulletItem("Based in Gold Coast, QLD \u2014 available for part-time, casual, and flexible hours"),
                bulletItem("Languages: Portuguese (native), English (professional working proficiency)"),
                bulletItem("Portfolio & live demo: cytronai.com"),

                // ─── FOOTER ────────────────────────────────────
                spacer(250),

                new Paragraph({
                  spacing: { before: 0, after: 0 },
                  alignment: AlignmentType.CENTER,
                  border: { top: { style: BorderStyle.SINGLE, size: 2, color: BORDER, space: 8 } },
                  children: [
                    new TextRun({
                      text: "References available upon request",
                      font: FONT,
                      size: 18,
                      color: LIGHT_GRAY,
                      italics: true,
                    }),
                  ],
                }),

              ],
            })],
          })],
        }),

      ],
    },
  ],
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/Users/thiagocaian/projeto-x/cv/Thiago_Oliveira_Lima_CV.docx", buffer);
  console.log("CV created successfully!");
  console.log("File: /Users/thiagocaian/projeto-x/cv/Thiago_Oliveira_Lima_CV.docx");
  console.log("Size:", (buffer.length / 1024).toFixed(1), "KB");
});
