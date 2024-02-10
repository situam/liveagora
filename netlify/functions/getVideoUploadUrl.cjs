var axios = require("axios");

const account_id = process.env.CLOUDFLARE_ACCOUNT_ID

exports.handler = async function (event, context) {
  var options = {
    method: 'POST',
    url: `https://api.cloudflare.com/client/v4/accounts/${account_id}/stream/direct_upload`,
    headers: {'Content-Type': 'application/json', 'Upload-Creator': '', 'Authorization': 'Bearer __REDACTED__'},
    data: {
      //allowedOrigins: ['taat.live'],
      creator: 'creator-id_agora_function',

      /* The maximum duration in seconds for a video upload.
         Can be set for a video that is not yet uploaded to limit its duration.
         Uploads that exceed the specified duration will fail during processing.
         A value of -1 means the value is unknown.
         */
      maxDurationSeconds: 600,
      meta: {name: 'video12345.mp4'},
      requireSignedURLs: false,
      //scheduledDeletion: '2014-01-02T02:20:00Z',
      thumbnailTimestampPct: 0.529241,
      //watermark: {uid: 'ea95132c15732412d22c1476fa83f27a'}
    }
  };
  
  try {
    const response = await axios.request(options);
    console.log(response.data);
    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
      headers: {
        "access-control-allow-origin": "*",
      },
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify(error),
      headers: {
        "access-control-allow-origin": "*",
      },
    };
  }
};
