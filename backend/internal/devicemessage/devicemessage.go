package devicemessage

import "unsafe"

type Header struct {
	DeviceId  uint64
	AuthToken [16]byte
	Version   uint32
}

var headerExample Header

const HEADERSIZE = int(unsafe.Sizeof(headerExample))
