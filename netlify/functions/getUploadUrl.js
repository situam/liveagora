// https://curlconverter.com/node-axios/ <3

var axios = require("axios");
const FormData = require('form-data');

exports.handler = async function (event, context) {
  try {
    const form = new FormData();
    form.append('requireSignedURLs', 'false');
    form.append('metadata', '{"key":"value"}');

    const response = await axios.post(
      'https://api.cloudflare.com/client/v4/accounts/849f61410dd12413960fdda743b64e1f/images/v2/direct_upload',
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': 'Bearer MpthYO_zW1zpY-cmmowZgEKbKBa3tsh7fmA6USWr'
        }
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
      headers: {
        "access-control-allow-origin": "*",
      },
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify(e),
      headers: {
        "access-control-allow-origin": "*",
      },
    };
  }
};
