const meteo = document.getElementById("meteo_container");
const vent = document.getElementById("wind");
const conditions = document.getElementById("conditions_meteo");
const temp = document.getElementById("temperature");

function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString();
}

console.log(getCurrentTime());

// Liste des villes avec leurs coordonnées
const cities = [
  { name: "Nantes", lat: 47.2173, lon: -1.5534 },
  { name: "Angers", lat: 47.4698, lon: -0.5593 },
  { name: "Ancenis", lat: 47.3667, lon: -1.1767 },
  { name: "Saint-Nazaire", lat: 47.2733, lon: -2.22 },
  { name: "Challans", lat: 46.85, lon: -1.8833 },
  { name: "La Roche-sur-Yon", lat: 46.6667, lon: -1.4333 },
  { name: "Montaigu", lat: 46.9733, lon: -1.3167 },
  { name: "Pontchâteau", lat: 47.435, lon: -2.089 },
  { name: "Blain", lat: 47.476, lon: -1.762 },
  { name: "Château Gontier", lat: 47.833, lon: -0.7 },
  { name: "Ernée", lat: 48.297, lon: -0.936 },
  { name: "Mayenne", lat: 48.3, lon: -0.6167 },
  { name: "Le Mans", lat: 48, lon: 0.2 },
  { name: "La Flèche", lat: 47.7, lon: -0.0833 },
  { name: "Doué-la-Fontaine", lat: 47.19, lon: -0.28 },
  { name: "Trelazé", lat: 47.45, lon: -0.4667 },
  { name: "Les Sables-d'Olonne", lat: 46.5029, lon: -1.785493 },
  { name: "La Tranche-sur-mer", lat: 46.343, lon: -1.4391 },
  { name: "La Ferté-Bernard", lat: 48.188, lon: 0.647 }
];

// Initialisation de la carte centrée sur la région des Pays de la Loire
const map = L.map("map").setView([47.5, -0.8], 8);

// Ajouter le fond de carte OpenStreetMap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// Fonction pour récupérer et afficher la météo des villes
async function getWeatherForCities(cities) {
  try {
    for (const city of cities) {
      const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
      }

      const data = await response.json();

      // Mapping des codes météo vers des descriptions compréhensibles
      const weatherDescriptions = {
        0: "Ciel dégagé",
        1: "Principalement dégagé",
        2: "Partiellement nuageux",
        3: "Couvert",
        45: "Brouillard",
        48: "Brouillard givrant",
        51: "Bruine légère",
        53: "Bruine modérée",
        55: "Bruine forte",
        61: "Pluie faible",
        63: "Pluie modérée",
        65: "Pluie forte",
        71: "Neige faible",
        73: "Neige modérée",
        75: "Neige forte",
        80: "Averses légères",
        81: "Averses modérées",
        82: "Averses fortes",
        95: "Orages",
        96: "Orages avec grêle légère",
        99: "Orages avec grêle forte",
      };

      const temperature = data.current_weather.temperature;
      const windSpeed = data.current_weather.windspeed;
      const weatherCondition =
        weatherDescriptions[data.current_weather.weathercode] || "Inconnu";

      // Ajouter un marqueur avec une popup météo pour chaque ville
      L.marker([city.lat, city.lon])
        .addTo(map)
        .bindPopup(
          `
                    <b>${city.name}</b><br>
                    🌡 Température: ${temperature} °C<br>
                    💨 Vent: ${windSpeed} km/h<br>
                    ☁️ Conditions: ${weatherCondition}
                `
        )
        .openPopup(); // Optionnel : affiche directement la popup au chargement

      // Mettre à jour le conteneur HTML pour afficher les données de la dernière ville
      const meteoContainer = document.getElementById("meteo_container");
      if (meteoContainer) {
        meteoContainer.innerHTML += `
                    <h3>${city.name}</h3>
                    <p>🌡 Température: ${temperature} °C</p>
                    <p>💨 Vent: ${windSpeed} km/h</p>
                    <p>☁️ Conditions: ${weatherCondition}</p>
                    <hr>
                `;
      }
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des données météo :", error);
    alert("Impossible de récupérer la météo. Vérifiez votre connexion.");
  }
}

// Appel de la fonction pour récupérer la météo de toutes les villes
getWeatherForCities(cities);

// Ajuster la taille de la carte lors du redimensionnement de la fenêtre
window.addEventListener("resize", () => {
  map.invalidateSize();
});

const ville = [
  { name: "Saint-Nazaire", lat: 47.27, lng: -2.2 },
  { name: "Les Sables-d'Olonne", lat: 46.5, lng: -1.78 },
  // { name: "Pornic", lat: 47.11, lng: -2.1 },
];

const affichageMarees = document.querySelector("#Marees");

async function fetchTideExtremes() {
  const tideData = {};

  if (isDataFresh()) {
    console.log("Données déjà en cache");
    const storedData = JSON.parse(localStorage.getItem("tideData"));
    console.log("Données en cache:", storedData); // Debug
    displayTideData(storedData);
    return;
  }

  const now = new Date();
  const start = now.toISOString().split(".")[0] + "Z";
  const end =
    new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split(".")[0] + "Z";

  for (const city of ville) {
    const url = `https://api.stormglass.io/v2/tide/extremes/point?lat=${
      city.lat
    }&lng=${city.lng}&start=${encodeURIComponent(
      start
    )}&end=${encodeURIComponent(end)}`;
    console.log(`Requête pour ${city.name}: ${url}`);

    const response = await fetch(url, {
      headers: {
        Authorization:
          "be092528-03fa-11f0-b8ac-0242ac130003-be0925aa-03fa-11f0-b8ac-0242ac130003",
      },
    });

    if (!response.ok) {
      console.error(
        `Erreur HTTP pour ${city.name}: ${response.status} ${response.statusText}`
      );
      const errorData = await response.json();
      console.error("Détails de l'erreur:", errorData);
      continue;
    }

    const jsonData = await response.json();
    if (!jsonData.data) {
      console.error(
        `Pas de 'data' dans la réponse pour ${city.name}:`,
        jsonData
      );
      continue;
    }

    tideData[city.name] = jsonData.data.map((event) => ({
      time: event.time,
      height: event.height,
      type: event.type,
    }));
  }

  localStorage.setItem("tideData", JSON.stringify(tideData));
  localStorage.setItem("lastUpdate", Date.now().toString());
  displayTideData(tideData);
}

function isDataFresh() {
  const lastUpdate = localStorage.getItem("lastUpdate");
  if (!lastUpdate) return false;
  const now = Date.now();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  return now - parseInt(lastUpdate) < oneWeek;
}

function displayTideData(data) {
  console.log("Données à afficher:", data); // Debug
  affichageMarees.textContent = "";

  if (isDataFresh()) {
    affichageMarees.textContent += "Données déjà en cache\n\n";
  }

  Object.keys(data).forEach((city) => {
    affichageMarees.textContent += `${city}:\n`;
    data[city].forEach((event) => {
      const date = new Date(event.time);
      const heightRounded = event.height.toFixed(2); // Erreur ici si height est undefined
      affichageMarees.textContent += `Heure: ${date.toLocaleString()}, ${
        event.type === "high" ? "Pleine mer" : "Basse mer"
      }: ${heightRounded}m\n`;
    });
    affichageMarees.textContent += "\n";
  });
}
fetchTideExtremes();

// Ajout des tuiles OpenStreetMap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// Fonction pour styliser les départements
function styleDepartement(feature) {
  return {
    color: "#3388FF", // Couleur de la bordure (bleu)
    weight: 1, // Épaisseur de la bordure
    fillColor: "#FFFFFF", // Couleur de remplissage (blanc)
    fillOpacity: 0, // Opacité du remplissage (transparent)
  };
}

// Fonction pour gérer le survol d'un département
function highlightFeature(e) {
  const layer = e.target;
  layer.setStyle({
    weight: 2,
    color: "#666",
    fillColor: "#00aaff", // Couleur de surbrillance
    fillOpacity: 0.7,
  });
}

// Fonction pour réinitialiser le style d'un département
function resetHighlight(e) {
  e.target.setStyle(styleDepartement(e.target.feature));
}

// Fonction pour zoomer sur un département lors du clic
function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

// Fonction pour charger et ajouter un département à la carte
function ajouterDepartement(nomFichier) {
  fetch(nomFichier)
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          "Erreur lors du chargement du fichier GeoJSON : " + nomFichier
        );
      }
      return response.json();
    })
    .then((data) => {
      const departementLayer = L.geoJSON(data, {
        style: styleDepartement,
        onEachFeature: (feature, layer) => {
          layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: zoomToFeature,
          });
        },
      }).addTo(map);
    })
    .catch((error) => {
      console.error(error);
    });
}

// Liste des fichiers GeoJSON des départements
const departements = [
  "sarthe.geojson",
  "maine_et_loire.geojson",
  "loire_atlantique.geojson",
  "mayenne.geojson",
  "vendee.geojson",
];

// Chargement de chaque département
departements.forEach(ajouterDepartement);

// Création d'une couche masque vide avec les options désirées
const maskLayer = L.mask(null, {
  fitBounds: true, // Ajuste la vue pour englober le masque
  restrictBounds: true, // Restreint la navigation aux limites du masque
  color: "#3388FF", // Couleur de la bordure (bleu)
  weight: 2, // Épaisseur de la bordure
  fillColor: "#FFFFFF", // Couleur de remplissage du masque (cachant l'extérieur)
  fillOpacity: 1, // Opacité complète pour masquer l'extérieur
});

// Ajout de la couche masque à la carte
maskLayer.addTo(map);

// Chargement du fichier GeoJSON contenant les contours des Pays de la Loire
fetch("region_pays_de_la_loire.geojson")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Erreur lors du chargement du fichier GeoJSON");
    }
    return response.json();
  })
  .then((data) => {
    // Ajout des données GeoJSON au masque
    maskLayer.addData(data);
    // Ajustement de la vue pour englober les limites du masque
    const bounds = L.geoJSON(data).getBounds();
    map.fitBounds(bounds);
  })
  .catch((error) => {
    console.error("Erreur lors du chargement du fichier GeoJSON :", error);
  });