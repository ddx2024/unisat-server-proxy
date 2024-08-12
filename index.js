const express = require('express');
const {createProxyMiddleware} = require('http-proxy-middleware');
const Client = require('bitcoin-core');
const https = require('https')
const cors = require('cors');
const client = new Client({
  network: 'regtest'
  , port: 18443
  , host: 'ec2-3-15-141-150.us-east-2.compute.amazonaws.com'
  , username: '111111'
  , password: '111111'
});
const app = express();
app.use(cors());

// 要代理的服务器地址
const target = 'https://wallet-api.unisat.io/v5';

// 创建代理中间件
const proxy = createProxyMiddleware({
  target: target,
  changeOrigin: true,
  headers: {
    Connection: "keep-alive"
  },
  agent: new https.Agent(),
  logLevel: 'debug',
  onError: (err, req, res) => {
    console.error('Proxy Error:', err);
    res.status(500).send('Proxy Error');
  },
});

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
        "usd_value": "0"
      }
    });
  }).catch((error) => {
    console.error(error);
    res.json({
      "code": -1,
      "msg": error
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
          "txid": item.txid,
          "vout": item.vout,
          "satoshis": Math.round(item.amount * 100000000),
          "scriptPk": item.scriptPubKey,
          "addressType": 1,
          "inscriptions": [],
          "atomicals": [],
          "runes": [],
          "pubkey": "",
          "height": item.height,
          ...item,
          value: Math.round(item.amount * 1e8),
        }
      })
      res.json({
        "code": 0,
        "msg": "ok",
        "data": data
      });
    }
  }).catch((error) => {
    console.error(error);
    res.json({
      "code": -1,
      "msg": error
    });
  });
});


app.post('/v5/tx/broadcast', (req, res) => {
  // 暂存接收到的数据
  let rawData = '';

  // 接收数据片段
  req.on('data', chunk => {
    rawData += chunk;
  });

  // 数据接收完毕
  req.on('end', () => {
    try {
      // 尝试解析 JSON
      const parsedData = JSON.parse(rawData);
      client.sendRawTransaction(parsedData.rawtx).then(data => {
        res.json({
          "code": 0,
          "msg": "ok",
          data,
        });
        client.generateToAddress(10, 'bcrt1qldqsel08fzffxmxswumelqfe0vtcjel276r9mx').then(res => {
          console.log('miner 10 done: ', res)
        })
      }).catch(error => {
        console.error(error)
        res.json({
          "code": -1,
          "msg": error
        });
      })
    } catch (error) {
      console.error(error)
      res.json({
        "code": -1,
        "msg": error
      });
    }
  });

});

app.get('/v5/address/multi-assets', (req, res) => {
  res.json({
    "code": 0,
    "msg": "ok",
    "data": [
      {
        "totalSatoshis": 0,
        "btcSatoshis": 0,
        "assetSatoshis": 0,
        "inscriptionCount": 0,
        "atomicalsCount": 0,
        "brc20Count": 0,
        "brc20Count5Byte": 0,
        "arc20Count": 0,
        "runesCount": 0
      },
      {
        "totalSatoshis": 0,
        "btcSatoshis": 0,
        "assetSatoshis": 0,
        "inscriptionCount": 0,
        "atomicalsCount": 0,
        "brc20Count": 0,
        "brc20Count5Byte": 0,
        "arc20Count": 0,
        "runesCount": 0
      },
      {
        "totalSatoshis": 0,
        "btcSatoshis": 0,
        "assetSatoshis": 0,
        "inscriptionCount": 0,
        "atomicalsCount": 0,
        "brc20Count": 0,
        "brc20Count5Byte": 0,
        "arc20Count": 0,
        "runesCount": 0
      },
      {
        "totalSatoshis": 0,
        "btcSatoshis": 0,
        "assetSatoshis": 0,
        "inscriptionCount": 0,
        "atomicalsCount": 0,
        "brc20Count": 0,
        "brc20Count5Byte": 0,
        "arc20Count": 0,
        "runesCount": 0
      },
      {
        "totalSatoshis": 0,
        "btcSatoshis": 0,
        "assetSatoshis": 0,
        "inscriptionCount": 0,
        "atomicalsCount": 0,
        "brc20Count": 0,
        "brc20Count5Byte": 0,
        "arc20Count": 0,
        "runesCount": 0
      },
      {
        "totalSatoshis": 0,
        "btcSatoshis": 0,
        "assetSatoshis": 0,
        "inscriptionCount": 0,
        "atomicalsCount": 0,
        "brc20Count": 0,
        "brc20Count5Byte": 0,
        "arc20Count": 0,
        "runesCount": 0
      }
    ]
  });
});

app.get('/v5/address/summary', (req, res) => {
  res.json({
    "code": 0,
    "msg": "ok",
    "data": {
      "totalSatoshis": 0,
      "btcSatoshis": 0,
      "assetSatoshis": 0,
      "inscriptionCount": 0,
      "atomicalsCount": 0,
      "brc20Count": 0,
      "brc20Count5Byte": 0,
      "arc20Count": 0,
      "runesCount": 0
    }
  });
});

app.get('/v5/default/fee-summary', (req, res) => {
  res.json({
    "code": 0,
    "msg": "ok",
    "data": {
      "list": [
        {
          "title": "Slow",
          "desc": "About 1 hours",
          "feeRate": 3
        },
        {
          "title": "Avg",
          "desc": "About 30 minutes",
          "feeRate": 3
        },
        {
          "title": "Fast",
          "desc": "About 10 minutes",
          "feeRate": 3
        }
      ]
    }
  });
});

app.get('/regtest/api/getBTCTipHeight', async (req, res) => {
  try {
    const blockchainInfo = await client.getBlockchainInfo();
    res.send(blockchainInfo.blocks.toString()); // Return the block height as plain text
  } catch (error) {
    console.error('Error fetching blockchain info:', error);
    res.status(500).send('Error fetching blockchain info');
  }
});

app.get('/regtest/api/tx/:txid', async (req, res) => {
  const txid = req.params.txid;  // Get the txid from the query parameters

  if (!txid) {
    return res.status(400).send('Txid is required');
  }

  try {
    // Fetch the raw transaction data
    const rawTransaction = await client.getRawTransaction(txid, true);  // The second parameter `true` indicates you want the verbose output
    res.json({
      code: 0,
      msg: "ok",
      data: rawTransaction
    });
  } catch (error) {
    console.error('Error fetching transaction data:', error);
    if (error.message.includes('No such mempool or blockchain transaction')) {
      return res.status(404).send('Transaction not found');
    }
    res.status(500).send('Error fetching transaction data');
  }
});

app.get('/regtest/api/getNetworkFees', async (req, res) => {
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


function convertBtcKvBToSatoshiPerByte(btcPerKvB) {
  const satoshiPerKB = btcPerKvB * 100000000; // 从 BTC/kvB 转换为 satoshi/kB
  const satoshiPerByte = satoshiPerKB / 1000; // 从 satoshi/kB 转换为 satoshi/byte
  return satoshiPerByte;
}

// 将代理中间件挂载到路由上
app.use('/v5', proxy);
app.use(express.json());

// 启动服务器
app.listen(3009, () => {
  console.log('Proxy server is running on port 3009');
});
