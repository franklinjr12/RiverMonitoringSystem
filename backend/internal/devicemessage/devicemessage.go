package devicemessage

type Header struct {
	DeviceId  uint64
	AuthToken [16]byte
	Version   uint32
}
