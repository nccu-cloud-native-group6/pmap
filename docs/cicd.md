# About Portainer

AWS CDK 可以用 code 來描述要使用的 AWS 資源，並用 CDK CLI 部署上雲端，是個 Infrastructure as code (IAC) 的 tool
例如可以用 code 寫 lambda 的配置、權限等等，描述完 AWS 資源之後，就能用 CDK CLI 直接包含 lambda 的 code 整包 deploy 上 AWS

## CDK workflow in Pmap

目前 `cloud` folder 是基於 cdk CLI init 產生的 template 而來：

- `cloud/bin/cloud.ts` 描述整個 app，一個 app 可以包含多個 stack，每個 stack 裡可能包含多個 AWS 服務，目前只有一個 stack
- `cloud/lib/cloud-stack.ts` 是目前使用的 stack，一個 cloud 可以新增多個 lambda function 或是其他 AWS 服務

### Lambda 開發步驟

當要建立一個新 lambda 的開發步驟如下，具體可參考 compute-weather.ts：
