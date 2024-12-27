# About Portainer

Portainer 本身是一個主打輕量化用於管理多個 Docker 環境的 Web-based UI，跟 Docker Desktop 不同的是：Docker Desktop 著重在單機開發環境的便利性，而 Portainer 著重在多種環境, Host 間 Container 的管理、維運、監控便利性。方便團隊可以快速檢視生產環境資源使用狀況並進行運維操作

不過我們只是單純的 standalone docker 就是了，Portainer 最大的用處應該是在於管理 Docker Swarm ,K8s clusters，像他[官方介紹](https://academy.portainer.io/install/#/lessons/7fS0HUcoG8dQgbwarkRcLCArm7f7ZAe_)常用的兩種架構中都會用到 `Portainer Server, Portainer Agent` 用於管理多台 Cluster 上的 Containers

## Portainer 安裝

Portainer 本身在 DockerHub 上是有 image 的，可以直接拉下來建立起一個 Portainer container，不過 Portainer image 有分成 商業版 BE、社群版 CE，每個人只要用 gmail 註冊一個帳號就可以獲得三個 BE node （會拿到一個 license key，容器建好後進到 Web UI 會需要輸入），目前我們就是用 BE！

安裝啟動過程很簡單，官方 [docs](https://docs.portainer.io/start/install) 寫得超清楚～ 

目前我們的 Portainer Web UI: https://pmap.nccucloud.store:9443/

## Portainer 操作相關

**登入**

他也支援 OAuth 登入，但要額外去設定一下，簡單點就大家都用 admin native 登入xd，帳號在 DC `各種帳號` 頻道裡。
- [設定Docs](https://docs.portainer.io/admin/settings/authentication/oauth) 


**SSL相關**
目前是使用 Portainer 預設提供的自簽名 SSL 還沒綁我們的，所以會出現不安全的三角形。
* 這個也是額外設定一下就可以（等API 都做完 xd）


**生產環境容器**

位於 `Stack` 下，可以把 Stack 想成 Docker Compose file。生產環境要用的變數就放在 Environment variables 那個下拉選單下。要用哪些變數是根據我們 `deploys` 這資料夾下的 `docker-compose-prod.yml`。
所以當需要在生產環境新增新的容器時，要注意需要更新哪些 env 進 Stack 中。


## GitOps 流程

1. Build Pipeline 先行在 CI 中完成前後端映像檔的建置與推送到Docker Hub 上。
    a. 根據當前 runner workflow id 作為前後端最新版 Tag 方式
    b. 目前後端的 image 是存在那免費的 private registry，但可能前端就沒辦法了
2. Deploy Pipeline 後續更新 Git repo 中位於 `deploys/` 資料夾下的 docker-compose-prod.yml 內容，用於指定最新映像版本。
3. Portainer 可以從指定的 Git Repo 中拉取 docker-compose.yml 來做到 GitOps 自動化方式，我是設定用 `polling` 的方式每兩分鐘檢查 Git repo 位於 `deploys/` 資料夾下的 docker-compose-prod.yml，一旦偵測到更動，就觸發自動重新佈署容器

我覺得這種 CICD 方式最大的好處是讓生產環境主機更乾淨了連 code 都不需要存在在主機上，但比較不好的點是 Github Action 跑完就不代表已經部署完成 xd
//

之後報告再補上視覺化圖






