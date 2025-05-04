import { createServer, Socket } from 'net'
import config from './config.js'

interface Handler {
  regex: RegExp
  callback: (data: string, socket: Socket) => Promise<boolean>
}

const MsgHandlers: Handler[] = [] // 存储所有注册的处理器

export const activeSockets: Socket[] = [] // 保存所有未被摧毁的 socket

let port = config.get('server.tcp.port') // 获取配置项port的值
export let server = startTcpServer(port) // 启动TCP服务器，端口号从配置中获取

export function registerTcpHandler(
  regex: RegExp,
  callback: Handler['callback'],
) {
  MsgHandlers.push({ regex, callback })
  console.log('注册TCP处理器:', regex.toString())
  return MsgHandlers
}

function startTcpServer(port: number) {
  console.log('tcp服务器监听端口: ', port)
  const server = createServer((socket) => {
    socket.setKeepAlive(true, 60)
    socket.on('data', (data: Buffer) => {
      const message = data.toString('utf-8') // 根据协议选择编码
      void handleMessage(message, socket)
    })
    socket.on('error', (err) => {
      console.error(
        socket.remoteAddress,
        ':',
        socket.remotePort,
        '连接出错:',
        err,
      )
      removeSocket(socket) // 发生错误时销毁 socket
    })
    socket.on('close', () => {
      console.log(socket.remoteAddress, ':', socket.remotePort, ' 已断开')
      removeSocket(socket) // 断开连接时销毁 socket
    })
  })

  server.on('connection', (socket) => {
    console.log(socket.remoteAddress, ':', socket.remotePort, ' 已连接')
    activeSockets.push(socket) // 将新连接的 socket 添加到 activeSockets 中
  })

  server.listen(port)

  return server
}

export function removeSocket(socket: Socket) {
  const index = activeSockets.indexOf(socket)
  if (index !== -1) {
    activeSockets.splice(index, 1) // 从 activeSockets 中移除 socket
  }
  socket.destroy() // 销毁 socket 连接
}

async function handleMessage(message: string, socket: Socket) {
  for (const handler of MsgHandlers) {
    if (handler.regex.test(message)) {
      if (await handler.callback(message, socket)) break
    }
  }
}

// eslint-disable-next-line @typescript-eslint/require-await
config.onConfigChange(async (newConfig) => {
  if (newConfig.server.tcp.port !== port) {
    port = newConfig.server.tcp.port
    server.close(() => {
      server = startTcpServer(port) // 重新启动TCP服务器
    })
  }
})

export default {
  registerTcpHandler,
  activeSockets,
}
