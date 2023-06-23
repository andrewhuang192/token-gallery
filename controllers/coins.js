const Coin = require("../models/coin");
const Portfolio = require("../models/portfolio");

module.exports = {
  index,
  show,
  portfolioCoins,
};

async function index(req, res, next) {
  try {
    const coins = await Coin.getAll();
    // var result = res.json();
    
    console.log(coins)
    Portfolio.find({}, function (err, portfolios) {
      if (err) {
        return next(err);
      }
      
      res.render("coins", { coins, portfolios });
    });
  } catch (err) {
    res.send(
      "Please reload Page. Seems API failed to load and made a boo boo."
    );
  }
}

async function show(req, res, next) {
  try {
    const coin = await Coin.getOne(req.params.name, req.params.fullname);

    res.render("coins/show", { coin });
  } catch (err) {
    res.send(err);
  }
}

async function portfolioCoins(req, res, next) {
  try {
    const coins = await Coin.getMultiple();
    let currentPortfolio = req.body.id;
    Portfolio.find(req.body.id, function (err, portfolio) {
      let coinList = portfolio.coins;
    });
  } catch (err) {
    res.send(err);
  }
}
