# 开发环境

开发环境：nodejs v22.15.0

前置条件：[Node.js](https://nodejs.org/zh-cn)  [Git](https://git-scm.com/downloads)  [VSCode](https://vscode.js.cn/)

为vscode安装`推荐的插件`，使用`Prettier`格式化文档

虽然Prettier不会像Linter一样对代码风格提供错误提示，但还是建议在完成代码编写后执行一遍`格式化文档`，`Prettier 应该让你忘记格式 - 而不是当面谈论它！`

## 拉取仓库

```sh
git clone https://github.com/lava081/demo-server
cd demo-server
```

## 安装pnpm（网络不好可以尝试cnpm）

```sh
npm i -g pnpm
set NPM_CONFIG_PACKAGE_MANAGER=pnpm
```

## 安装开发依赖

```sh
pnpm i -D
```

## 调试

源代码在`src/`文件夹

### nodejs v22.6.0+ 

使用`Nodemon`调试器，或者手动运行

```sh 
node --experimental-strip-types src/index.ts
```

### nodejs v22.6.0以下

先编译

再使用`node`调试器，或者手动执行

```sh
node .
```

### node v23+

你可以直接运行.ts

使用`node-ts`调试器，或者手动运行

```sh
node src/index.ts
```

## 编译

使用预设脚本

```
pnpm run build
```

或者

```
tsc
```

编译结果在`lib/`文件夹

# 生产环境

假设你已经顺利得到编译结果

将`config/defSet/`文件夹的内容拷贝到`config/config/`

安装生产依赖，运行index.js

```sh
pnpm i -P
node .
```
