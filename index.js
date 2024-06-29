const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// 要代理的服务器地址
const target = 'https://wallet-api.unisat.io/v5';

// 创建代理中间件
const proxy = createProxyMiddleware({
    target: target,
    changeOrigin: true,
});

// 特定请求的处理
app.get('/v5/address/balance', (req, res) => {
    res.json({
        "code": 0,
        "msg": "ok",
        "data": {
            "confirm_amount": "10000.00000000",
            "pending_amount": "0.00000000",
            "amount": "10000.00000000",
            "confirm_btc_amount": "10000.00000000",
            "pending_btc_amount": "10000.00000000",
            "btc_amount": "10000.00000000",
            "confirm_inscription_amount": "10000.00000000",
            "pending_inscription_amount": "10000.00000000",
            "inscription_amount": "10000.00000000",
            "usd_value": "0"
        }
    });
});


app.get('/v5/address/btc-utxo', (req, res) => {
    res.json({
        "code": 0,
        "msg": "ok",
        "data": [
            {
                "txid": "85b70b5e9cb350a2cf933932cfc3cf2814c9555cd835e9ee881a189878e23567",
                "vout": 7,
                "satoshis": 1000000000,
                "scriptPk": "0014059ce0647de86cf966dfa4656a08530eb8f26772",
                "addressType": 1,
                "inscriptions": [],
                "atomicals": [],
                "runes": [],
                "pubkey": "",
                "height": 2864256
            }
        ]
    });
});

// 将代理中间件挂载到路由上
app.use('/v5', proxy);

// 启动服务器
app.listen(3009, () => {
    console.log('Proxy server is running on port 3000');
});
