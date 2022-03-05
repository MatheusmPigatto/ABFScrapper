const pup =  require('puppeteer');

const baseUrl = `https://franquias.portaldofranchising.com.br/`;
const types = ['franquias-de-alimentacao/', 'franquias-de-casa-e-construcao/', 'franquias-de-comunicacao-informatica-e-eletronicos/', 'franquias-de-entretenimento-e-lazer/', 'franquias-de-hotelaria-e-turismo/', 'franquias-de-limpeza-e-conservacao/', 'franquias-de-moda/', 'franquias-de-saude-beleza-e-bem-estar/', 'franquias-de-servicos-automotivos/', 'franquias-de-servicos-e-outros-negocios/', 'franquias-de-servicos-educacionais/', 'franquias-com-selo-de-excelencia/', 'microfranquias/', 'franquias-quiosque/', 'franquias-home-based/', 'franquias-unidades-moveis/'];

const urls = types.map((type) => baseUrl + type);

(async () => {
    const browser = await pup.launch();
    const page =  await browser.newPage();
    let franchisesUrls = [];

    for(const url of urls) {
        await page.goto(url);

        const pageUrls = await page.$$eval('.card-franchise a', el => el.map(link => link.href));

        franchisesUrls = [...franchisesUrls, ...pageUrls]
    }

    for (const franchisehUrl of franchisesUrls) {
        await page.goto(franchisehUrl);

        const name = await page.$eval('.brand-title', e => e.innerText);
        const info = await page.$$eval('.info-block', e.map(u => u.innerText));
        const unitsNumber = await page.$eval('number-of-units-value', e => e.innerText);
        const averageIncome = await page.$eval('.average-income-value', e => e.innerText);

        console.log(name)
        console.log(unitsNumber)

    }



    await browser.close();
})();

