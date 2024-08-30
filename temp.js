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