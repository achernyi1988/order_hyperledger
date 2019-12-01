package main

import (
	"fmt"
	"path/filepath"
	"runtime"
	"strings"

	"github.com/hyperledger/fabric/core/chaincode/shim"
)

func funcName() string {
	pc, _, _, _ := runtime.Caller(1)

	nameFull := runtime.FuncForPC(pc).Name()
	nameEnd := filepath.Ext(nameFull)
	name := strings.TrimPrefix(nameEnd, ".")
	return name + "=>"
}

func toString(value float64) string {
	return fmt.Sprintf("%f", value)
}

func getOrderKey(stub shim.ChaincodeStubInterface, id string) (string, error) {
	orderKey, err := stub.CreateCompositeKey("Order", []string{id})
	if err != nil {
		return "", err
	} else {
		return orderKey, nil
	}
}

func getShipmentKey(stub shim.ChaincodeStubInterface, id string) (string, error) {
	orderKey, err := stub.CreateCompositeKey("Shipment", []string{id})
	if err != nil {
		return "", err
	} else {
		return orderKey, nil
	}
}
