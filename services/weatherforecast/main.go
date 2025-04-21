package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
)

const baseUrl = "https://api.openweathermap.org/data/2.5/weather?"

// variable for being set at build time with ldflags
var apiKey string
var port string

func testGet() {
	// test values
	longitude := "-49.1438"
	latitude := "-25.2607"
	url := fmt.Sprintf("%slat=%s&lon=%s&appid=%s", baseUrl, latitude, longitude, apiKey)
	resp, err := http.Get(url)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		fmt.Println("Error:", resp.StatusCode)
		return
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response body:", err)
		return
	}
	fmt.Println("Response:", string(body))
}

func precipitationHandler(w http.ResponseWriter, r *http.Request) {
	longitude := r.URL.Query().Get("lon")
	latitude := r.URL.Query().Get("lat")
	if longitude == "" || latitude == "" {
		http.Error(w, "Missing 'lon' or 'lat' query parameters", http.StatusBadRequest)
		return
	}

	url := fmt.Sprintf("%slat=%s&lon=%s&appid=%s", baseUrl, latitude, longitude, apiKey)
	resp, err := http.Get(url)
	if err != nil {
		http.Error(w, "Error fetching data from weather API", http.StatusInternalServerError)
		log.Println("Error fetching data:", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		http.Error(w, fmt.Sprintf("Weather API returned status: %d", resp.StatusCode), http.StatusInternalServerError)
		return
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		http.Error(w, "Error reading response body", http.StatusInternalServerError)
		log.Println("Error reading response body:", err)
		return
	}

	data, err := extractPrecipitationData(body)
	if err != nil {
		http.Error(w, "Error extracting precipitation data", http.StatusInternalServerError)
		log.Println("Error extracting precipitation data:", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

type WeatherData struct {
	Weather []struct {
		Main        string `json:"main"`
		Description string `json:"description"`
	} `json:"weather"`
	Main struct {
		Temp     float64 `json:"temp"`
		Pressure int     `json:"pressure"`
		Humidity int     `json:"humidity"`
	} `json:"main"`
	Clouds struct {
		All int `json:"all"`
	} `json:"clouds"`
}

func extractPrecipitationData(jsonData []byte) (map[string]any, error) {
	var data WeatherData
	if err := json.Unmarshal(jsonData, &data); err != nil {
		return nil, fmt.Errorf("error unmarshalling JSON: %v", err)
	}

	if len(data.Weather) == 0 {
		return nil, fmt.Errorf("weather data is empty")
	}

	result := map[string]any{
		"weather":     data.Weather[0].Main,
		"description": data.Weather[0].Description,
		"temperature": data.Main.Temp,
		"pressure":    data.Main.Pressure,
		"humidity":    data.Main.Humidity,
		"clouds":      data.Clouds.All,
	}

	return result, nil
}

func main() {
	// testGet()

	if port == "" {
		port = os.Getenv("PORT")
		if port == "" {
			// default port
			port = "8080"
		}
	}

	http.HandleFunc("/precipitation", precipitationHandler)

	log.Printf("Starting server on port %s...", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}
