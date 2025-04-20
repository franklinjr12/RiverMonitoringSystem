package main

import (
	"fmt"
	"io"
	"net/http"
)

// variable for being set at build time with ldflags
var apiKey string

func main() {
	baseUrl := "https://api.openweathermap.org/data/2.5/weather?"
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
