# About Portainer

Portainer 本身是一個主打輕量化用於管理多個 Docker 環境的 Web-based UI，跟 Docker Desktop 不同的是：Docker Desktop 著重在單機開發環境的便利性，而 Portainer 著重在多種環境, Host 間 Container 的管理、維運、監控便利性。方便團隊可以快速檢視生產環境資源使用狀況並進行運維操作

不過我們只是單純的 standalone docker 就是了，Portainer 最大的用處應該是在於管理 Docker Swarm ,K8s clusters

## Portainer 安裝

Portainer 本身在 DockerHub 上是有 image 的，可以直接拉下來建立起一個 Portainer container，不過 Portainer image 有分成 商業版 BE、社群版 CE，每個人只要用 gmail 註冊一個帳號就可以獲得三個 BE node （會拿到一個 license key，容器建好後進到 Web UI 會需要輸入），目前我們就是用 BE！

安裝啟動過程很簡單，官方 [docs](https://docs.portainer.io/start/install) 寫得超清楚～ 

目前我們的 Portainer Web UI: 

