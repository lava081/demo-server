import config from './tool/config.js'

console.log('Hello, World!')
console.log(config.get('server.tcp.port')) // 获取配置项port的值
const defSet = config.get('') // 获取所有配置项，初次启动时为defSet的值
config.set('server.tcp', defSet.server.tcp) // 设置配置项tcp的值为{ port: number; }
