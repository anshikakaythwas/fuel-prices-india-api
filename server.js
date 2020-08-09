var express = require("express");
var fs = require("fs");
var request = require("request");
var cheerio = require("cheerio");
var app = express();
const http = require("http");
const port = process.env.PORT || 3000;

// use the express-static middleware
app.use(express.static("public"));

// define the first route
app.get("/", function (req, res) {
  res.send(
    "<h1 style='text-align: center;'>Fuel Prices API - India</h1><br/>" +
      "<h2 style='text-align: center;'>Endpoints:</h2><ul style='margin-left: 25%;'>" +
      "<li>Price for a district in a state : /price/[state]/[district]</li>" +
      "<li>Price for all districts in a state : /price/[state]</li>" +
      "<li>List of all states : /states</li>" +
      "<li>List of all districs in a state : /:state/districts</li>" +
      "</ul>"
  );
});

function getDistrict(article) {
  var $ = cheerio.load(article);
  return $("h2.fuel-title-dist", article).contents().first().text().trim();
}
function getProductName(product) {
  var $ = cheerio.load(product);
  return $("h3[itemprop=name]", product).contents().first().text().trim();
}
function getProductPrice(product) {
  var $ = cheerio.load(product);
  return $("span.price_tag", product).contents().first().text().trim();
}
function getProductCurrency(product) {
  var $ = cheerio.load(product);
  return $("i[itemprop=priceCurrency]", product).attr("content");
}
function getPriceChange(product) {
  var $ = cheerio.load(product);
  return $("span.changed-price", product).contents().first().text().trim();
}
function getPriceChangeSign(product) {
  var priceChangeSign;
  var priceChange = getPriceChange(product);
  var $ = cheerio.load(product);
  var increment = $("span.changed-price.increment", product).contents().length;
  if (increment == 0) priceChangeSign = "-";
  else priceChangeSign = "+";

  if (priceChange == "0") priceChangeSign = null;
  return priceChangeSign;
}

app.get("/scrapeMajor", function (req, res) {
  url = "https://www.newsrain.in/petrol-diesel-prices";

  request(url, function (error, response, html) {
    if (!error) {
      var $ = cheerio.load(html);
      var state,
        city,
        productName,
        productPrice,
        productCurrency,
        priceChangeSign,
        priceChange;

      var returnVal = [];

      $("article").each((i, article) => {
        state = $("div.fuel-title", article).contents().first().text().trim();
        city = $("div.fuel-title", article).find("small.center").text().trim();
        fuelcontent = $("div.fuel-content", article);
        products = fuelcontent.find("div[itemprop=product]");
        productsJson = [];
        products.each((i, product) => {
          productName = getProductName(product);
          productPrice = getProductPrice(product);
          productCurrency = getProductCurrency(product);
          priceChange = getPriceChange(product);
          priceChangeSign = getPriceChangeSign(product);

          productsJson.push({
            productName,
            productPrice,
            productCurrency,
            priceChange,
            priceChangeSign,
          });
        });

        returnVal.push({ state, city, products: productsJson });
      });
    }

    fs.writeFile("output.json", JSON.stringify(returnVal, null, 4), function (
      err
    ) {
      console.log(
        "File successfully written! - Check your project directory for the output.json file"
      );
    });

    res.json(returnVal);
  });
});

app.get("/price/:state/:district", function (req, res) {
  url = "https://www.newsrain.in/petrol-diesel-prices/" + req.params.state;

  var distValue = req.params.district.replace("+", " ");
  request(url, function (error, response, html) {
    if (!error) {
      var $ = cheerio.load(html);
      var state,
        city,
        productName,
        productPrice,
        productCurrency,
        priceChangeSign,
        priceChange;

      var returnVal = [];

      $("div.fuel-wrapper").each((i, article) => {
        district = getDistrict(article);
        if (district == distValue) {
          fuelcontent = $("div.fuel-content", article);
          products = fuelcontent.find("div[itemprop=product]");
          productsJson = [];
          products.each((i, product) => {
            productName = getProductName(product);
            productPrice = getProductPrice(product);
            productCurrency = getProductCurrency(product);
            priceChange = getPriceChange(product);
            priceChangeSign = getPriceChangeSign(product);

            productsJson.push({
              productName,
              productPrice,
              productCurrency,
              priceChange,
              priceChangeSign,
            });
          });

          returnVal.push({ district, products: productsJson });
          return;
        }
      });
    }

    fs.writeFile(
      "jsonOutputs/" +
        req.params.state +
        "_" +
        req.params.district +
        "_output.json",
      JSON.stringify(returnVal, null, 4),
      function (err) {
        console.log(
          "File successfully written! - Check your project directory for the output.json file"
        );
      }
    );

    res.json(returnVal);
  });
});

app.get("/price/:state", function (req, res) {
  url = "https://www.newsrain.in/petrol-diesel-prices/" + req.params.state;

  request(url, function (error, response, html) {
    if (!error) {
      var $ = cheerio.load(html);
      var state,
        city,
        productName,
        productPrice,
        productCurrency,
        priceChangeSign,
        priceChange;

      var title, release, rating;
      var json = { state: "", release: "", rating: "" };
      var returnVal = [];
      var districts = [];

      $("article").each((i, article) => {
        district = $("h2.fuel-title-dist", article)
          .contents()
          .first()
          .text()
          .trim();
        // city = $("div.fuel-title", article).find("small.center").text().trim();
        fuelcontent = $("div.fuel-content", article);
        products = fuelcontent.find("div[itemprop=product]");
        productsJson = [];
        products.each((i, product) => {
          productName = getProductName(product);
          productPrice = getProductPrice(product);
          productCurrency = getProductCurrency(product);
          priceChange = getPriceChange(product);
          priceChangeSign = getPriceChangeSign(product);

          productsJson.push({
            productName,
            productPrice,
            productCurrency,
            priceChange,
            priceChangeSign,
          });
        });

        returnVal.push({ district, products: productsJson });
        districts.push(district);
      });
    }

    fs.writeFile(
      "jsonOutputs/" + req.params.state + "_districts.json",
      JSON.stringify(districts, null, 4),
      function (err) {
        console.log("File successfully written!");
      }
    );
    fs.writeFile(
      "jsonOutputs/" + req.params.state + "_output.json",
      JSON.stringify(returnVal, null, 4),
      function (err) {
        console.log("File successfully written!");
      }
    );

    res.json(returnVal);
  });
});

app.get("/:state/districts", function (req, res) {
  url = "https://www.newsrain.in/petrol-diesel-prices/" + req.params.state;

  request(url, function (error, response, html) {
    if (!error) {
      var $ = cheerio.load(html);
      var districts = [];

      $("article").each((i, article) => {
        district = getDistrict(article);

        districts.push(district.split(" ").join("+"));
      });
    }
    res.json(districts);
  });
});

app.get("/states", function (req, res) {
  url = "https://www.newsrain.in/petrol-diesel-prices";

  request(url, function (error, response, html) {
    if (!error) {
      var $ = cheerio.load(html);
      var state;
      var returnVal = [];

      $("a.waves-effect", $("footer.page-footer")).each((i, link) => {
        state = $(link)
          .attr("href")
          .replace("https://www.newsrain.in/petrol-diesel-prices/", "")
          .replace("/petrol-diesel-prices/", "");
        stateName = $(link).contents().last().text();
        returnVal.push(state);
      });
    }
    res.json(returnVal);
  });
});

app.get("/dev/allStates", function (req, res) {
  url = "https://www.newsrain.in/petrol-diesel-prices";

  request(url, function (error, response, html) {
    if (!error) {
      var $ = cheerio.load(html);
      var state;
      var returnVal = [];

      $("a.waves-effect", $("footer.page-footer")).each((i, link) => {
        state = $(link)
          .attr("href")
          .replace("https://www.newsrain.in/petrol-diesel-prices/", "")
          .replace("/petrol-diesel-prices/", "");
        stateName = $(link).contents().last().text();
        returnVal.push(state);
      });
    }

    fs.writeFile(
      "jsonOutputs/" + "statesOnly.json",
      JSON.stringify(returnVal, null, 4),
      function (err) {
        console.log("File successfully written!");
      }
    );

    res.json(returnVal);
  });
});

// start the server listening for requests
app.listen(process.env.PORT || 3000, () => console.log("Server is running..."));
