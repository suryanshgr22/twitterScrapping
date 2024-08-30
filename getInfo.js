import https from 'https';

function getInfo(newsitem) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      hostname: 'chatgpt-42.p.rapidapi.com',
      port: null,
      path: '/gpt4',
      headers: {
        'x-rapidapi-key': '0a1a9ce7bemsh5aa3d10a5fa48b1p1cf974jsn0ffe15a85ba8',
        'x-rapidapi-host': 'chatgpt-42.p.rapidapi.com',
        'Content-Type': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      const chunks = [];
    
      res.on('data', (chunk) => {
        chunks.push(chunk);
      });
    
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString();
        
        try {
          const parsedBody = JSON.parse(body);
          resolve(parsedBody);
        } catch (error) {
          reject(new Error('Failed to parse JSON response'));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(JSON.stringify({
      messages: [
        {
          role: 'user',
          content: `Please analyze the following news text and identify if it describes a natural disaster. If it does, return a JSON object with exactly two keys: "disaster" (type of disaster) and "place" (location where it occurred). If the news text is not related to any disaster, return only the string "none" without any additional text. Do not include any extra explanations, formatting, or code blocks in the response. Here is the news text: "${newsitem}"`
        }
      ],
      web_access: false
    }));
    
    req.end();
  });
}

export default getInfo;
