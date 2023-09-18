# sgcc
模拟登录网上国网网站获取电费

# 运行

安装依赖 `国内建议使用淘宝源`
```bash
npm i --registry=https://registry.npmmirror.com
```
配置文件 `config.json`
```json
{
  "user": "用户名",
  "password": "密码",
  "host": "localhost",
  "headless": true
}
```
运行
```bash
node index
```

# 参考项目

- https://github.com/renhai-lab/sgcc_electricity
