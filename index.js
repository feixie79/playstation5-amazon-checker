const axios = require("axios").default;
const cheerio = require("cheerio");
const say = require("say");
const colors = require("colors");
const open = require("open");

const DETECTION_STRING_NOT_AVAILABLE = "Derzeit nicht verfügbar."; //OTHER COUNTRY, NEEDS A CHANGE
const AVAILABLE_MESSAGE = "Auf Lager.";
const BROWSER = "google chrome";
const Interval = 61
const URLs = ["https://www.amazon.de/dp/B08H93ZRK9/", "https://www.amazon.de/dp/B08H98GVK8"]

let loop;

async function main() {
  try {
    // scrap on main run and then by interval
    URLs.forEach(scrapProduct);
    loop = setInterval(() => {
      URLs.forEach(scrapProduct)
    }, Interval * 1000);
  } catch (error) {
    console.log(error);
  }
}

async function scrapProduct(uri) {
  const AVAILABLE_SELECTOR = "#availability > span";
  try {
    const product_page = (
      await axios.get(uri, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.55 Safari/537.36",
        },
      })
    ).data;

    const $ = cheerio.load(product_page);
    const title = $("#productTitle").text().trim();
    const price = $("#priceblock_ourprice").text().trim();
    const availableText = $(AVAILABLE_SELECTOR).text().trim();
    const timestamp = new Date(Date.now())
    console.log(`Checking for ${title} at ${timestamp}`);

    if (availableText === AVAILABLE_MESSAGE) {
      say.speak(title + AVAILABLE_MESSAGE);
      open(uri, { app: BROWSER });
      clearInterval(loop);
    } else if (availableText === DETECTION_STRING_NOT_AVAILABLE) {
      console.log(colors.yellow(availableText));
    }
  } catch (error) {
    console.error(`Error while scraping ${uri}`);
    if (error.response && error.response.data &&
       error.response.data.includes(
        "To discuss automated access to Amazon data please contact"
      )
    ) {
      console.log(colors.red("Amazon is mad"));
    }
    
  } finally {
    console.log(colors.zebra(`------------`));
  }
}

main();
