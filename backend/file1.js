const puppeteer = require('puppeteer');

// Read the URL from command line argument
const url = process.argv[2];
const fileName = process.argv[3] || 'output.pdf';


if (!url || !fileName) {
  console.error('❌ Please provide a URL as a command line argument.');
  console.error('Example: node url-to-pdf.js https://example.com');
  process.exit(1);
}

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    console.log(`📄 Opening ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle0' });

   
    await page.pdf({
      path: fileName,
      format: 'A4',
      printBackground: true
    });

    await browser.close();
    console.log(`✅ PDF saved as ${fileName}`);
  } catch (err) {
    console.error('❌ Error generating PDF:', err);
  }
})();

