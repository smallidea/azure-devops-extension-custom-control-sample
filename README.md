[![GitHub last commit](https://img.shields.io/github/last-commit/smallidea/azure-devops-extension-custom-control-sample?logo=github&logoColor=white)](https://github.com/smallidea/azure-devops-extension-custom-control-sample) 


# Azure DevOps 插件: Field Unique Control

- [一. 概述](#一-概述)
- [二. 快速开始](#二-快速开始)
- [三. 目录结构](#三-目录结构)
- [四. 使用`vss-web-extension-sdk`](#四-使用vss-web-extension-sdk)         
    - [API](#api)
    - [核心代码](#核心代码)
- [五. 用于打包、发布的命令](#五-用于打包发布的命令)


---
## 一. 概述
 验证字段值的唯一性，如果相同类型的工作项使用了该值，将报错，当前工作项不能保存。

 - [如何开发自定义控件](https://www.visualstudio.com/en-us/docs/integrate/extensions/develop/custom-control)

 - [如果使用web技术开发一个插件](https://docs.microsoft.com/en-us/azure/devops/extend/get-started/node?view=azure-devops)

<img src='images/field_unique_1.png' style='border:1px; border-color: #CCC; width: 90%;' />

## 二. 快速开始 

1. 克隆git库，并进入目录

``` shell / cmd / bash
git clone https://github.com/smallidea/azure-devops-extension-custom-control-sample.git

cd azure-devops-extension-custom-control-sample
```
        
3. 运行 `npm install` 安装项目所需要的npm包
4. 运行 `npm run publish`，里面的tfs地址和token需要根据具体项目进行修改
5. 在浏览器中访问你的tfs站点, `http://YourTFSInstance:8080/tfs`.
> 建议使用chrome 70版本以上
6. 手动安装并启用插件
   - 集合设置 > 扩展 > 浏览本地插件 > 管理本地扩展 > 上传扩展 > 浏览本地文件上传插件
   - 点击进入插件详情 > 免费获取 > 选择集合，点击启用
7. 手动更新插件
   - 集合设置 > 扩展 > 浏览本地插件 > 管理本地扩展
   - 找到需要更新的插件，点击名称后的三个点 > 选择更新 > 浏览本地文件上传插件

## 三. 目录结构
```
├── CHANGELOG.md                            更新历史
├── README.md                               
├── details.md                              详细描述
├── images                                  一些公用的图片
├── src                                     源文件
│   ├── common                              公共库
│   │   ├── apiHelper.ts                    通过azure devops的api读取相关信息
│   │   └── errorView.ts                    错误显示界面
│   ├── static                              公用的资源文件
│   │   ├── css
│   │   └── images
│   └── uniqueField                         主文件夹，单独放置的目的是方便一个工程发布多个插件
│       ├── app.ts                          主文件
│       ├── control.ts                      
│       ├── index.html                      入口
│       ├── model.ts                        
│       ├── tsconfig.json                   typescript的配置文件
│       └── view.ts
├── package.json                            包的配置文件，npm包、自定义npm run命令
├── tsconfig.json                           外层放置一个是避免调试的时候报错，因为tsconfig里面申明了vss-web-extension-sdk是一个types
└── vss-extension-uniqueField.json          插件的配置文件

```
> 在bash下面使用tree命令获取目录还不错： tree -L 3 -I '*node_module*|out|dist|package-lock.json|*.png|*.css|license'

## 四. 使用`vss-web-extension-sdk`
使用 Microsoft VSS Web 扩展 SDK 包，[vss-web-extension-sdk](https://github.com/microsoft/vss-web-extension-sdk) 英文全称 Visual Studio Services Web Extension SDK
，此 SDK 包括一个 JavaScript 库，该库提供与嵌入你的扩展插件的页面进行通信所需的 Api。

```typescript
import * as VSSService from "VSS/Service";
import * as WitService from "TFS/WorkItemTracking/Services";
import * as ExtensionContracts from "TFS/WorkItemTracking/ExtensionContracts";
import * as Q from "q";
```

### API
| API                | 函数                   | 用途                                                                     |
| ------------------ | --------------------------- | ------------------------------------------------------------------------- |
| VSSService         | VSS.getConfiguration()      | 可以获取到相应的配置      |
| WitService         | getService()                | 返回一个服务器实例                    |
|                    | getFieldValue()             | 获取当前工作项字段的值值                                    |
|                    | setFieldValue()             | 设置当前工作项字段的值       |
|                    | getAllowedFieldValues()     | 获取字段的允许的值，即在配工作项模版配置时的下拉框中的选项列表                                    |


### 核心代码

- 获取允许的值
```typescript
WitService.WorkItemFormService.getservice().then(
    (service) => {
        service.getAllowedFieldValues(this._fieldName), (allowedValues: string[]) => {
            // do something
        }
    }
)
```

- 使用Q来处理回调, 当有多个回调时，可以使用Q.spread

```typescript
WitService.WorkItemFormService.getService().then(
    (service) => {
        Q.spread<any, any>(
            [service.getAllowedFieldValues(this._fieldName), service.getFieldValue(this._fieldName)],
            (allowedValues: string[], currentValue: (string | number)) => {
                //do something
            }
        )
    }
)
```

- 抛出错误，阻止保存 service.setError； 清除错误 service.clearError。
```typescript
WitService.WorkItemFormService.getService().then(
            (service) => {
                // 验证唯一性
                this._validUniq(this._workItemId, value).then(isValid => {
                    if (isValid == false) {
                        service.setError(`${value} 已经在当前团队项目中被使用，请使用其他！`);
                    } else {
                        service.clearError();
                        service.setFieldValue(this._fieldName, value).then(
                            () => {
                                this._update(value);
                            }, this._handleError);
                    }

                });

            },
            this._handleError
        );
```

- 调用wiql
```typescript
import VSS_Service = require("VSS/Service");
import TFS_Wit_Client = require("TFS/WorkItemTracking/RestClient"); 
import TFS_Wit_Services = require("TFS/WorkItemTracking/Services");
import TFS_Core_WebApi = require("TFS/Core/RestClient");

var witClient = VSS_Service.getCollectionClient(TFS_Wit_Client.WorkItemTrackingHttpClient);
const query = {
            query: `SELECT [System.Id]
                    FROM WorkItemLinks 
                    WHERE ([System.Links.LinkType] = 'System.LinkTypes.Hierarchy-Forward') 
                        AND (Target.[System.TeamProject] = @project 
                        )  mode(Recursive, ReturnMatchingChildren)`
        };
let workItemQueryResult = await witClient.queryByWiql(query, project.name, null);
```

## 五. 用于打包、发布的命令
1. `clean`  删除运行过程中生成的文件
2. `precompiled:uniqueField`    预编译，执行clean、tsc
3. `package:prod:uniqueField`   打包成vsix文件，手动发布到tfs，通常这种比较适合生产环境
4. `publish:test:uniqueField`   直接发布到tfs，通常适用于测试环境