# azure-devops-extension-custom-control-sample
azure devops 自定义控件的扩展

# 环境
npm install -g typescript
npm install -g tfx-cli
npm install -g rimraf
npm install -g typings

npm init -y

tsc --init

npm install vss-web-extension-sdk --save
typeings install

npm install react-dom --save
npm install antd --save


# 配置

``` typings.json
{
  "globalDependencies": {
    "tfs": "npm:vss-web-extension-sdk/typings/tfs.d.ts",
    "vss": "npm:vss-web-extension-sdk/typings/vss.d.ts"
  }
}
```

添加到package.json文件中
``` package.json
"scripts": {
    "postinstall": "typings install"
}
```

添加排除文件
``` .gitignore
.ionide/
package-lock.json
typings/
**/dist/
dist/
```

# 目录结构
``` tree
│  .gitignore
│  package.json
│  README.md
│  tsconfig.json
│  typings.json
│  vss-extension.json
├─configs
├─img
├─scripts
└─src
    └─customControl
            customControl.tsx
            index.html
            index.tsx

```


# 参考文档
https://docs.microsoft.com/zh-cn/azure/devops/extend/get-started/node?view=azure-devops
https://docs.microsoft.com/zh-cn/azure/devops/extend/develop/custom-control?view=azure-devops