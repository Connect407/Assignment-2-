const searchInput = document.getElementById("search-input");
const resultsContainer = document.getElementById("results-container");

searchInput.addEventListener("input", (e) => {
    fetchCountryData(e.target.value);
});

async function fetchCountryData(country) {
    try {
        const response = await fetch(`https://restcountries.com/v3.1/name/${country}`);
        const data = await response.json();
        const countriesWithWeather = await Promise.all(data.map(async (country) => {
            const weatherData = await fetchWeatherData(country.latlng);
            return { ...country, weather: weatherData };
        }));
        displayResults(countriesWithWeather);
    } catch (error) {
        console.error(error);
    }
}

async function fetchWeatherData(latlng) {
    const [latitude, longitude] = latlng;
    const apiKey = "ea8b04a9f72807c95ce660120d58ae07"; // Replace with your actual API key
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`);
    const data = await response.json();
    return data;
}

function displayResults(countries) {
    // Clear previous search results
    resultsContainer.innerHTML = "";

    // Create a Set to keep track of displayed country names
    const displayedCountryNames = new Set();

    // Display new search results
    countries.forEach(async (country) => {
        // Check if the country name has already been displayed
        if (!displayedCountryNames.has(country.name.common)) {
            const col = document.createElement("div");
            col.classList.add("col-md-4", "mb-4");

            const card = document.createElement("div");
            card.classList.add("card", "results-item");
            col.appendChild(card);

            const body = document.createElement("div");
            body.classList.add("card-body");
            card.appendChild(body);

            const title = document.createElement("h5");
            title.classList.add("card-title");
            title.textContent = country.name.common;
            body.appendChild(title);

            const moreDetails = document.createElement("div");
            moreDetails.classList.add("more-details");
            body.appendChild(moreDetails);

            const flag = document.createElement("img");
            flag.src = country.flags.png;
            flag.alt = country.name.common + " flag";
            flag.style.width = "100%";
            moreDetails.appendChild(flag);

            const population = document.createElement("p");
            population.textContent = "Population: " + country.population;
            moreDetails.appendChild(population);

            const capital = document.createElement("p");
            capital.textContent = "Capital: " + country.capital;
            moreDetails.appendChild(capital);

            // Fetch weather data
            try {
                const weatherData = await fetchWeatherData(country.latlng);
                const weatherInfo = document.createElement("p");
                weatherInfo.textContent = `Weather: ${weatherData.weather[0].description}, Temperature: ${weatherData.main.temp}°C`;
                moreDetails.appendChild(weatherInfo);
            } catch (error) {
                console.error("Error fetching weather data:", error);
            }

            const button = document.createElement("button");
            button.classList.add("btn", "btn-primary");
            button.textContent = "More Details";
            body.appendChild(button);

            button.addEventListener("click", () => {
                moreDetails.style.display = moreDetails.style.display === "none" ? "block" : "none";
            });

            // Add the country name to the Set of displayed country names
            displayedCountryNames.add(country.name.common);

            resultsContainer.appendChild(col);
        }
    });
}

