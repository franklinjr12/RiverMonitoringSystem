package deviceauth

import (
	"errors"
	"goriver/internal/devicemessage"
)

func AuthenticateDeviceMessage(packet []byte) error {
	if len(packet) < devicemessage.HEADERSIZE {
		return errors.New("incorrect device message size")
	}
	// perform db validations
	return nil
}
