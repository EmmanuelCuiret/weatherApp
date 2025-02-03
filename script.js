let weatherChart = null; // Variable pour stocker le graphique

document.getElementById('city-form').addEventListener('submit', async (event) => {
   event.preventDefault(); // Empêche le rechargement de la page
   const city = document.getElementById('city-input').value.trim();
   const tableBodyCity = document.querySelector('#city-table tbody');
   const resultsDiv = document.querySelector('#weather-result tbody');
   const accessKeySplash = 'ZyegSXI1UlYQpsx4NAFA1gqWDTNlrluFF29S1A44Mo4';

   resultsDiv.innerHTML = '';
   tableBodyCity.innerHTML = '';

   const limitedRow = -1 //Nombre de villes maximales affichées

   //Si un graphique existe déjà : le supprimer
   if (weatherChart) {
      weatherChart.destroy();
   }

   const imageContainer = document.getElementById('city-image-container');
   imageContainer.innerHTML = ''; //Efface l'ancienne photo

   //Cacher le div weather-result s'il est visible
   if (document.getElementById('weather-result').classList.contains('visible')) {
      document.getElementById('weather-result').classList.remove('visible');
      document.getElementById('weather-result').classList.add('hidden');
   }

   //Cacher le div chart-container s'il est visible
   if (document.getElementById('chart-container').classList.contains('visible')) {
      document.getElementById('chart-container').classList.remove('visible');
      document.getElementById('chart-container').classList.add('hidden');
   }

   // Rendre visible la section des informations de la ville
   document.getElementById('city-container').classList.remove('hidden');
   document.getElementById('city-container').classList.add('visible');

   try {
      // Appel au serveur proxy
      tableBodyCity.innerHTML = 'Chargement...';

      //const geoResponse = await fetch(`http://localhost:3000/geocoding?name=${city}`);
      const geoResponse = await fetch(`./netlify/functions/geocoding?name=${city}`);

      const geoData = await geoResponse.json();

      if (geoData.results && geoData.results.length > 0) {

         tableBodyCity.innerHTML = '';

         //Limitation du nombre de lignes retournées
         const limitData = geoData.results.slice(0, limitedRow);

         limitData.forEach(location => {
            //Création d'une ligne
            const row = document.createElement('tr');
            //Création des colonnes

            const nameCell = document.createElement('td');
            nameCell.textContent = location.name;
            const cityCell = document.createElement('td');
            cityCell.textContent = location.country;

            const latCell = location.latitude; //La latitude récupérée
            const longCell = location.longitude; //La longitude récupérée

            const latitudeCell = document.createElement('td');
            latitudeCell.textContent = latCell;

            const longitudeCell = document.createElement('td');
            longitudeCell.textContent = longCell;

            //Ajout des éléments dans la ligne
            row.appendChild(nameCell);
            row.appendChild(cityCell);
            row.appendChild(latitudeCell);
            row.appendChild(longitudeCell);

            //Ajout d'un listener pour transmettre la lattitude et la longitude à la 2ème API
            row.addEventListener('click', () => {
               fetchWeatherData(latCell, longCell, location.name, location.country, accessKeySplash);
            })
            row.addEventListener('mouseover', () => {
               row.style.backgroundColor = '#f0f0f0'; // Change la couleur de fond au survol
               row.style.cursor = 'pointer'; // Change le curseur en "main" (pointer)
            });
            row.addEventListener('mouseout', () => {
               row.style.backgroundColor = ''; // Réinitialise la couleur de fond
               row.style.cursor = 'default'; // Retour au curseur par défaut
            });

            //Ajout de la ligne dans le tableau
            tableBodyCity.appendChild(row);
         });

      } else {
         //Cas où aucun résultat n'est retourné
         //Création de la ligne
         const row = document.createElement('tr');
         //Création des colonnes
         const noResultCell = document.createElement('td');
         noResultCell.colSpan = 4;
         noResultCell.textContent = `Aucun résultat trouvé pour ${city}`;
         //Ajout des éléments dans la ligne
         row.appendChild(noResultCell);
         //Ajout de la ligne dans le tableau
         tableBodyCity.innerHTML = '';
         tableBodyCity.appendChild(row);
      }

   } catch (error) {
      console.error(error);
      resultsDiv.innerHTML = `<p class="error">Erreur : Impossible de récupérer les données pour "${city}"</p>`;
   }

});

async function fetchWeatherData(lat, lon, city, country, accessKeySplash) {

   const resultsDiv = document.querySelector('#weather-result tbody');
   resultsDiv.innerHTML = '';

   try {
      //Obtention des données météo
      const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min&timezone=auto`);
      const weatherData = await weatherResponse.json();

      //Si un graphique existe déjà : le supprimer
      if (weatherChart) {
         weatherChart.destroy();
      }

      if (weatherData.daily && weatherData.daily.temperature_2m_max.length > 0) {

         // Mise à jour du texte du h2
         document.getElementById('weather-title').textContent = `Prévisions météorologiques : ${city} (${country})`;

         displayWeatherData(weatherData, city, country, accessKeySplash);

         //Ajout du graphique
         displayWeatherChart(weatherData);
      } else {
         //Cas où aucun résultat n'est retourné
         //Création de la ligne
         const row = document.createElement('tr');
         //Création des colonnes
         const noResultCell = document.createElement('td');
         noResultCell.colSpan = 3;
         noResultCell.textContent = `Aucun résultat trouvé pour ${city}`;
         //Ajout des éléments dans la ligne
         row.appendChild(noResultCell);
         //Ajout de la ligne dans le tableau
         resultsDiv.appendChild(row);
      }


   } catch (error) {
      console.error(error);
      resultsDiv.innerHTML = '<p class="error">Erreur lors de la récupération des données météo.</p>';
   }
};

function displayWeatherData(weatherData, city, country, accessKeySplash) {

   //Charge une image correspondante à la ville sélectionnée
   fetchCityImage(city, country, accessKeySplash);

   // Rendre visible la section des prévisions météo
   document.getElementById('weather-result').classList.remove('hidden');
   //document.getElementById('weather-result').classList.add('visible');

   const resultsDiv = document.querySelector('#weather-result tbody');

   // //Création d'une ligne
   // const row = document.createElement('tr');
   // //Création des colonnes
   // const resultHeader = document.createElement('td');
   // resultHeader.colSpan = 3;
   // resultHeader.textContent = `Résultats trouvés pour ${city}`;
   // //Ajout des éléments dans la ligne
   // row.appendChild(resultHeader);
   // //Ajout de la ligne dans le tableau
   // resultsDiv.appendChild(row);

   weatherData.daily.time.forEach((date, index) => {
      const maxTemp = weatherData.daily.temperature_2m_max[index];
      const minTemp = weatherData.daily.temperature_2m_min[index];

      const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
         weekday: 'long', // Afficher le jour de la semaine (ex : lundi)
         day: 'numeric',  // Afficher le jour (ex : 2)
         month: 'long',    // Afficher le mois en toutes lettres (ex : janvier)
         year: 'numeric'   // Affiche l'année (ex : 2025)
      });

      //Création d'une ligne
      const row = document.createElement('tr');
      //Création des colonnes
      const dateCell = document.createElement('td');
      dateCell.textContent = formattedDate;
      const maxTempCell = document.createElement('td');
      maxTempCell.textContent = `${maxTemp}°C`;
      const minTempCell = document.createElement('td');
      minTempCell.textContent = `${minTemp}°C`;

      //Ajout des éléments dans la ligne
      row.appendChild(dateCell);
      row.appendChild(maxTempCell);
      row.appendChild(minTempCell);

      //Ajout de la ligne dans le tableau
      resultsDiv.appendChild(row);
   });
};

async function fetchCityImage(city, pays, accessKeySplash) {
   const cityModified = `${city} ${pays}`;
   const urlSplash = `https://api.unsplash.com/photos/random?query=${cityModified}&client_id=${accessKeySplash}&orientation=landscape&per_page=1`;

   try {
      const response = await fetch(urlSplash);
      const data = await response.json();

      if (data && data.urls && data.urls.regular) {
         //On récupère la 1ère photo
         const imageUrl = data.urls.regular;
         const imageCaption = data.alt_description;
         displayCityImage(imageUrl, imageCaption || `Photo de ${city}`);
      } else {
         console.warn("Aucune image trouvée pour cette ville et ce pays.");
         displayCityImage(null, null);
      }
   } catch (error) {
      console.error('Erreur lors de la récupération de la photo:', error);
   }
};

function displayCityImage(url, caption) {
   //Création de l'élément qui contient l'image
   const imgElement = document.createElement("img");
   imgElement.src = url;
   imgElement.title = caption;
   imgElement.alt = "Photo de la ville";
   imgElement.style.width = '100%';
   imgElement.style.height = 'auto';

   //Ajout de l'élement à la page
   const imageContainer = document.getElementById('city-image-container');
   imageContainer.innerHTML = ''; //Efface l'ancienne photo
   imageContainer.appendChild(imgElement);
}

//Configuration pour le graphique représentant l'évolution de la température dans le temps
function displayWeatherChart(weatherData) {
   const ctx = document.getElementById("weather-chart").getContext("2d");

   //Si un graphique existe déjà : le supprimer
   if (weatherChart) {
      weatherChart.destroy();
   }

   // Rendre visible la section du graphique
   document.getElementById('chart-container').classList.remove('hidden');
   document.getElementById('chart-container').classList.add('visible');

   const formattedDates = weatherData.daily.time.map(date =>
      new Date(date).toLocaleDateString('fr-FR', {
         weekday: 'short', // Jour abrégé (ex : lun.)
         day: 'numeric',   // Jour (ex : 2)
         month: 'short',   // Mois abrégé (ex : janv.)
      })
   );

   const dates = formattedDates;
   const maxTemps = weatherData.daily.temperature_2m_max;
   const minTemps = weatherData.daily.temperature_2m_min;

   const config = {
      type: 'line',
      data: {
         labels: dates,
         datasets: [
            {
               label: 'T maximales(°C)',
               data: maxTemps,
               borderColor: 'rgba(255,99,132,1)',
               backgroundColor: 'rgba(255,99,132,0.2)',
               borderWidth: 2,
               tension: 0.4
            },
            {
               label: 'T minimales(°C)',
               data: minTemps,
               borderColor: 'rgba(54,162,235,1)',
               backgroundColor: 'rgba(54,162,235,0.2)',
               borderWidth: 2,
               tension: 0.4
            }
         ]
      },
      options: {
         responsive: true,
         plugins: {
            legend: {
               display: true,
               position: 'top'
            }
         },
         scales: {
            x: {
               title: {
                  display: true,
                  text: 'Dates'
               }
            },
            y: {
               title: {
                  display: true,
                  text: 'T(°C)'
               },
               beginAtZero: false
            }
         }
      }
   };

   weatherChart = new Chart(ctx, config);

}

// Sélection du bouton
const scrollToTopButton = document.getElementById('scroll-to-top');

// Afficher/masquer le bouton en fonction du défilement
window.addEventListener('scroll', () => {
   if (window.scrollY > 200) {
      scrollToTopButton.style.display = 'block'; // Afficher le bouton
   } else {
      scrollToTopButton.style.display = 'none'; // Masquer le bouton
   }
});

// Comportement du bouton lors du clic
scrollToTopButton.addEventListener('click', () => {
   window.scrollTo({
      top: 0,
      behavior: 'smooth' // Défilement fluide vers le haut
   });
});

// Met le focus sur l'input au chargement de la page
window.addEventListener('DOMContentLoaded', () => {
   document.getElementById('city-input').focus();
});

//----------------------------------------------------------//
// Gestion de la fenêtre modale contenant la photo agrandie //
//----------------------------------------------------------//

// Sélectionner les éléments nécessaires
const modal = document.getElementById('image-modal');
const modalImage = document.getElementById('modal-image');
const closeBtn = document.getElementsByClassName('close-btn')[0];

// Ouvrir la popup
function openModal(imageSrc) {
   modal.style.display = 'flex';
   modalImage.src = imageSrc; // Mettre l'image dans la popup
}

// Fermer la popup lorsque l'utilisateur clique sur le bouton de fermeture
closeBtn.onclick = function () {
   modal.style.display = 'none';
}

// Fermer la popup si l'utilisateur clique en dehors de la zone de contenu
window.onclick = function (event) {
   if (event.target == modal) {
      modal.style.display = 'none';
   }
}

// Exemple d'ajout d'un événement de clic sur l'image de la ville pour l'agrandir
document.getElementById('city-image-container').addEventListener('click', function () {
   const imageSrc = document.querySelector('#city-image-container img').src; // Récupérer l'URL de l'image
   openModal(imageSrc); // Ouvrir la popup avec l'image
});