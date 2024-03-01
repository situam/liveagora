const fs = require('fs')

let role_template = `
  {
    "name": "space05",
    "publishParams": {
      "allowed": ["audio", "video", "screen"],
      "audio": { "bitRate": 32, "codec": "opus" },
      "video": {
        "bitRate": 60,
        "codec": "vp8",
        "frameRate": 30,
        "width": 120,
        "height": 120
      },
      "screen": {
        "bitRate": 4000,
        "codec": "vp8",
        "frameRate": 5,
        "width": 960,
        "height": 540
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
    "priority": 2,
    "maxPeerCount": 0
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


function generateHmsRequest(template_json, auth_token=process.env.HMS_APP_SECRET) {
  return `curl --location --request POST 'https://api.100ms.live/v2/templates' --header 'Authorization: Bearer ${auth_token}' --header 'Content-Type: application/json' --data-raw '${template_json}'`
}

//////////////////////

function spaceName(space) {
  return `space0${space}`
}

function mutedAudienceName(space) {
  return `${spaceName(space)}-mutedaudience`
}

function stageName(space) {
  return `${spaceName(space)}-stage`
}

function subspaceName(space, subspace) {
  return `${spaceName(space)}-subspace${String(subspace).padStart(2,'0')}` //space01-subspace03
}

let numSpaces = 6
let numSubspaces = 10

function main() {
  let template = JSON.parse(new_template)

  template.name = "mitbestimmung_werkstatt3_prealpha2"

  for (let i = 0; i < numSpaces; i++)
  {
    // space roles
    let spacerole = JSON.parse(role_template)
    spacerole.name = spaceName(i)
    spacerole.subscribeParams.subscribeToRoles = [
      spacerole.name,
      stageName(i)
    ]
    template.roles[spacerole.name] = { ...spacerole }

    let stagerole = JSON.parse(role_template)
    stagerole.priority = 1
    stagerole.name = stageName(i)
    stagerole.subscribeParams.subscribeToRoles = [
      spaceName(i),
      stageName(i)
    ]
    template.roles[stagerole.name] = { ...stagerole }

    let mutedrole = JSON.parse(role_template)
    mutedrole.priority = 3
    mutedrole.name = mutedAudienceName(i)
    mutedrole.subscribeParams.subscribeToRoles = [
      spaceName(i),
      stageName(i)
    ]
    mutedrole.publishParams = JSON.parse(mutedrole_publishParams_template)
    template.roles[mutedrole.name] = { ...mutedrole }


    for (let j = 0; j < numSubspaces; j++)
    {
      // subspace roles
      let subspacerole = JSON.parse(role_template)
      subspacerole.name = subspaceName(i,j)
      
      subspacerole.subscribeParams.subscribeToRoles = [
        subspacerole.name,
        stageName(i)
      ]
      template.roles[subspacerole.name] = { ...subspacerole }
    }
  }

  fs.writeFile(
    './curlRequestHmsTemplate.json',
    generateHmsRequest(JSON.stringify(template /*, null, 2*/)),
    err => {
      if (err) {
        throw err
      }
      console.log('File saved.')
    }
  )
}

main()
// for (let i=0; i<6;i++) {
//   console.log(spaceName(i))
//   for (let j=0; j<10; j++) {
//     console.log(subspaceName(i,j))
//   }
// }

