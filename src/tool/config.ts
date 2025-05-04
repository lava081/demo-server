import fs from 'fs'
import yaml from 'yaml'
import { watch, FSWatcher } from 'chokidar'

interface Config {
  server: {
    tcp: {
      port: number
    }
  }
}

type GetNestedValue<T, K extends string> = K extends ''
  ? T
  : K extends `${infer F}.${infer R}`
    ? F extends keyof T
      ? GetNestedValue<T[F], R>
      : undefined
    : K extends keyof T
      ? T[K]
      : undefined

class ConfigManager {
  public config: Config
  private configPath: string
  private defSetPath: string
  private watcher: FSWatcher

  constructor(configPath: string) {
    this.configPath = configPath
    this.defSetPath = configPath.replace('config/config/', 'config/defSet/')
    this.config = this.loadConfig()
    this.watcher = this.startWatching()
  }

  private loadDefaultSet(): Config {
    const yamlContent = fs.readFileSync(this.defSetPath, 'utf-8')
    return yaml.parse(yamlContent) as Config
  }

  private loadConfig(): Config {
    try {
      const yamlContent = fs.readFileSync(this.configPath, 'utf-8')
      const config = yaml.parse(yamlContent) as Config
      const defaultSet = this.loadDefaultSet()
      return { ...defaultSet, ...config } as Config
    } catch (err) {
      console.error('配置文件有误:', err)
      return this.loadDefaultSet() // 返回默认配置
    }
  }

  private startWatching() {
    this.watcher = watch(this.configPath, { persistent: true })
    this.watcher.on('change', () => {
      console.log('配置文件已更改，重新加载...')
      this.config = this.loadConfig()
      this.notifyListeners()
    })
    return this.watcher
  }

  /**
   * 获取配置项
   * @param key 配置项的键，支持点号分隔的路径
   * @returns 配置项的值
   */
  public get<T extends string>(key: T): GetNestedValue<Config, T> {
    const keys = key.split('.')
    if (keys.every((key) => key === ''))
      return this.config as GetNestedValue<Config, T>
    let result: GetNestedValue<Config, T> | Config = this.config

    for (const k of keys as (keyof Config)[]) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k] as GetNestedValue<Config, T>
      } else {
        return undefined as GetNestedValue<Config, T> // 如果路径不存在，返回 undefined
      }
    }

    return result as GetNestedValue<Config, T>
  }

  /**
   * 设置配置项
   * @param key 配置项的键
   * @param value 配置项的值
   * */
  public set<T extends string>(
    key: T,
    value: GetNestedValue<Config, T> | (T extends '' ? Config : never),
  ): void {
    const keys = key.split('.') as (keyof Config | '')[]

    // 处理空路径（设置整个配置）
    if (keys.every((key) => key === '')) {
      if (typeof value !== 'object' || value === null) {
        throw new Error('Invalid value type for root configuration')
      }
      this.config = value as Config
      this.saveConfig()
      this.notifyListeners()
      return
    }

    let obj: Config = this.config
    const lastKeyIndex = keys.length - 1

    // 遍历路径直到倒数第二个键
    for (let i = 0; i < lastKeyIndex; i++) {
      const k = keys[i] as keyof Config
      if (
        typeof obj !== 'object' ||
        obj === null ||
        !(k in obj) ||
        typeof obj[k] !== 'object' ||
        obj[k] === null
      ) {
        throw new Error(`无效的路径: ${key}。中间值不是一个对象。`)
      }
      ;(obj as object) = obj[k]
    }

    // 处理最后一个键
    const lastKey = keys[lastKeyIndex]
    if (!(lastKey in obj)) {
      throw new Error(`无效的路径: ${key}。最后的键不存在。`)
    }

    // 别骂我，我是真的没办法了
    ;(obj[lastKey as keyof Config] as GetNestedValue<Config, T>) = value

    this.saveConfig()
    this.notifyListeners()
  }

  private saveConfig() {
    try {
      const yamlContent = yaml.stringify(this.config)
      fs.writeFileSync(this.configPath, yamlContent)
    } catch (err) {
      console.error('保存配置文件出错:', err)
    }
  }

  private listeners: ((config: Config) => Promise<void>)[] = []

  /**
   * 注册配置变更监听器
   * @param listener 监听器函数，接收当前配置作为参数
   */
  public onConfigChange(listener: (config: Config) => Promise<void>) {
    this.listeners.push(listener)
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => void listener(this.config))
  }
}

const config = new ConfigManager('./config/config/config.yaml')
export default config
