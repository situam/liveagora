/*

Generates the default HMS templates for liveagora and uploads to 100ms

Usage:
1. Set required env variables (100MS_APP_ACCESS_KEY and 100MS_APP_SECRET)
2. Run:
  node --env-file=.env ./helper-scripts/generateHmsTemplate3.cjs

*/

var jwt = require("jsonwebtoken");
var uuid4 = require("uuid4");

const app_access_key = process.env['100MS_APP_ACCESS_KEY']
const app_secret = process.env['100MS_APP_SECRET']
if (!app_access_key || !app_secret) {
  console.error("Error: Missing environment variables")
  process.exit(1)
}

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

let role_template = `
  {
    "name": "space05",
    "publishParams": {
      "allowed": ["audio", "video"],
      "audio": { "bitRate": 32, "codec": "opus" },
      "video": {
        "bitRate": 45,
        "codec": "vp8",
        "frameRate": 24,
        "width": 120,
        "height": 120
      },
      "screen": {
        "bitRate": 2000,
        "codec": "vp8",
        "frameRate": 5,
        "width": 1280,
        "height": 720
      },
      "simulcast": { "video": {}, "screen": {} }
    },
    "subscribeParams": {
      "subscribeToRoles": ["space05"],
      "maxSubsBitRate": 1500,
      "subscribeDegradation": {
        "packetLossThreshold": 25,
        "degradeGracePeriodSeconds": 1,
        "recoverGracePeriodSeconds": 4
      }
    },
    "permissions": {
      "changeRole": true,
      "rtmpStreaming": false,
      "hlsStreaming": false,
      "browserRecording": false,
      "sendRoomState": true
    },
    "priority": 4,
    "maxPeerCount": 0
  }
`

let innercircle_publishParams_template = `
{
  "allowed": ["audio", "video", "screen"],
  "audio": { "bitRate": 32, "codec": "opus" },
  "video": {
    "bitRate": 60,
    "codec": "vp8",
    "frameRate": 24,
    "width": 120,
    "height": 120
  },
  "screen": {
    "bitRate": 2000,
    "codec": "vp8",
    "frameRate": 5,
    "width": 1280,
    "height": 720
  },
  "simulcast": { "video": {}, "screen": {} }
}
`

let mutedrole_publishParams_template = `
{
  "allowed": [],
  "audio": {
    "bitRate": 32,
    "codec": "opus"
  },
  "video": {
    "bitRate": 300,
    "codec": "vp8",
    "frameRate": 30,
    "width": 480,
    "height": 360
  },
  "screen": {
    "codec": "vp8",
    "frameRate": 10,
    "width": 1920,
    "height": 1080
  },
  "simulcast": {
    "video": {},
    "screen": {}
  }
}
`

let new_template = 
`{
  "name": "mitbestimmung_werkstatt3",
  "default": true,
  "roles": {},
  "settings": {
    "region": "eu",
    "roomState": {
      "messageInterval": 10,
      "sendPeerList": true,
      "stopRoomStateOnJoin": true,
      "enabled": true
    },
    "retry": {}
  },
  "destinations": {
    "browserRecordings": {},
    "rtmpDestinations": {},
    "hlsDestinations": {}
  }
}`

async function requestCreateTemplate(
  templateObject,
  authToken = generateHmsManagementToken()
) {
  const response = await fetch("https://api.100ms.live/v2/templates", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(templateObject),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`100ms API error ${response.status}: ${text}`);
  }

  return response.json();
}

//////////////////////

function spaceName(space) {
  return `space0${space}`
}

function innerCircleName(space) {
  return `${spaceName(space)}-stage-innercircle`
}

function stageName(space) {
  return `${spaceName(space)}-stage`
}

function subspaceName(space, subspace) {
  return `${spaceName(space)}-subspace${String(subspace).padStart(2,'0')}` //space01-subspace03
}

let numSpaces = 6
let numSubspaces = [50, 10, 10, 10, 10, 10]

async function main() {
  let template = JSON.parse(new_template)

  template.name = "default_liveagora_template"

  for (let i = 0; i < numSpaces; i++)
  {
    // space roles
    let spacerole = JSON.parse(role_template)
    spacerole.name = spaceName(i)
    spacerole.subscribeParams.subscribeToRoles = [
      spacerole.name,
      stageName(i),
      innerCircleName(i)
    ]
    template.roles[spacerole.name] = { ...spacerole }


    let stagerole = JSON.parse(role_template)
    stagerole.priority = 2
    stagerole.name = stageName(i)
    stagerole.subscribeParams.subscribeToRoles = [
      spaceName(i),
      stageName(i),
      innerCircleName(i)
    ]
    template.roles[stagerole.name] = { ...stagerole }
    
    
    let innercirclerole = JSON.parse(role_template)
    innercirclerole.priority = 1
    innercirclerole.name = innerCircleName(i)
    innercirclerole.publishParams = JSON.parse(innercircle_publishParams_template)
    innercirclerole.subscribeParams.subscribeToRoles = [
      spaceName(i),
      stageName(i),
      innerCircleName(i)
    ]
    template.roles[innercirclerole.name] = { ...innercirclerole }



    for (let j = 0; j < numSubspaces[i]; j++)
    {
      // subspace roles
      let subspacerole = JSON.parse(role_template)
      subspacerole.name = subspaceName(i,j)
      
      subspacerole.subscribeParams.subscribeToRoles = [
        subspacerole.name,
        stageName(i),
        innerCircleName(i)
      ]
      template.roles[subspacerole.name] = { ...subspacerole }
    }
  }

  //console.log("Generate template with default", template.default)
  const res = await requestCreateTemplate(template)
  //console.log("100ms says default", res.default)
}

main()


