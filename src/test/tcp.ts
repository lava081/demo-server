import { registerTcpHandler, activeSockets, removeSocket } from '../tool/tcp-server.js'

// eslint-disable-next-line @typescript-eslint/require-await
registerTcpHandler(/.*/, async(message, socket) => {
  console.log(socket.remoteAddress,': ', message)
  activeSockets.forEach((s) => {
    s.write(String(s.remotePort))
    removeSocket(socket)
  })
  return true
})

