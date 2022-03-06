const { Cluster } = require('puppeteer-cluster');
const pup = require('puppeteer');
const fs = require('fs');

let franchisesUrls = [];

(async () => {
   await (async () => {
        const browser = await pup.launch();
        const page =  await browser.newPage();
    
        await page.goto('https://franquias.portaldofranchising.com.br/')
        const urlList = await page.$$eval('.franchise-filter-mobile-fields option', e => e
        .map((op) => op.value.length > 20 ? op.value : null)
        .filter(val => val !== null));
    
        for(const url of urlList) {
            await page.goto(url);
    
            const pageUrls = await page.$$eval('.card-franchise a', el => el.map(link => link.href));
    
            franchisesUrls = [...franchisesUrls, ...pageUrls]
            console.log(franchisesUrls.length)
        }
        await browser.close();
    })();

  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 35,
    monitor: true,
  });

  let franchiseList = [];

  cluster.on('taskerror', (err, data) => {
    console.log(`Error crawling ${data}: ${err.message}`);
});

  await cluster.task(async ({ page, data: url }) => {
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const nam = await page.evaluate(() => {
        const title = document.querySelector('.brand-title');
        if(!title) return null
        return title.innerText 
    });
    const info = await page.evaluate(() => {
        const inf = document.querySelectorAll('.info-block');
        if(!inf) return null
        return [...inf].map(u => u.innerText)
    });
    const unitsNumber = await page.evaluate(() => {
        const num = document.querySelector('.number-of-units-value');
        if(!num) return null
        return num.innerText 
    });
    const upDate = await page.evaluate(() => {
        const e = document.querySelector('.update-date');
        if(!e) return null
        return e.innerText 
    });

    function applyInfo() {
        franchise.phone = info[0]
        franchise.segment = info[1]
        franchise.primarySeg = info[2]
        franchise.type = info[3]   
    }

    const  franchise = {}
    nam ? franchise.name = nam : franchise.name = ''
    info ? applyInfo() : ''
    unitsNumber ? franchise.unitsNum = unitsNumber : franchise.unitsNum = ''
    upDate ? franchise.updateDate = upDate : franchise.updateDate = ''

    franchiseList = [...franchiseList, franchise]

    fs.writeFile('franchises.json', JSON.stringify(franchiseList, null, 2), err => {
        if(err) throw new Error('somethin went wrong')

        console.log('Done!')
    })
  });

  for(url of franchisesUrls) {
      await cluster.queue(url)
  }

  await cluster.idle();
  await cluster.close();
})();
