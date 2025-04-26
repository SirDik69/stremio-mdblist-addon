const { addonBuilder } = require("stremio-addon-sdk");
const fetch = require("node-fetch");
const express = require("express");

const MDBLIST_JSON_URL = "https://mdblist.com/lists/turcudinho/series.json";

const manifest = {
  id: "org.turcudinho.mdblist.series",
  version: "1.0.0",
  name: "Series de Turcudinho",
  description: "Catálogo dinámico basado en MDBList",
  types: ["series"],
  catalogs: [
    {
      type: "series",
      id: "turcudinho-series",
      name: "Series MDBList"
    }
  ],
  resources: ["catalog"]
};

const builder = new addonBuilder(manifest);

async function getCatalog() {
  const response = await fetch(MDBLIST_JSON_URL);
  const data = await response.json();

  const metas = data.items.map(item => ({
    id: item.imdb_id ? `tt${item.imdb_id}` : item.tmdb_id ? `tmdb:${item.tmdb_id}` : item.title,
    name: item.title,
    type: "series",
    poster: item.poster,
    posterShape: "poster",
    description: item.overview
  }));

  return metas;
}

builder.defineCatalogHandler(async ({ id, type }) => {
  if (id === "turcudinho-series" && type === "series") {
    const metas = await getCatalog();
    return { metas };
  }
  return { metas: [] };
});

// === ESTA PARTE ES OBLIGATORIA EN RENDER ===
const app = express();
app.use((req, res) => {
  builder.getInterface().requestHandler(req, res);
});
const port = process.env.PORT || 7000;
app.listen(port, () => {
  console.log(`Addon corriendo en http://localhost:${port}`);
});
