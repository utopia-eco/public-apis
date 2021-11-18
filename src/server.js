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
    return res.json(totalSupply / 10 ** 9);
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
        totalSupply = result / (10 ** 9);
        console.log("total supply is ", totalSupply);
      });
      await UtopiaToken.methods.balanceOf("0x000000000000000000000000000000000000dead").call(function (err, result) {
        if (err) {
          console.error("Unable to call balanceOf function properly", err);
          return;
        }
        deadAddressBalance = result / 10 ** 9;
        console.log("Balance of dead address is ", deadAddressBalance);
      });
      await UtopiaToken.methods.balanceOf("0x81e0ef68e103ee65002d3cf766240ed1c070334d").call(function (err, result) {
        if (err) {
          console.error("Unable to call balanceOf function properly", err);
          return;
        }
        lockedWalletBalance = result / 10 ** 9;
        console.log("Balance of locked wallet is ", lockedWalletBalance);
      });
      await UtopiaToken.methods.balanceOf("0x0000000000000000000000000000000000000001").call(function (err, result) {
        if (err) {
          console.error("Unable to call balanceOf function properly", err);
          return;
        }
        burnAddressBalance = result / 10 ** 9;
        console.log("Balance of burn address is ", burnAddressBalance);
      });
      await UtopiaToken.methods.balanceOf("0x45cbef2c8e7b9b36b2e302dce5d4a93f479a278b").call(function (err, result) {
        if (err) {
          console.error("Unable to call balanceOf function properly", err);
          return;
        }
        swapAddressBalance = result / 10 ** 9;
        console.log("Balance of swap address is ", swapAddressBalance);
      });
    } catch (err) {
      console.error("Unable to retrieve token amount", err)
    }

    const circulatingSupply = totalSupply - deadAddressBalance - lockedWalletBalance - burnAddressBalance - swapAddressBalance
    return res.json(circulatingSupply);
  });

app.get('/health', (req, res) => res.send("Healthy"));

app.listen(port, async () => {
  console.log(`Listening at http://localhost:${port}`)
})