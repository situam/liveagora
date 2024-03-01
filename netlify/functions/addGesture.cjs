var axios = require("axios");

GITHUB_PAT = process.env.GITHUB_TOKEN

exports.handler = async function (event, context) {
  try {
    const gesture = event.queryStringParameters.gesture
    const imageUrl = event.queryStringParameters.imageUrl

    const parsedGesture = JSON.parse(gesture)
    const data = {
        ref: "next",
        inputs: {
            imageUrl: imageUrl,
            title: parsedGesture.title,
            body: parsedGesture.body || '',
            date: parsedGesture.date,
            contributors: JSON.stringify(parsedGesture.contributors)
        },
    };
    console.log(data)

    const response = await axios.post(
        'https://api.github.com/repos/situam/taat.live/actions/workflows/add-gesture.yml/dispatches',
        JSON.stringify(data), 
        {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `token ${GITHUB_PAT}`,
                'Content-Type': 'application/json',
            }
        }
    );
    console.log(response.data)

    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
      headers: {
        "access-control-allow-origin": "*",
      },
    } 
  } catch (e) {
    console.error(e)
    return {
      statusCode: 400,
      body: JSON.stringify(e),
      headers: {
        "access-control-allow-origin": "*",
      },
    } 
  }
}
