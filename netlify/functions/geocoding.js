const axios = require('axios');

exports.handler = async (event) => {
   const cityName = event.queryStringParameters.name;
   try {
      const response = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${cityName}`);
      return {
         statusCode: 200,
         body: JSON.stringify(response.data),
      };
   } catch (error) {
      return {
         statusCode: 500,
         body: JSON.stringify({ error: error.message }),
      };
   }
};
