package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"math/rand"
	"net/http"
	"time"
)

// this program will run as a service in a linux machine,
// it will simulate a device sending sensor data to the server
// in the format [{"sensor_id": 1, "value": 1.0, "recorded_at": "2021-01-01 12:00:00"}]
// for the values it will use a senoidal generator based on current time plus a random noise
// for the config it will read a config.json file in the same director or use default values

// === Program structs and functions ===

type SensorConfig struct {
	SensorId  int     `json:"sensor_id"`
	MinValue  float64 `json:"min_value"`
	MaxValue  float64 `json:"max_value"`
	Frequency float64 `json:"frequency"`
}

type Config struct {
	Host           string         `json:"host"`
	Port           int            `json:"port"`
	Route          string         `json:"route"`
	TimeoutSeconds int            `json:"timeout_seconds"`
	Sensors        []SensorConfig `json:"sensors"`
}

type SensorData struct {
	SensorId   int     `json:"sensor_id"`
	Value      float64 `json:"value"`
	RecordedAt string  `json:"recorded_at"`
}

var config Config

func loadConfig() (Config, error) {
	// jsonFile, err := os.Open("config.json")
	// if err != nil {
	// 	return Config{}, err
	// }
	// defer jsonFile.Close()
	// byteValue, err := io.ReadAll(jsonFile)
	// if err != nil {
	// 	return Config{}, err
	// }
	// var config Config
	// json.Unmarshal(byteValue, &config)
	// return config, nil

	config = Config{
		Host:           "http://localhost",
		Port:           3000,
		Route:          "/sensor_datum/create",
		TimeoutSeconds: 120,
		Sensors: []SensorConfig{
			// {SensorId: 1, MinValue: 1, MaxValue: 5, Frequency: 0.0033},
			{SensorId: 1, MinValue: 1, MaxValue: 5, Frequency: 1.0 / 3600.0},
		},
	}
	return config, nil
}

// implement generateSensorData which receives a DeviceConfig and returns a float and an error
func generateSensorData(sensorConfig SensorConfig) ([]SensorData, error) {
	now := time.Now()
	period := 1.0 / sensorConfig.Frequency
	samplesInDay := int(24 * 60 * 60 / period)
	data := make([]SensorData, 0)
	for i := samplesInDay; i > 0; i-- {
		sampleTime := now.Add(-time.Duration(float64(time.Second) * period * float64(samplesInDay-i)))
		sinValue := math.Sin(2 * math.Pi * float64(sampleTime.Second()))
		// Scale to min-max range
		rangeSize := sensorConfig.MaxValue - sensorConfig.MinValue
		baseValue := sensorConfig.MinValue + (rangeSize/2)*(1+sinValue)

		// Add random noise (5% of range)
		noise := (rand.Float64() - 0.5) * rangeSize * 0.05
		value := baseValue + noise

		// Clamp to min-max bounds
		if value < sensorConfig.MinValue {
			value = sensorConfig.MinValue
		}
		if value > sensorConfig.MaxValue {
			value = sensorConfig.MaxValue
		}

		dataEntry := SensorData{SensorId: sensorConfig.SensorId, Value: value, RecordedAt: sampleTime.Format(time.RFC3339)}
		data = append(data, dataEntry)
	}

	return data, nil
}

// implement connectToServer which receives a Config and returns a http connection and an error
func connectToServer(config Config) (*http.Client, error) {
	// Create HTTP client with timeout
	timeout := time.Duration(config.TimeoutSeconds) * time.Second
	client := &http.Client{
		Timeout: timeout,
	}
	return client, nil
}

// implement sendToServer which receives a DeviceConfig and returns an error
func sendToServer(url string, data []SensorData, client *http.Client) error {
	payload := map[string][]SensorData{
		"payload": data,
	}

	// Marshal to JSON
	jsonData, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal JSON: %w", err)
	}

	// Send POST request
	resp, err := client.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to send POST request: %w", err)
	}
	defer resp.Body.Close()

	// Check response status
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("server returned error status: %d", resp.StatusCode)
	}

	return nil
}

// === Aws Lambda structs and functions ===

func init() {
}

func handleRequest(ctx context.Context, event json.RawMessage) error {
	log.Println("Event: ", event)
	return nil
}

// === Main function ===

func main() {

	log.Println("Loading config")
	config, err := loadConfig()
	if err != nil {
		log.Println("Err: ", err)
		return
	}

	log.Println("Connecting to server")
	http, err := connectToServer(config)
	if err != nil {
		log.Println("Err: ", err)
		return
	}

	// Construct URL (handle case where host already includes protocol)
	url := fmt.Sprintf("%s:%d%s", config.Host, config.Port, config.Route)

	log.Println("Generating data")
	sensorData := make([]SensorData, 0)
	for _, e := range config.Sensors {
		data, err := generateSensorData(e)
		if err != nil {
			log.Println("Err: ", err)
			return
		}
		sensorData = append(sensorData, data...)
	}

	log.Println("Sending sensor data")
	err = sendToServer(url, sensorData, http)
	if err != nil {
		log.Println("Err: ", err)
		return
	}
	log.Println("Finished running")

	// lambda.Start(handleRequest)
}
