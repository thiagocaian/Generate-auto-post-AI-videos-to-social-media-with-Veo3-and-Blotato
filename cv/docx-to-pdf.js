const puppeteer = require('puppeteer');

async function generatePDF() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @page { size: A4; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Calibri, 'Segoe UI', Arial, sans-serif; color: #1A1A1A; font-size: 8.5pt; line-height: 1.35; }

  /* HEADER */
  .header { display: flex; width: 100%; }
  .header-left { background: #0A0A0A; color: white; flex: 1; padding: 22px 36px; }
  .header-right { background: #1A1A1A; color: #A0A0A0; width: 240px; padding: 22px 28px; text-align: right; font-size: 7.5pt; line-height: 1.7; }
  .name { font-size: 16pt; font-weight: bold; letter-spacing: 3.5px; color: white; margin-bottom: 3px; }
  .title { font-size: 7.5pt; letter-spacing: 1.8px; color: #A0A0A0; }
  .subtitle { font-size: 7pt; letter-spacing: 1.2px; color: #717171; margin-top: 3px; }

  /* CONTENT */
  .content { padding: 12px 36px 20px; }

  .section-title {
    font-size: 8.5pt; font-weight: bold; letter-spacing: 2.5px; color: #0A0A0A;
    border-bottom: 2px solid #0A0A0A; padding-bottom: 2px;
    margin: 12px 0 6px; text-transform: uppercase;
  }

  /* SUMMARY */
  .summary { font-size: 8pt; color: #1A1A1A; margin-bottom: 6px; line-height: 1.4; }
  .summary b { color: #0A0A0A; }

  /* TWO-COL SKILLS */
  .skills-grid { display: table; width: 100%; margin-bottom: 2px; }
  .skills-row { display: table-row; }
  .skills-header-left, .skills-header-right { display: table-cell; padding: 3px 6px; font-weight: bold; font-size: 7.5pt; text-align: center; }
  .skills-header-left { background: #F5F5F5; color: #0A0A0A; width: 50%; }
  .skills-header-right { background: #0A0A0A; color: white; width: 50%; }
  .skill-left, .skill-right { display: table-cell; padding: 1.5px 6px; font-size: 7.5pt; vertical-align: top; }
  .skill-left { color: #1A1A1A; }
  .skill-right { color: #4A4A4A; font-style: italic; }
  .skill-left::before, .skill-right::before { content: "▪ "; }

  /* EXPERIENCE */
  .job-header { display: flex; justify-content: space-between; align-items: baseline; margin-top: 8px; margin-bottom: 1px; }
  .job-title { font-size: 9pt; font-weight: bold; color: #0A0A0A; }
  .job-date { font-size: 8pt; color: #717171; font-style: italic; }
  .job-company { font-size: 8pt; color: #4A4A4A; font-style: italic; margin-bottom: 3px; }

  .bullet { padding-left: 14px; margin: 1.5px 0; font-size: 7.8pt; line-height: 1.35; position: relative; }
  .bullet::before { content: "▪"; position: absolute; left: 2px; color: #0A0A0A; }
  .bullet b { color: #0A0A0A; }

  /* IMPACT TABLE */
  .impact-table { width: 100%; border-collapse: collapse; margin: 4px 0 6px; }
  .impact-table th { background: #0A0A0A; color: white; font-size: 6.5pt; letter-spacing: 1px; padding: 3px 5px; text-align: left; font-weight: bold; }
  .impact-table td { padding: 2.5px 5px; font-size: 7.5pt; border: none; }
  .impact-table tr:nth-child(even) td { background: #F5F5F5; }
  .impact-table td:first-child { font-weight: bold; color: #0A0A0A; width: 25%; }
  .impact-table td:nth-child(2) { color: #717171; width: 37%; }
  .impact-table td:nth-child(3) { color: #0A0A0A; font-weight: bold; width: 38%; }

  /* TECH TABLE */
  .tech-table { width: 100%; border-collapse: collapse; margin: 4px 0; }
  .tech-table td { padding: 2px 5px; font-size: 7.5pt; }
  .tech-table tr:nth-child(odd) td { background: #F5F5F5; }
  .tech-table td:first-child { font-weight: bold; color: #0A0A0A; width: 22%; }

  /* BOTTOM */
  .two-col-bottom { display: flex; gap: 20px; }
  .two-col-bottom .col { flex: 1; }
  .edu-title { font-weight: bold; font-size: 8pt; color: #0A0A0A; margin-top: 4px; }
  .edu-sub { font-size: 7.5pt; color: #4A4A4A; }

  .footer { text-align: center; border-top: 1px solid #D0D0D0; padding-top: 6px; margin-top: 10px; color: #A0A0A0; font-size: 7.5pt; font-style: italic; }
</style>
</head>
<body>

<div class="header">
  <div class="header-left">
    <div class="name">THIAGO OLIVEIRA LIMA</div>
    <div class="title">WAREHOUSE OFFICE ADMINISTRATOR</div>
    <div class="subtitle">Inventory Management &nbsp;|&nbsp; AI Process Automation</div>
  </div>
  <div class="header-right">
    0432 625 402<br>
    caianthiago@gmail.com<br>
    linkedin.com/in/thiagocaian<br>
    114 Marine Parade, Southport QLD 4215
  </div>
</div>

<div class="content">

  <div class="section-title">Professional Summary</div>
  <div class="summary">
    Organised Warehouse Office Administrator with <b>3+ years of warehouse operations experience</b> (RapidLED, Gold Coast) managing stock control, order processing, data entry, dispatch, and reporting. Unique edge: <b>I built a complete warehouse management system</b> (CYTRON — cytronai.com) with real-time inventory dashboards, QR scanning, automated stock alerts, and AI-powered data entry. I don't just do admin — I make the warehouse office run faster and error-free.
  </div>

  <div class="section-title">What I Bring to Your Warehouse Office</div>
  <div class="skills-grid">
    <div class="skills-row"><div class="skills-header-left">Warehouse Office Essentials</div><div class="skills-header-right">My AI &amp; Automation Edge</div></div>
    <div class="skills-row"><div class="skill-left">Stock receiving, dispatching &amp; tracking</div><div class="skill-right">Real-time inventory dashboard with automated low-stock alerts</div></div>
    <div class="skills-row"><div class="skill-left">Purchase orders &amp; supplier coordination</div><div class="skill-right">AI auto-generates POs when stock hits threshold</div></div>
    <div class="skills-row"><div class="skill-left">Data entry &amp; warehouse records</div><div class="skill-right">AI extracts data from dockets, invoices &amp; forms instantly</div></div>
    <div class="skills-row"><div class="skill-left">Picking, packing &amp; dispatch docs</div><div class="skill-right">QR code scanning for instant lookups &amp; dispatch tracking</div></div>
    <div class="skills-row"><div class="skill-left">WH&amp;S compliance &amp; safety records</div><div class="skill-right">Automated compliance tracking with expiry alerts + PDF reports</div></div>
    <div class="skills-row"><div class="skill-left">Reporting to warehouse manager</div><div class="skill-right">Live dashboards — always accurate, no manual spreadsheets</div></div>
  </div>

  <div class="section-title">Professional Experience</div>

  <div class="job-header"><span class="job-title">Warehouse Operations &amp; Office Administrator</span><span class="job-date">2023 – 2026 (3 years)</span></div>
  <div class="job-company">RapidLED &nbsp;•&nbsp; Gold Coast, QLD</div>
  <div class="bullet"><b>Stock Management:</b> Managed receiving, dispatching, and inventory tracking in a high-volume e-commerce warehouse — accurate stock levels, daily order processing</div>
  <div class="bullet"><b>Data Entry &amp; Records:</b> All warehouse data entry, order processing, supplier correspondence, and operational documentation</div>
  <div class="bullet"><b>Process Improvement:</b> Implemented QR code-based data capture, reducing manual entry errors by 40%; introduced real-time dashboards saving 10+ hours/week</div>
  <div class="bullet"><b>Reporting:</b> Produced inventory reports, stock reconciliation, and operational KPIs for management decision-making</div>

  <div class="job-header"><span class="job-title">Warehouse Systems Developer &amp; Automation Specialist</span><span class="job-date">2026 – Present</span></div>
  <div class="job-company">CYTRON Platform (cytronai.com) &nbsp;•&nbsp; Gold Coast, QLD</div>
  <div class="bullet"><b>Stock Guardian:</b> Built real-time inventory dashboard with QR scanning, automated Telegram + email alerts when stock drops below threshold</div>
  <div class="bullet"><b>AI Automation:</b> Voice-to-data bot (GPT-4 + Whisper) eliminates manual data entry; Claude AI quote generator reduces 45 min → 5 min</div>
  <div class="bullet"><b>Workflow Engine:</b> 20+ n8n automated workflows connecting warehouse ops to email, calendars, messaging, and reporting</div>

  <div class="job-header"><span class="job-title">QA Analyst &amp; Data Quality Specialist</span><span class="job-date">2021 – 2023</span></div>
  <div class="job-company">Stefanini Group @ Sicoob (Financial Sector) &nbsp;•&nbsp; Brazil</div>
  <div class="bullet"><b>Data Accuracy:</b> Tested enterprise systems processing 10,000+ daily transactions — data integrity, compliance, and regulatory standards</div>
  <div class="bullet"><b>Documentation &amp; SQL:</b> Test plans, defect reports, SQL database management, query optimisation, and management reporting</div>

  <div class="section-title">Key Automation Impact</div>
  <table class="impact-table">
    <tr><th>TASK</th><th>BEFORE (MANUAL)</th><th>AFTER (AUTOMATED)</th></tr>
    <tr><td>Stock checks</td><td>Walk floor / check spreadsheet</td><td>Live dashboard + Telegram alert</td></tr>
    <tr><td>Receiving</td><td>Paper docket, manual entry</td><td>QR scan → instant DB update</td></tr>
    <tr><td>Inventory reports</td><td>Hours in Excel every Friday</td><td>Real-time, always accurate</td></tr>
    <tr><td>Quote prep</td><td>45 min, manual calculations</td><td>5 min — Claude AI auto-generates</td></tr>
    <tr><td>Compliance docs</td><td>Paper files, missed renewals</td><td>Auto-alerts 30d before expiry + PDF</td></tr>
    <tr><td>Follow-ups</td><td>Staff forgets, orders go cold</td><td>n8n auto-sends at the right time</td></tr>
  </table>

  <div style="display: flex; gap: 24px;">
    <div style="flex: 1.2;">
      <div class="section-title">Tools &amp; Technologies</div>
      <table class="tech-table">
        <tr><td>Warehouse</td><td>Inventory mgmt, QR/barcode, stock control, dispatch</td></tr>
        <tr><td>Office</td><td>Microsoft 365, Google Workspace, PDF generation</td></tr>
        <tr><td>AI &amp; Automation</td><td>Claude AI, GPT-4, n8n (20+ workflows), Whisper</td></tr>
        <tr><td>Databases</td><td>PostgreSQL, Supabase, Excel/Sheets, Airtable</td></tr>
        <tr><td>Dev &amp; QA</td><td>Next.js, TypeScript, Selenium, Git, Vercel, Jenkins</td></tr>
      </table>
    </div>
    <div style="flex: 0.8;">
      <div class="section-title">Education</div>
      <div class="edu-title">Cybersecurity Bootcamp <span style="font-weight:normal; color:#717171; font-style:italic;">— In Progress</span></div>
      <div class="edu-sub">Lumify Learn • CompTIA A+, Network+, Security+</div>
      <div class="edu-title" style="margin-top:6px;">QA &amp; Programming Certs</div>
      <div class="edu-sub">Java, Python, SQL, Selenium, Jenkins</div>

      <div class="section-title">Additional</div>
      <div class="bullet">Full Australian work rights</div>
      <div class="bullet">Immediate start — part-time, full-time, casual</div>
      <div class="bullet">English + Portuguese (bilingual)</div>
      <div class="bullet">Live demo: cytronai.com</div>
    </div>
  </div>

  <div class="footer">References available upon request</div>

</div>

</body>
</html>`;

  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: '/Users/thiagocaian/projeto-x/cv/Thiago_Oliveira_Lima_Warehouse_CV.pdf',
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });

  await browser.close();
  console.log('PDF created!');
}

generatePDF().catch(console.error);
