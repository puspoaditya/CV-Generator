import puppeteer from "puppeteer-core";

export interface PDFData {
  name?: string;
  role?: string;
  summary?: string;
  skills?: string[];
  experience?: Array<{
    title: string;
    company: string;
    period: string;
    description: string[];
  }>;
  [key: string]: any;
}

export const generatePDF = async (data: PDFData): Promise<Buffer> => {
  let executablePath: string | undefined = undefined;
  
  if (process.platform === 'win32') {
    const paths = [
      process.env.LOCALAPPDATA + '\\ms-playwright\\chromium-1208\\chrome-win64\\chrome.exe',
      process.env.USERPROFILE + '\\AppData\\Local\\ms-playwright\\chromium-1208\\chrome-win64\\chrome.exe'
    ];
    for (const p of paths) {
      const fs = require('fs');
      if (fs.existsSync(p)) {
        executablePath = p;
        break;
      }
    }
  }

  console.info("Launching Puppeteer with executablePath:", executablePath || "bundled");

  const browser = await puppeteer.launch({ 
    headless: true,
    executablePath,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox', 
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });

  try {
    const page = await browser.newPage();
    const html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,700&family=Outfit:wght@300;400;700&display=swap" rel="stylesheet">
      <style>
        @page { 
          size: A4; 
          margin: 30px; 
        }
        
        body { 
          margin: 0; 
          padding: 0; 
          background-color: #F1F4F9; 
          font-family: 'Outfit', sans-serif; 
          color: #1a1a1a; 
          line-height: 1.4;
        }
        h1, h2, h3 { font-family: 'Fraunces', serif; }
        
        /* The Secret to per-page rounding in Chromium */
        .glass-card { 
          background: white; 
          border-radius: 20px; 
          border: 1.5px solid rgba(0,0,0,0.1); 
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
          overflow: hidden;
          display: block;
          width: 100%;
          /* Force standard breaking */
          page-break-inside: auto; 
        }
        
        header { 
          padding: 30px 40px; 
          background: #0F172A;
          display: flex; 
          align-items: center; 
          gap: 25px; 
          color: white;
          border-bottom: 2px solid #FDBA74;
        }
        
        .avatar { 
          width: 80px; 
          height: 80px; 
          background: rgba(255,255,255,0.1); 
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 16px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-size: 32px; 
          font-weight: 700; 
          color: #FDBA74;
        }
        
        .name { font-size: 28px; font-weight: 700; margin: 0; letter-spacing: -0.01em; }
        .role { color: #94a3b8; font-weight: 400; font-size: 11px; letter-spacing: 4px; margin: 4px 0 0; text-transform: uppercase; }
        
        .main-content { padding: 30px 40px; }
        section { margin-bottom: 25px; }
        
        .section-title { 
          font-size: 14px; 
          font-weight: 700; 
          color: #0F172A; 
          display: flex; 
          align-items: center; 
          gap: 10px; 
          margin-bottom: 15px; 
          text-transform: uppercase; 
          letter-spacing: 1.5px;
          border-bottom: 1.5px solid #f1f5f9;
          padding-bottom: 6px;
        }
        
        .section-dot { width: 8px; height: 8px; background: #FDBA74; border-radius: 2px; }
        
        .summary { color: #475569; font-size: 13px; font-weight: 300; margin-bottom: 15px; text-align: justify; }
        
        .skills-grid { display: flex; flex-wrap: wrap; gap: 6px; }
        .skill-tag { 
          padding: 4px 10px; 
          background: #f1f5f9; 
          border-radius: 6px; 
          font-size: 10px; 
          font-weight: 700; 
          color: #1e1e1e; 
          text-transform: uppercase;
        }
        
        .exp-item { 
          margin-bottom: 22px; 
          break-inside: avoid;
          page-break-inside: avoid;
        }
        
        .exp-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-start; 
          margin-bottom: 6px;
        }
        
        .exp-title { font-size: 15px; font-weight: 700; margin: 0; color: #1e293b; line-height: 1.2; }
        .exp-company { color: #64748b; font-weight: 400; font-size: 13.5px; margin-top: 1px; }
        .exp-period { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; white-space: nowrap; }
        
        ul { padding-left: 16px; margin: 0; }
        li { font-size: 12px; color: #475569; margin-bottom: 3px; font-weight: 300; }
        
        .footer {
          padding: 15px 40px;
          border-top: 1px solid #f1f5f9;
          text-align: center;
          font-size: 9px;
          color: #cbd5e1;
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <div class="glass-card">
        <header>
          <div class="avatar">${(data.name || 'P')[0]}</div>
          <div>
            <h1 class="name">${data.name || 'KANDIDAT'}</h1>
            <p class="role">${data.role || 'PROFESIONAL'}</p>
          </div>
        </header>

        <div class="main-content">
          <section>
            <div class="section-title"><div class="section-dot"></div> PROFIL PROFESIONAL</div>
            <p class="summary">${data.summary || ''}</p>
            <div class="skills-grid">
              ${(data.skills || []).map(s => `<span class="skill-tag">${s}</span>`).join('')}
            </div>
          </section>

          <section>
            <div class="section-title"><div class="section-dot"></div> PENGALAMAN KERJA</div>
            ${(data.experience || []).map(exp => `
              <div class="exp-item">
                <div class="exp-header">
                  <div>
                    <h3 class="exp-title">${exp.title}</h3>
                    <div class="exp-company">@ ${exp.company}</div>
                  </div>
                  <span class="exp-period">${exp.period}</span>
                </div>
                <ul>
                  ${(exp.description || []).map(d => `<li>${d}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </section>
        </div>
        
        <div class="footer">Dibuat secara AI-Premium dengan CVCraft Workspace</div>
      </div>
    </body>
    </html>
    `;

    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });

    return Buffer.from(pdfBuffer);
  } catch (err: any) {
    console.error("Puppeteer PDF Error:", err);
    throw err;
  } finally {
    if (browser) await browser.close();
  }
};
