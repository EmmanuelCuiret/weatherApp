//Ce serveur agit comme un intermédiaire pour contourner les restrictions CORS.

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

//Route proxy
app.get('/geocoding', async (req, res) => {
   const cityName = req.query.name; //Récupère le paramètre 'name' dans la requête
   try {
      const response = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${cityName}`);
      res.json(response.data);
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

//Démarrage du serveur
const PORT = 3000;
app.listen(PORT, () => console.log(`Proxy running on http://localhost:${PORT}`));