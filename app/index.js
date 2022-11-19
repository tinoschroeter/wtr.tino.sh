const weather = require("weather-js");
const chalk = require("chalk");

const morgan = require("morgan");
const cache = require("express-memjs-cache");
const express = require("express");
const app = express();

const port = process.env.PORT | 3000;

app.use(morgan("combined"));

app.get("/health", (req, res) => res.send("OK"));
app.use(cache({ cacheMaxAge: 600 })); // chache for 10 Minutes

const getWeather = (req, res) => {
  const city = req.params.id || "hamburg";
  const search = { search: city, degreeType: "C" };

  weather.find(search, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("ups", err);
    }

    if (result.length === 0)
      return res.status(400).send(`No results found for ${city}!!\n`);

    const data = result[0]?.current;
    const date = new Date();

    let picker = 0;
    const icon = ["", "☁️ ", "❄️ ", "☀️ ", "🌧️  ", "🌩️  ", "🌜"];

    if (data.skytext.match(/[cC]loudy/g)) picker = 1;
    if (data.skytext.match(/[iI]cy/g)) picker = 2;
    if (data.skytext.match(/[sS]now/g)) picker = 2;
    if (data.skytext.match(/[sS]un/g)) picker = 3;
    if (data.skytext.match(/[rR]ain/g)) picker = 4;
    if (data.skytext.match(/[tT]hunder/g)) picker = 5;
    if (picker === 0 && (date.getHours() > 20 || date.getHours() < 7))
      picker = 6;

    res.setHeader("Content-Type", "plain/txt");
    res.set("X-Usage", `curl ${req.hostname}/city`);
    res.send(
      chalk.bold(
        `${city.toUpperCase()}: ${icon[picker]} ${
          data.skytext
        } | ${data.temperature.toString()} C°\n`
      )
    );
  });
};

app.get("/", getWeather);
app.get("/:id", getWeather);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
