// This app will serve as a virtual device for sending sensor data to the server.
// The virtual device will send sensor data to the server at regular intervals.
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"math"
	"math/rand"
	"net/http"
	"time"
)

const baseUrl = "http://localhost:3000"
const route = "/sensor_datum/create"

type SensorData struct {
	SensorId   int     `json:"sensor_id"`
	Value      float64 `json:"value"`
	RecordedAt string  `json:"recorded_at"`
}

type Payload struct {
	Content []SensorData `json:"payload"`
}

func main() {
	fmt.Println("Virtual device app")

	var sensorId int = 2
	var numSamples int = 10
	hoursBack := 24 * time.Hour
	fromTime := time.Now().Add(-hoursBack)
	toTime := time.Now()
	maxSensorValue := 5.0
	minSensorValue := 3.0
	samples := make([]float64, numSamples)
	sensorData := make([]SensorData, numSamples)

	for i := 0; i < numSamples; i++ {
		samples[i] = minSensorValue + rand.Float64() + (maxSensorValue-minSensorValue)*math.Sin(2*math.Pi*float64(i)/float64(numSamples))/2
		sensorData[i] = SensorData{
			SensorId:   sensorId,
			Value:      samples[i],
			RecordedAt: fromTime.Add(time.Duration(i) * (toTime.Sub(fromTime) / time.Duration(numSamples))).Format(time.RFC3339),
		}
	}

	payload := Payload{
		Content: sensorData,
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		fmt.Printf("Error marshalling JSON, %v\n", err)
		return
	}
	url := baseUrl + route

	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Printf("Error posting data, %v\n", err)
		return
	}

	defer resp.Body.Close()
	fmt.Println("Response status:", resp.Status)
	fmt.Println("Response content:", resp.Body)
}
