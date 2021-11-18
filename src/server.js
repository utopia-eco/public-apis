require('dotenv').config()

const express = require('express')
const Web3 = require("web3")
const web3 = new Web3("https://bsc-dataseed.binance.org/");
const app = express()
const cors = require ('cors')
const BigNumber = require('bignumber.js');
const port = process.env.PORT

app.use(cors());
app.options('*', cors())

const UtopiaTokeContract = require("../resources/UtopiaToken.json");

const UtopiaToken = new web3.eth.Contract(
  UtopiaTokeContract.abi,
  UtopiaTokeContract.networks["56"].address
);

app.get('/', (req, res) => {
  res.send('This service provides public apis related to the Utopia token')
})

// Returns tpta; supply
app.route('/totalSupply')
  .get(async (req, res) =>  {
    var totalSupply;
    try {
      await UtopiaToken.methods.totalSupply().call(function (err, result) {
        if (err) {
          console.error("Unable to call total supply function properly", err);
          return;
        }
        console.log("total supply is ", result);
        totalSupply = result;
      });
    } catch (err) {
      console.error("Unable to retrieve total supply", err)
    }
    return res.json(totalSupply);
  });

// Returns circulating supply
app.route('/circulatingSupply')
  .get(async (req, res) =>  {
    var totalSupply;
    var deadAddressBalance;
    var lockedWalletBalance;
    var burnAddressBalance;
    var swapAddressBalance;
    try {
      await UtopiaToken.methods.totalSupply().call(function (err, result) {
        if (err) {
          console.error("Unable to call total supply function properly", err);
          return;
        }
        console.log("total supply is ", result);
        totalSupply = result;
      });
      await UtopiaToken.methods.balanceOf("0x000000000000000000000000000000000000dead").call(function (err, result) {
        if (err) {
          console.error("Unable to call balanceOf function properly", err);
          return;
        }
        console.log("Balance of dead address is ", result);
        deadAddressBalance = result;
      });
      await UtopiaToken.methods.balanceOf("0x81e0ef68e103ee65002d3cf766240ed1c070334d").call(function (err, result) {
        if (err) {
          console.error("Unable to call balanceOf function properly", err);
          return;
        }
        console.log("Balance of locked wallet is ", result);
        lockedWalletBalance = result;
      });
      await UtopiaToken.methods.balanceOf("0x0000000000000000000000000000000000000001").call(function (err, result) {
        if (err) {
          console.error("Unable to call balanceOf function properly", err);
          return;
        }
        console.log("Balance of burn address is ", result);
        burnAddressBalance = result;
      });
      await UtopiaToken.methods.balanceOf("0x45cbef2c8e7b9b36b2e302dce5d4a93f479a278b").call(function (err, result) {
        if (err) {
          console.error("Unable to call balanceOf function properly", err);
          return;
        }
        console.log("Balance of swap address is ", result);
        swapAddressBalance = result;
      });
    } catch (err) {
      console.error("Unable to retrieve token amount", err)
    }

    const circulatingSupply = new BigNumber(totalSupply).minus(new BigNumber(deadAddressBalance)).minus(new BigNumber(lockedWalletBalance)).minus(new BigNumber(swapAddressBalance));
    return res.json(circulatingSupply.toString());
  });

app.get('/health', (req, res) => res.send("Healthy"));

app.listen(port, async () => {
  console.log(`Listening at http://localhost:${port}`)
})