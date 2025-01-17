// this is a test app to recieve the alarm notifications from the rails app. It is basically a http server that listens for the alarm notifications and logs them to the console.
package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func main() {
	http.HandleFunc("/alarms", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			var payload map[string]interface{}
			err := json.NewDecoder(r.Body).Decode(&payload)
			if err != nil {
				http.Error(w, "Unable to parse JSON", http.StatusBadRequest)
				return
			}
			fmt.Println("Alarm received with payload:", payload)
		} else {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		}
	})
	http.ListenAndServe(":8080", nil)
}
