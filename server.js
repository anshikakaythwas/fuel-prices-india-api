var express = require("express");
var fs = require("fs");
var request = require("request");
var cheerio = require("cheerio");
var app = express();

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

      var title, release, rating;
      var json = { state: "", release: "", rating: "" };
      var returnVal = [];

      $("article").each((i, article) => {
        state = $("div.fuel-title", article).contents().first().text().trim();
        city = $("div.fuel-title", article).find("small.center").text().trim();
        fuelcontent = $("div.fuel-content", article);
        products = fuelcontent.find("div[itemprop=product]");
        productsJson = [];
        products.each((i, product) => {
          productName = $("h3[itemprop=name]", product)
            .contents()
            .first()
            .text()
            .trim();
          productPrice = $("span.price_tag", product)
            .contents()
            .first()
            .text()
            .trim();
          productCurrency = $("i[itemprop=priceCurrency]", product).attr(
            "content"
          );
          priceChange = $("span.changed-price", product)
            .contents()
            .first()
            .text()
            .trim();
          increment = $("span.changed-price.increment", product).contents()
            .length;
          if (increment == 0) priceChangeSign = "-";
          else priceChangeSign = "+";

          if (priceChange == "0") priceChangeSign = null;
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
app.get("/get/:state/:district", function (req, res) {
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

      var returnVal = [];
      var districts = [];

      $("div.fuel-wrapper").each((i, article) => {
        district = $("h2.fuel-title-dist", article)
          .contents()
          .first()
          .text()
          .trim();
        if (district == req.params.district) {
          fuelcontent = $("div.fuel-content", article);
          products = fuelcontent.find("div[itemprop=product]");
          productsJson = [];
          products.each((i, product) => {
            productName = $("h3[itemprop=name]", product)
              .contents()
              .first()
              .text()
              .trim();
            productPrice = $("span.price_tag", product)
              .contents()
              .first()
              .text()
              .trim();
            productCurrency = $("i[itemprop=priceCurrency]", product).attr(
              "content"
            );
            priceChange = $("span.changed-price", product)
              .contents()
              .first()
              .text()
              .trim();
            increment = $("span.changed-price.increment", product).contents()
              .length;
            if (increment == 0) priceChangeSign = "-";
            else priceChangeSign = "+";

            if (priceChange == "0") priceChangeSign = null;
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
      req.params.state + "_" + req.params.district + "_output.json",
      JSON.stringify(districts, null, 4),
      function (err) {
        console.log(
          "File successfully written! - Check your project directory for the output.json file"
        );
      }
    );

    res.json(returnVal);
  });
});
app.get("/get/:state", function (req, res) {
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
          productName = $("h3[itemprop=name]", product)
            .contents()
            .first()
            .text()
            .trim();
          productPrice = $("span.price_tag", product)
            .contents()
            .first()
            .text()
            .trim();
          productCurrency = $("i[itemprop=priceCurrency]", product).attr(
            "content"
          );
          priceChange = $("span.changed-price", product)
            .contents()
            .first()
            .text()
            .trim();
          increment = $("span.changed-price.increment", product).contents()
            .length;
          if (increment == 0) priceChangeSign = "-";
          else priceChangeSign = "+";

          if (priceChange == "0") priceChangeSign = null;
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
      req.params.state + "_districts.json",
      JSON.stringify(districts, null, 4),
      function (err) {
        console.log(
          "File successfully written! - Check your project directory for the output.json file"
        );
      }
    );
    fs.writeFile(
      req.params.state + "_output.json",
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

app.get("/gets/allStates", function (req, res) {
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
      "statesOnly.json",
      JSON.stringify(returnVal, null, 4),
      function (err) {
        console.log(
          "File successfully written! - Check your project directory for the statesOnly.json file"
        );
      }
    );

    res.json(returnVal);
  });
});

app.listen("8081");
console.log("Magic happens on port 8081");
exports = module.exports = app;
