const Differencify = require('differencify');
const differencify = new Differencify({ mismatchThreshold: 0 });
let urlToTest = 'http://127.0.0.1:8080/';

describe('Plik index.html', () => {
  const timeout = 30000;
  let page;

  beforeAll(async () => {
    await differencify.launchBrowser({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const target = differencify.init({ chain: false });
    page = await target.newPage();
    await page.goto(urlToTest);
    await page.waitFor(1000);
  }, timeout);
  afterAll(async () => {
    await differencify.cleanup();
  });

  it('powinien zawierać dwa tagi <script>', async () => {
    const scripts = await page.$$eval('script', scripts => scripts.length);
    expect(scripts).toBe(3); // 3 because the extra one is from the puppeteer environment
  }, timeout);

  it('powinien zawierać pierwszy tag <script> na końcu sekcji <head>', async () => {
    const script = await page.$$eval('head script:last-of-type', script => script.length);
    expect(script).toBe(1);
  }, timeout);

  it('powinien zawierać drugi tag <script> na końcu sekcji <body> z identyfikatorem "test-script" i źródłem ustawionym na index.js', async () => {
    const source = await page.$eval('#test-script', script => script.src);
    expect(source.endsWith('index.js')).toBe(true);
  }, timeout);
});
