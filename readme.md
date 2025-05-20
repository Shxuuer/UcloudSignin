# ucloud signin

北邮云课堂签到作弊脚本

## 部署

### 拉取代码

```
git clone git@github.com:Shxuuer/UcloudSignin.git
cd UcloudSignin
```

### 生成密钥

```
openssl req -nodes -new -x509 -keyout server.key -out server.cert
```

### 运行

```
(sudo) node backend.js
```

## 使用教程

部署后查看`https:{yourip}`

每门课需要一个人用网页扫描课上的二维码，更新课程信息

后续可以通过网页生成本次签到二维码
