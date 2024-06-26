package main

import (
	"bufio"
	"fmt"
	"goriver/internal/deviceauth"
	"net"
	"os"
	"time"
)

func handleConnection(conn net.Conn) {
	defer conn.Close()
	conn.SetDeadline(time.Now().Add(1 * time.Second))
	fmt.Println("Client connected:", conn.RemoteAddr())
	var err error

	// Create a reader to read incoming data
	reader := bufio.NewReader(conn)
	var incomeBytes []byte
	incomeBytes, _ = reader.ReadBytes(0)

	if err = deviceauth.AuthenticateDeviceMessage(incomeBytes); err != nil {
		fmt.Println("AuthenticateDeviceMessage: ", err)
		_, err = conn.Write([]byte("Unauthorized"))
		if err != nil {
			fmt.Println("Error writing to client:", err)
			return
		}
		return
	}

	message := string(incomeBytes[:])
	fmt.Printf("Message received: %s", message)

	// Respond to the client
	_, err = conn.Write([]byte("Message received\n"))
	if err != nil {
		fmt.Println("Error writing to client:", err)
		return
	}
}

func main() {
	// Start the TCP server
	listener, err := net.Listen("tcp", ":8080")
	if err != nil {
		fmt.Println("Error starting TCP server:", err)
		os.Exit(1)
	}
	defer listener.Close()
	fmt.Println("TCP server listening on port 8080")

	for {
		// Accept new connections
		conn, err := listener.Accept()
		if err != nil {
			fmt.Println("Error accepting connection:", err)
			continue
		}
		go handleConnection(conn)
	}
}
