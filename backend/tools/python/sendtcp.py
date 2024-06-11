# tcp_client.py
import socket

def send_data(data):
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client_socket.connect(('localhost', 8080))  
    
    client_socket.sendall(data.encode())  # Send data
    response = client_socket.recv(1024).decode()  # Receive acknowledgment
    print(f"Received from server: {response}")
    
    client_socket.close()

if __name__ == "__main__":
    data_to_send = "HelloHelloHelloHelloHelloHelloHelloHelloHello\n\0"
    send_data(data_to_send)

# python .\backend\tools\python\sendtcp.py