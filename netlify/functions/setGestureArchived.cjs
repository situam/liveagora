const Y = require('yjs');
const { YKeyValue } = require('y-utility/y-keyvalue');
const { HocuspocusProvider } = require('@hocuspocus/provider');
const WebSocket = require('ws');

/*
Callback on gesture archived. Sets status: archived and adds link.

Usage: pass options in body (JSON stringified)

{
agora: string
space: string
nodeId: string
link: string
}

*/

export async function handler(event, context) {
  try {
    const options = event.body ? JSON.parse(event.body) : {};
    options.serverUrl = process.env.VITE_HOCUSPOCUS_URL;

    const result = await processOptions(options);
    return {
      statusCode: 200,
      body: JSON.stringify({ result }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}

async function processOptions(options) {
  return new Promise((resolve, reject) => {
    let ydoc = new Y.Doc()
    let provider = new HocuspocusProvider({
      WebSocketPolyfill: WebSocket,
      url: process.env.VITE_HOCUSPOCUS_URL,
      name: options.agora,
      document: ydoc,
      broadcast: false,
      connect: true,
      onSynced: () => {
        let ykv = new YKeyValue(ydoc.getArray(`${options.space}.nodes`))

        let node = ykv.get(options.nodeId)
        if (typeof node == 'undefined') {
          reject(new Error('node undefined!'));
          return;
        }
    
        ykv.set(options.nodeId, {
          ...node,
          data: {
            ...node?.data,
            gesture: {
              ...node?.data?.gesture,
              status: 'archived',
              link: options.link,
            }
          }
        });
        
        console.log('Processing options completed successfully');
        resolve('Success');
      }
    });
  });
}
