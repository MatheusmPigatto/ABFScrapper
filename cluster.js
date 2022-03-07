const { Cluster } = require('puppeteer-cluster');
const fs = require('fs');

let franchisesUrls = [];

(async () => {
   let segmentUrls = [];
   await (async () => {
        const cluster = await Cluster.launch({
            concurrency: Cluster.CONCURRENCY_CONTEXT,
            maxConcurrency: 2,
            monitor: true,
        });

        cluster.on('taskerror', (err, data) => {
            console.log(`Error crawling ${data}: ${err.message}`);
        });

        await cluster.task(async ({ page, data: url }) => {
            await page.goto(url, { waitUntil: 'domcontentloaded' });

            const urlList = await page.$$eval('.franchise-filter-mobile-fields option', e => e.map((op) => op.value.length > 20 ? op.value : null)
            .filter(val => val !== null));
            segmentUrls = [...segmentUrls, ...urlList]
          });

        await cluster.queue('https://franquias.portaldofranchising.com.br/')

        await cluster.idle();
        await cluster.close();
    })();

   await (async () => {
        const cluster = await Cluster.launch({
            concurrency: Cluster.CONCURRENCY_CONTEXT,
            maxConcurrency: 16,
            monitor: true,
        });
    
        cluster.on('taskerror', (err, data) => {
            console.log(`Error crawling ${data}: ${err.message}`);
        });
    
        await cluster.task(async ({ page, data: url }) => {
            await page.goto(url, { waitUntil: 'domcontentloaded' });
    
            const pageUrls = await page.$$eval('.card-franchise a', el => el.map(link => link.href));
    
            franchisesUrls = [...franchisesUrls, ...pageUrls]
          });
    
          for(url of segmentUrls) {
            await cluster.queue(url)
        }
        
          await cluster.idle();
          await cluster.close();
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
    }

    const  franchise = {}
    nam ? franchise.name = nam : franchise.name = ''
    info ? applyInfo() : ''
    unitsNumber ? franchise.unitsNum = unitsNumber : franchise.unitsNum = ''
    upDate ? franchise.updateDate = upDate : franchise.updateDate = ''

    franchiseList = [...franchiseList, franchise]

    fs.writeFile('ruthFranchise.json', JSON.stringify(franchiseList, null, 2), err => {
        if(err) throw new Error('somethin went wrong')
    })
  });

  for(url of franchisesUrls) {
      await cluster.queue(url)
  }

  await cluster.idle();
  await cluster.close();
})();
