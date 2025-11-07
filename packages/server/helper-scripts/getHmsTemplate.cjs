var axios = require("axios");
var jwt = require("jsonwebtoken");
var uuid4 = require("uuid4");
var fs = require("fs")

const app_access_key = process.env.HMS_APP_ACCESS_KEY;
const app_secret =
  process.env.HMS_APP_SECRET;

function generateHmsManagementToken() {
  var payload = {
    access_key: app_access_key,
    type: "management",
    version: 2,
    iat: Math.floor(Date.now() / 1000),
    nbf: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(payload, app_secret, {
    algorithm: "HS256",
    expiresIn: "24h",
    jwtid: uuid4(),
  });
}

async function getTemplate(template_id='6409ec935ec8ce8ab3c02b78') {
  let res = await axios.get(
    `https://api.100ms.live/v2/templates/${template_id}`,
    {
      headers: {
        authorization:
          `Bearer ${generateHmsManagementToken()}`,
      },
    }
  );

  let data = res.data

  fs.writeFile(`hmsTemplate_${template_id}.json`, JSON.stringify(res.data,null,2), err=>{
    
  })
}

async function main() {
  await getTemplate()
}
main()