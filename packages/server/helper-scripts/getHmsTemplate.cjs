var axios = require("axios");
var jwt = require("jsonwebtoken");
var uuid4 = require("uuid4");
var fs = require("fs")

const app_access_key = "63b2acc4b94ae6b37911f504";
const app_secret =
  "0HAc1fnLzjShQEeHPGslxflOfsorSl03Njhdgmc2YUWZ25SNxiqJCG9eXm12afQzXDk_0mgIJb3EfwM8qcHbxvv2B_3Y6_wScMHoWNvMGa6huwKMvShj_zxxFc_4g3IiY71Zfjr57GEHQwNBesOisdAWQV6wpWOWBoJ6U6XshZ4=";

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