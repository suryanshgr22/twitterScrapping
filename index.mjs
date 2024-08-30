import puppeteer from 'puppeteer';
import getInfo from './gpt.mjs';

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://x.com/i/flow/login', { waitUntil: 'networkidle2' });

    // Log in
    await page.waitForSelector('input[name="text"]');
    await page.type('input[name="text"]', "@vivekraj1802");

    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.waitForSelector('input[name="password"]', { visible: true });
    await page.type('input[name="password"]', "Vivek123@");

    await page.keyboard.press('Enter');

    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    console.log('Login successful');

    // Search for tweets related to natural disasters in India
    const query = encodeURIComponent('natural disaster India');
    await page.goto(`https://x.com/search?f=live&q=india%20%20(disaster%20OR%20flood%20OR%20earthquake%20OR%20tsunami%20OR%20landslide%20OR%20avalanche%20OR%20storm%20OR%20cyclone%20OR%20flashflood)%20-pakistan%20-bangladesh%20-nepal%20-srilanka%20-bhutan%20-USA%20-Africa%20lang%3Aen%20-filter%3Alinks%20-filter%3Areplies&src=typed_query`, { waitUntil: 'networkidle2' });

    // Wait for tweets to load
    await page.waitForSelector('article');

    // Scrape the tweet content and links
    const tweets = await page.evaluate(() => {
        const tweetElements = document.querySelectorAll('article');
        const tweetData = [];

        tweetElements.forEach((tweet) => {
            const tweetContent = tweet.innerText;
            const tweetLink = tweet.querySelector('a[href*="/status/"]').href;

            // Extract the actual tweet text and the link
            const content = tweetContent.split('\n').slice(4, 5).join('').trim();
            const link = tweetLink;

            tweetData.push({
                content: content,
                link: link,
            });
        });

        return tweetData;
    });

    console.log('Tweets:', tweets);

    const results = [];

    // Process only the first 3 tweets
    for (const tweet of tweets.slice(0, 5)) {
        try {
            const analysis = await getInfo(tweet.content);
            // console.log('Analysis:', analysis);

            // Check if the analysis result is an object with the expected properties
            if (analysis && analysis.result) {
                try {
                    const resultObject = JSON.parse(analysis.result);
                    if (resultObject.disaster && resultObject.place) {
                        results.push({
                            tweetLink: tweet.link,
                            disaster: resultObject.disaster,
                            place: resultObject.place,
                        });
                    }
                } catch (error) {
                    console.error('Error parsing analysis result:', error);
                }
            }
        } catch (error) {
            console.error('Error analyzing tweet:', error);
        }
    }

    console.log('Filtered Results:', results);
    const jsonResult = results

    if (Array.isArray(jsonResult)) {
      // Filter and modify the array
      const filteredResult = jsonResult
        .filter(item => item.disaster.toLowerCase() !== "none" && item.place.toLowerCase() !== "none")
        .map(item => {
          // Handle the place field
          let placeParts = item.place.split(" ").map(part => part.trim());

          let firstPlace = placeParts[0];

          // Handle the disaster field
          let disasterParts = item.disaster.split(" ").map(part => part.trim());
          let firstDisaster = disasterParts[0];

          // Update the place and disaster in the object
          return {
            ...item,
            place: firstPlace,
            disaster: firstDisaster
          };
        });

      console.log('Filtered and Modified JSON:', filteredResult);
    }
    

    await browser.close();
})();



