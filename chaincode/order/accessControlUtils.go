package main

import (
	"crypto/x509"
	"encoding/pem"
	"errors"
	"fmt"

	"github.com/golang/protobuf/proto"
	"github.com/hyperledger/fabric-protos-go/msp"
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

	//fmt.Printf("%+v\n", cert)

	return creatorSerializedId.Mspid, cert.Issuer.CommonName, nil
}

func authenticateExporterOrg(mspID string, certCN string) bool {
	return (mspID == "ExporterOrgMSP") && (certCN == "ca.exporterorg.trade.com")
}

func authenticateImporterOrg(mspID string, certCN string) bool {
	return (mspID == "ImporterOrgMSP") && (certCN == "ca.importerorg.trade.com")
}

func authenticateCarrierOrg(mspID string, certCN string) bool {
	return (mspID == "CarrierOrgMSP") && (certCN == "ca.carrierorg.trade.com")
}

func authenticateRegulatorOrg(mspID string, certCN string) bool {
	return (mspID == "RegulatorOrgMSP") && (certCN == "ca.regulatororg.trade.com")
}
