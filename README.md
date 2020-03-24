## 自訂初始框架 for nodejs
後端使用ExpressJS以及Apollo GQL。  
前端使用NuxtJS。

## Install
```js
npm i
```

## Run
Rename `/server/config.bak` to `/server/config`.

一般：
```js
node server
```
不啟動NuxtJS：
```js
node server -server
```

## 產生apiDoc
```
npm run apidoc
```
文件會產生在 `./doc` 目錄之下

