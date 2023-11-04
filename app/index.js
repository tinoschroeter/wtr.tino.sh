const Weather = require("@tinoschroeter/weather-js");
const weather = new Weather();

const { makeBadge } = require("badge-maker");
const nocache = require("nocache");

const chalk = require("chalk");

const morgan = require("morgan");
const cache = require("express-memjs-cache");
const express = require("express");
const app = express();

const port = process.env.PORT | 3000;

app.use(nocache());
app.use(morgan("combined"));

app.get("/health", (req, res) => res.send("OK"));
app.use(cache({ cacheMaxAge: 3600 })); // chache for 60 Minutes

const getWeather = (kind) => {
  return (req, res) => {
    const city = req.params.id || "hamburg";
    const search = { search: city, degreeType: "C" };

    weather
      .find(search)
      .then((result) => {
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

        if (kind === "cli") {
          res.set("Content-Type", "text/plain");
          res.set("X-Usage", `curl ${req.hostname}/city`);
          res.set("X-Fork-me", "https://github.com/tinoschroeter/wtr.tino.sh");

          const pipe = chalk.blue("|");

          return res.send(
            chalk.bold(
              `${chalk.blue(city.toUpperCase())}: ${icon[picker]} ${
                data.skytext
              } ${pipe} tmp: ${data.temperature.toString()} C° ${pipe} wind: ${
                data.winddisplay
              } ${pipe} hum: ${data.humidity} %\n`
            )
          );
        }

        if (kind === "button") {
          const svg = makeBadge({
            label: city,
            message: ` ${icon[picker]} ${
              data.skytext
            }  ${data.temperature.toString()} C°`,
            labelColor: "#555",
            color: "blue",
            style: "flat",
          });

          res.setHeader("Content-Type", "image/svg+xml");
          return res.send(svg);
        }
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).send("ups\n", err);
      });
  };
};

app.get("/", getWeather("cli"));
app.get("/:id", getWeather("cli"));
app.get("/button/:id", getWeather("button"));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
