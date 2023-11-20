import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const client = new pg.Client({
  user: 'postgres',
  host: 'localhost',
  database: 'world',
  password: 'Aa123456',
  port: 5432,
});
client.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function checkVisited() {
  const result = await client.query("SELECT country_code FROM visited_countries");
  const rows = result.rows;
  const codes = [];
  rows.forEach((country) => codes.push(country.country_code));

  return codes;
}

app.get("/", async (req, res) => {
  const codes = await checkVisited();

  res.render('index.ejs', {countries: codes, total: codes.length});
});

app.post('/add', async (req, res) => {
  const countryToAdd = req.body["country"];

  console.log(countryToAdd);

  const countryFromDB = await client.query(
    "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%'",
    [countryToAdd,toLowerCase()]);

    if (countryFromDB.rows.length !== 0) {
      const data = countryFromDB.rows[0];
      const countryCode = data.country_code;

      try {
          await client.query(
            "INSERT INTO visited_countries (country_code) VALUES ($1)", 
            [countryCode]
          );

          res.redirect("/");
      } catch (err) {
        const codes = await checkVisited();

        res.render('index.ejs', {
          countries: codes,
          total: codes.length,
          error: "Country has already been added."
        });
      }
    } else {
      const codes = await checkVisited();

      res.render('index.ejs', {
        countries: codes,
        total: codes.length,
        error: "Country name does not exist, try again..."
      });
    }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
