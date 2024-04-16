var axios = require("axios");

GITHUB_PAT = process.env.GITHUB_TOKEN

exports.handler = async function (event, context) {
  try {
    const agora = event.queryStringParameters.agora
    const space = event.queryStringParameters.space
    const nodeId = event.queryStringParameters.nodeId
    const gesture = event.queryStringParameters.gesture
    const imageUrl = event.queryStringParameters.imageUrl

    const parsedGesture = JSON.parse(gesture)
    const data = {
        ref: "main", // "next",
        inputs: {
            agora,
            space,
            nodeId,
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
    if (response.status != 204) {
            return {
        statusCode: response.status,
        body: JSON.stringify({ error: response.data }),
        headers: {
          "access-control-allow-origin": "*",
        },
      };
    }

    return {
      statusCode: 204,
      headers: {
        "access-control-allow-origin": "*",
      },
    }
  } catch (e) {
    const status = e.response ? e.response.status : 500;
    const message = e.response ? e.response.data : e.message; 
    return {
      statusCode: status,
      body: JSON.stringify({ error: message }),
      headers: {
        "access-control-allow-origin": "*",
      },
    }
  }
}
