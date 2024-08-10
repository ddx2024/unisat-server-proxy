const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const Client = require('bitcoin-core');
const https = require('https')
const cors = require('cors');
const client = new Client({
  network: 'regtest',
  port: 18443,
  host: 'ec2-3-15-141-150.us-east-2.compute.amazonaws.com',
  username: '111111',
  password: '111111',
});
const app = express();
app.use(cors());
app.use(express.json());

// 要代理的服务器地址
const target = 'https://wallet-api.unisat.io/v5';

// 创建代理中间件
const proxy = createProxyMiddleware({
  target: target,
  changeOrigin: true,
  headers: {
    Connection: "keep-alive",
  },
  agent: new https.Agent(),
  logLevel: 'debug',
  onError: (err, req, res) => {
    console.error('Proxy Error:', err);
    res.status(500).send('Proxy Error');
  },
});

function convertBtcKvBToSatoshiPerByte(btcPerKvB) {
  const satoshiPerKB = btcPerKvB * 100000000; // 从 BTC/kvB 转换为 satoshi/kB
  const satoshiPerByte = satoshiPerKB / 1000; // 从 satoshi/kB 转换为 satoshi/byte
  return satoshiPerByte;
}


// 特定请求的处理
app.get('/v5/address/balance', (req, res) => {

  const queryParams = req.query;
  const address = queryParams.address;
  const action = "start";
  const scanObjects = [`addr(${address})`]; // 用你要扫描的实际地址替换这里的地址
  client.command('scantxoutset', action, scanObjects).then((response) => {
    res.json({
      "code": 0,
      "msg": "ok",
      "data": {
        "confirm_amount": "0.00000000",
        "pending_amount": "0.00000000",
        "amount": response.total_amount ? response.total_amount : '0.00000000',
        "confirm_btc_amount": "0.00000000",
        "pending_btc_amount": "0.00000000",
        "btc_amount": "0.00000000",
        "confirm_inscription_amount": "0.00000000",
        "pending_inscription_amount": "0.00000000",
        "inscription_amount": "0.00000000",
        "usd_value": "0",
      },
    });
  }).catch((error) => {
    console.error(error);
    res.json({
      "code": -1,
      "msg": error,
    });
  });
});

app.get('/v5/address/btc-utxo', (req, res) => {
  const queryParams = req.query;
  const address = queryParams.address;
  const action = "start";
  const scanObjects = [`addr(${address})`]; // 用你要扫描的实际地址替换这里的地址
  client.command('scantxoutset', action, scanObjects).then((response) => {
    if (response && response.unspents) {
      const data = response.unspents.map(item => {
        return {
          ...item,
          value: Math.round(item.amount * 1e8),
        }
      })
      res.json({
        "code": 0,
        "msg": "ok",
        "data": data,
      });
    }
  }).catch((error) => {
    console.error(error);
    res.json({
      "code": -1,
      "msg": error,
    });
  });
});


app.post('/v5/tx/broadcast', (req, res) => {
  console.log(req.body)
  // Extract the raw transaction from the request body
  const rawTx = req.body.rawtx;

  // Send the raw transaction to the Bitcoin network
  client.sendRawTransaction(rawTx).then(data => {
    console.log('Broadcast data:', data);

    // Respond with the transaction ID or success message
    res.send(data);

    // Optionally, generate a block to confirm the transaction
    client.generateToAddress(10, 'bcrt1qldqsel08fzffxmxswumelqfe0vtcjel276r9mx').then(blockRes => {
      console.log('Block generated:', blockRes);
    }).catch(error => {
      console.error('Error generating block:', error);
    });
  }).catch(error => {
    console.error('Error broadcasting transaction:', error);
    res.json({
      "code": -1,
      "msg": error.message,
    });
  });
});

app.get('/getBTCTipHeight', async (req, res) => {
  const blockchainInfo = await client.getBlockchainInfo();
  return res.text(blockchainInfo.blocks);
})

app.get('/getNetworkFees', async (req, res) => {
  const fees = await client.estimateSmartFee(6);
  const satoshis = convertBtcKvBToSatoshiPerByte(fees.feerate);
  return {
    fastestFee: satoshis || 1000, // Convert appropriately if needed 0.01
    halfHourFee: satoshis,
    hourFee: satoshis,
    economyFee: satoshis,
    minimumFee: satoshis,
  };
})


// 将代理中间件挂载到路由上
app.use('/v5', proxy);
app.use(express.json());

// 启动服务器
app.listen(3009, () => {
  console.log('Proxy server is running on port 3009');
});
