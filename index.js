const express = require('express');
const {createProxyMiddleware} = require('http-proxy-middleware');
const Client = require('bitcoin-core');
const client = new Client({network: 'regtest', port: 18443, username: '111111', password: '111111'});
const app = express();
app.use(express.json());

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
                "txid": "f9f557e8b78f41c05b26adc2ff4a6b1709c8e35d15ff4c6726f4856855db47be",
                "vout": 1,
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


app.post('/v5/tx/decode2', (req, res) => {
    res.json({
        "code": 0,
        "msg": "ok",
        "data": {
            "inputInfos": [
                {
                    "txid": "f9f557e8b78f41c05b26adc2ff4a6b1709c8e35d15ff4c6726f4856855db47be",
                    "vout": 1,
                    "address": "bcrt1qqkwwqeraapk0jekl53jk5zznp6u0yemjlkemds",
                    "value": 1000000000,
                    "inscriptions": [],
                    "atomicals": [],
                    "runes": [],
                    "onchain": false,
                    "utxoStatus": {
                        "utxoFound": false,
                        "atomicalsChecked": false,
                        "inscriptionDoubleChecked": false,
                        "isConfirmed": false,
                        "runesChecked": false,
                        "indexerChecked": true
                    },
                    "height": 0
                }
            ],
            "outputInfos": [
                {
                    "address": "bc1qldqsel08fzffxmxswumelqfe0vtcjel2k4pmhu",
                    "value": 100000000,
                    "inscriptions": [],
                    "atomicals": [],
                    "runes": [],
                    "isOpReturn": false
                },
                {
                    "address": "bc1qqkwwqeraapk0jekl53jk5zznp6u0yemjhem9p2",
                    "value": 899999859,
                    "inscriptions": [],
                    "atomicals": [],
                    "runes": [],
                    "isOpReturn": false
                }
            ],
            "feeRate": "1.0",
            "fee": 141,
            "isCompleted": true,
            "risks": [],
            "features": {
                "rbf": false
            },
            "inscriptions": {},
            "recommendedFeeRate": 9,
            "shouldWarnFeeRate": true
        }
    });
});

app.post('/v5/tx/broadcast', (req, res) => {



    client.sendRawTransaction(req.body.rawtx).then(res => console.log(res))

    res.json({
        "code": 0,
        "msg": "ok"
    });
});


// 将代理中间件挂载到路由上
app.use('/v5', proxy);

// 启动服务器
app.listen(3009, () => {
    console.log('Proxy server is running on port 3000');
});
