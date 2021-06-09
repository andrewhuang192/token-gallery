const request = require("request");
const rootUrl = "https://min-api.cryptocompare.com";
const token = process.env.CRYPTOCOMPARE_TOKEN;
const fetch = require("node-fetch");

module.exports = {
  getAll,
  getOne,
  getMultiple,
  getTotal,
};

/* 
    ================================
    A P I      I N F O R M A T I O N
    ================================

    response will display raw json
    coins will display all data after using .json()
    coins data consists of an object with diff properties in it.
    We want to use coins.Data, as that is where the data is stored.
    coins.Data(ARRAY) returns an array of objects consisting of;
    - CoinInfo(OBJ) which is basic coin info. Relevant fields includes:
        * ID (unique identifier) / Name(ticker) / FullName(name)
    - RAW(OBJ) consists of raw pricing data(OBJs). Noted that these are ints.
        * .USD.PRICE / .USD.CHANGE24HOUR(usd value) / .USD.CHANGEPCT24HOUR(%)
    - DISPLAY(OBJ) consists of pricing data(OBJs) in string form. May cause issues as some have $ in them.
        * .USD.PRICE / .USD.CHANGE24HOUR(usd value) / .USD.CHANGEPCT24HOUR(%)
    */

async function getAll() {
  let response = await fetch(
    `${rootUrl}/data/top/mktcapfull?limit=100&tsym=USD&api_key=${token}`
  );
  let coins = await response.json();
  const coinsData = [];
  coins.Data.forEach((element, idx) => {
    let coinInfo = element.CoinInfo;
    let raw = element.RAW;
    let coinObj;
    if (raw === undefined){
      coinObj = {
        id: coinInfo.Id,
        ticker: coinInfo.Name,
        name: coinInfo.FullName,
        curPrice: 0.00,
        price1PCT: 0.00,
        price24PCT: 0.00,
      };
    } else {
      coinObj = {
        id: coinInfo.Id,
        ticker: coinInfo.Name,
        name: coinInfo.FullName,
        curPrice: raw.USD.PRICE.toFixed(2),
        price1PCT: raw.USD.CHANGEPCTHOUR.toFixed(2),
        price24PCT: raw.USD.CHANGEPCT24HOUR.toFixed(2),
      };
    }
    
    coinsData.push(coinObj);
  });
  return coinsData;
}

async function getOne(name, fullname) {
  let response = await fetch(
    `${rootUrl}/data/pricemultifull?fsyms=${name}&tsyms=USD&api_key=${token}`
  );
  let coin = await response.json();
  let data = coin.RAW[`${name}`].USD;

  let coinData = {
    ticker: data.FROMSYMBOL,
    name: fullname,
    curPrice: data.PRICE.toFixed(2),
    price24Low: data.LOW24HOUR.toFixed(2),
    price24High: data.HIGH24HOUR.toFixed(2),
    supply: data.SUPPLY,
    mcap: data.MKTCAP,
    volume: data.TOTALVOLUME24HTO.toFixed(2),
    changeHour: data.CHANGEHOUR.toFixed(2),
    changeHourPCT: data.CHANGEPCTHOUR.toFixed(2),
    changeDay: data.CHANGEDAY.toFixed(2),
    changeDayPCT: data.CHANGEPCTDAY.toFixed(2),
    lastUpdated: data.LASTUPDATE,
  };
  /* ====== H E L P E R ==========
        FROMSYMBOL: name
        LOW24HOUR: lowest price
        HIGH24HOUR: highest price
        CHANGE24HOUR: change price of 24hours
        CHANGEPCT24HOUR: change price % of 24hours
        CHANGEHOUR: change price hour
        CHANGEPCTHOUR: change price % hour
        PRICE: Current price
        SUPPLY:
        MKTCAP: market cap
        LASTUPDATE: last updated
        // passed in FULLNAME due to this weird API not showing full name in single targetted pings
    */

  // Inject full name from URL due to API foregoing username into this endpoint
  return coinData;
}

async function getMultiple(coinArray) {
  let coinString = coinArray.join(",");
  let response = await fetch(
    `${rootUrl}/data/pricemulti?fsyms=${coinString}&tsyms=USD&api_key=${token}`
  );
  let coinList = await response.json();
  let coinData = {};
  coinArray.forEach((coin) => {
    coinData[coin] = coinList[coin].USD.toFixed(2);
  });
  return coinData;
}

async function getTotal(coinObj) {
  let coinArray = [];
  for (i = 0; i < Object.keys(coinObj).length; i++) {
    coinArray.push(coinObj[i]);
  }
  let coinString = coinArray.join(",");

  let response = await fetch(
    `${rootUrl}/data/pricemulti?fsyms=${coinString}&tsyms=USD&api_key=${token}`
  );
  let coinList = await response.json();
  let coinData = coinObj;
  for (i = 0; i < Object.keys(coinData).length; i++) {
    coinData[i].forEach((coin, idx) => {
      coinData[i][idx] = coinList[coin].USD;
    });
  }

  return coinData;
}
