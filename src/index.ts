import yaml from 'yaml'
import fs from 'fs'

console.log('Hello, World!')
fs.readFile('./config/config/config.yaml', 'utf-8', (err, data) => {
  console.log(yaml.parse(data))
})

process.stdin.resume() // 保持进程运行
