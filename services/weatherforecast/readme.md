for building on Windows Powershell:
go build -ldflags "-X main.apiKey=$env:YOURKEY" .

for running:
./weatherforecast.exe

for building and running:
go run -ldflags "-X main.apiKey=YOURKEY" main.go