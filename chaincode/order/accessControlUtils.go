
package main

import (
	"fmt"
	"errors"
	"github.com/golang/protobuf/proto"
	"github.com/hyperledger/fabric-protos-go/msp"
	"crypto/x509"
	"encoding/pem"
)

func getTxCreatorInfo(creator []byte) (string, string, error) {
	var certASN1 *pem.Block
	var cert *x509.Certificate
	var err error
	
	creatorSerializedId := &msp.SerializedIdentity{}
	err = proto.Unmarshal(creator, creatorSerializedId)
	if err != nil {
		fmt.Printf("%s Error unmarshalling creator identity: %s\n", funcName(), err.Error())
		return "", "", err
	}

	if len(creatorSerializedId.IdBytes) == 0 {
		return "", "", errors.New("Empty certificate")
	}
	certASN1, _ = pem.Decode(creatorSerializedId.IdBytes)
	cert, err = x509.ParseCertificate(certASN1.Bytes)
	if err != nil {
		return "", "=>", err
	}

	//fmt.Printf("%+v\n", cert )

	return creatorSerializedId.Mspid, cert.Issuer.CommonName, nil
}