import { Server } from '@hocuspocus/server'
import { SQLite } from '@hocuspocus/extension-sqlite'
import { Logger } from '@hocuspocus/extension-logger'

const server = Server.configure({
  port: 3001,
  extensions: [
    new SQLite({
      database: 'db.sqlite',
    }),
    new Logger(),
  ],
  async beforeHandleMessage(data) {
    //console.log("beforeHandleMessage, connection.readOnly:", data.connection.readOnly)
  },
  async onConnect({connection}) {
    console.log("[onConnect] connection", connection)
  },
  async connected(data) {
    console.log('connected. connections:', server.getConnectionsCount())
  },
  async onAuthenticate(data) {
    const { token, documentName, connection } = data
    console.log(`[onAuthenticate] documentName: ${documentName}, token: ${token}`)

    // Make connections read only by default
    connection.readOnly = true

    /*
    // TODO: check token and throw to block read access
    if (token!="read-access-token"){
      throw("unauthorised")
    }
    */ 

    /*return {
      user: { id: 1234, name: "john" }
    }*/
  },
  async onStateless({ payload, documentName, connection }) {
    console.log(`onStateless "${payload}"`)

    try {
      const body = JSON.parse(payload)
      if (body.type === "requestEditAccess") {
        const hasAccess = body.password === "example-password"
    
        if (hasAccess) {
          connection.readOnly = false;
        }

        const response = JSON.stringify({
          id: body.id,
          success: hasAccess,
        });
    
        connection.sendStateless(response);
      }
    } catch (e) {
      console.error("onStateless error", payload, e)
    }
  },
})

server.listen()