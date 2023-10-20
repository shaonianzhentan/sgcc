# sgcc
模拟登录网上国网网站使用手机验证码登录获取电费

# 运行

**注意：需配合家庭助理Android应用才能正常使用**

安装依赖 `国内建议使用淘宝源`
```bash
npm i --registry=https://registry.npmmirror.com
```

后台运行
```bash
node index user=手机号码 host=localhost
```

界面运行
```bash
node index user=手机号码 host=localhost headless=true
```

# 参考项目

- https://github.com/renhai-lab/sgcc_electricity
