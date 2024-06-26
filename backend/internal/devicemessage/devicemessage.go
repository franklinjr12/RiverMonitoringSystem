package devicemessage

import (
	"bytes"
	"encoding/binary"
	"errors"
)

type Header struct {
	DeviceId  uint64
	AuthToken [16]byte
	Version   uint32 // used to decode the rest of the data in tcp packet
}

const HEADERSIZE = 28

type SensorData struct {
	Level       float32
	Temperature float32
	Pressure    float32
}

const SENSORDATASIZE = 12

func ExtractHeader(packet []byte) (Header, error) {
	var header Header
	if len(packet) < HEADERSIZE {
		return header, errors.New("invalid packet size")
	}
	buf := bytes.NewReader(packet[:HEADERSIZE])
	err := binary.Read(buf, binary.LittleEndian, &header.DeviceId)
	if err != nil {
		return header, err
	}
	err = binary.Read(buf, binary.LittleEndian, &header.AuthToken)
	if err != nil {
		return header, err
	}
	err = binary.Read(buf, binary.LittleEndian, &header.Version)
	if err != nil {
		return header, err
	}
	return header, nil
}
