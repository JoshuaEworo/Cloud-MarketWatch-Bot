const Discord = require('discord.js');
const puppeteer = require('puppeteer');

// new instance of our client
const client = new Discord.Client();

//discord command prefix
const prefix = '!';


client.once('ready', async ()=> {

    var testChannel = client.channels.cache.get('775923254782197780'); // gets a specific discord channel
    console.log('MarkyBot is online!');

    let oldLink = await scrapeArticle();
    testChannel.send("MarketWatch just came out with a new article: " + oldLink);

    setInterval(async() => {
        try{
            wait(10000);
            let newLink = await scrapeArticle();
            if (newLink === oldLink){
                console.log('links are the same...');
                return;
            }else if (newLink !== oldLink){

                oldLink = newLink;

                console.log('newLink is ' + newLink);
                testChannel.send("MarketWatch just came out with a new article: " + newLink);

                return;
            }
        } catch(err){
            console.log('Selector error!')
        }
    },25000);

});

//Disord message checker
 client.on('message', async message => {
    if (!message.content.startsWith(prefix) ) return ;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'ping'){
        message.channel.send('F*CKING PONG!');
    } else if (command == 'mw'){
        let mwlink = await scrapeArticle();
        message.channel.send('The latest article is ' + mwlink);
    }

});

//Webscraper function
async function scrapeArticle () {
    const browser = await puppeteer.launch(); //{headless: false}

    const page = await browser.newPage();
    await page.goto('https://www.marketwatch.com/latest-news', {waitUntil: 'domcontentloaded'} );
    
    //searches the page for the latest news part of the DOM 
    const itemValue = await page.waitForSelector('div > div > figure > a[class="figure__image"]').then(() => 
        page.evaluate(() => {
            const itemArray = [];
            const itemNodeList = document.querySelectorAll('div > div > figure > a[class="figure__image"]');

            itemNodeList.forEach(item => {
                const artUrl = item.getAttribute('href'); //get only specifically the href's (links)

                itemArray.push({artUrl}); //pushes all the links into itemArray
            });
            console.log(itemArray[6].artUrl);
            return itemArray[6].artUrl; // returns the artUrl value of the 6th item in the array 
                                        // (which is the article link at the top of the latest news section)
        })
    )
    .catch(() => console.log('Selector error!')); // incase there is an error getting the links it will catch by saying selector error.
    const finalValue = itemValue;

    let pages = await browser.pages();
    await Promise.all(pages.map(page =>page.close()));
    await browser.close();
    
    return finalValue; //returns the link
};

function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while (end < start + ms) {
        end = new Date().getTime();
    }
}


client.login('Nzc1MTE1Mzg4MTU2NTEwMjE4.X6hodQ.y06W3BRNwfno3qTVU1GUzw4Zhyg'); //logs into the bot accoutn essentially


    // var oldLink;

    // setInterval(async() => {
    //     oldLink = await scrapeArticle();
    //     console.log('oldlink scraped...');
    //     delete oldLink;
    // },60000)

    // setInterval(async() => {
    //     let newLink = await scrapeArticle();
    //     if (newLink == oldLink){
    //         console.log('links are the same...');
    //     }else if (newLink == oldLink){
    //         console.log('newLink is' + newLink);
    //         testChannel.send("MarketWatch just came out with a new article: " + newLink);
    //         delete newLink;
    //     }
    // },30000)