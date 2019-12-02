/*
 * Copyright 2018 IBM All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

// TradeWorkflowChaincode implementation
type TradeWorkflowChaincode struct {
}

const (
	ImporterBalance = "ImporterBalance"
	ExporterBalance = "ExporterBalance"
)

func (t *TradeWorkflowChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Printf("%s Initializing Trade\n", funcName())
	//_, args := stub.GetFunctionAndParameters()
	var err error

	// if len(args) != 1 {
	// 	err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 8: {"+
	// 		"Exporter, "+
	// 		"Exporter's Bank, "+
	// 		"Exporter's Account Balance, "+
	// 		"Importer, "+
	// 		"Importer's Bank, "+
	// 		"Importer's Account Balance, "+
	// 		"Carrier, "+
	// 		"Regulatory Authority"+
	// 		"}. Found %d", len(args)))
	// 	return shim.Error(err.Error())
	// }

	// // Type checks
	// _, err = strconv.Atoi(string(args[2]))
	// if err != nil {
	// 	fmt.Printf("Exporter's account balance must be an integer. Found %s\n", args[2])
	// 	return shim.Error(err.Error())
	// }
	// _, err = strconv.Atoi(string(args[5]))
	// if err != nil {
	// 	fmt.Printf("Importer's account balance must be an integer. Found %s\n", args[5])
	// 	return shim.Error(err.Error())
	// }

	err = stub.PutState(ImporterBalance, []byte("20000"))
	if err != nil {
		fmt.Println(fmt.Errorf("Error recording key %s: %s\n", ImporterBalance, err.Error()))
		return shim.Error(err.Error())
	}

	err = stub.PutState(ExporterBalance, []byte("0"))
	if err != nil {
		fmt.Println(fmt.Errorf("Error recording key %s: %s\n", ExporterBalance, err.Error()))
		return shim.Error(err.Error())
	}

	// // Map participant identities to their roles on the ledger
	// roleKeys := []string{expKey, ebKey, expBalKey, impKey, ibKey, impBalKey, carKey, raKey}
	// for i, roleKey := range roleKeys {
	// 	err = stub.PutState(roleKey, []byte(args[i]))
	// 	if err != nil {
	// 		fmt.Errorf("Error recording key %s: %s\n", roleKey, err.Error())
	// 		return shim.Error(err.Error())
	// 	}
	// }

	return shim.Success(nil)
}

func (t *TradeWorkflowChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {

	creator, err := stub.GetCreator()
	if err != nil {
		fmt.Println(fmt.Errorf("Error getting transaction creator: %s\n", err.Error()))
		return shim.Error(err.Error())
	}
	creatorOrg := ""
	creatorCertIssuer := ""
	// if !t.testMode {
	creatorOrg, creatorCertIssuer, err = getTxCreatorInfo(creator)
	// 	if err != nil {
	// 		fmt.Errorf("Error extracting creator identity info: %s\n", err.Error())
	// 		return shim.Error(err.Error())
	// 	}
	// 	fmt.Printf("TradeWorkflow Invoke by '%s', '%s'\n", creatorOrg, creatorCertIssuer)
	// }

	function, args := stub.GetFunctionAndParameters()

	fmt.Printf("%s %s \n", funcName(), function)
	if function == "requestOrder" {
		// Importer requests an order
		return t.requestOrder(stub, creatorOrg, creatorCertIssuer, args)
	} else if function == "acceptOrder" {
		// Exporter accepts an order
		return t.acceptOrder(stub, creatorOrg, creatorCertIssuer, args)
	} else if function == "getOrder" {
		// Exporter get an order
		return t.getOrder(stub, creatorOrg, creatorCertIssuer, args)
	} else if function == "getShipment" {
		//Anyone get Shipment's status
		return t.getShipment(stub, creatorOrg, creatorCertIssuer, args)
	} else if function == "makePrepayment" {
		return t.makePrepayment(stub, creatorOrg, creatorCertIssuer, args)
	} else if function == "prepareShipment" {
		return t.prepareShipment(stub, creatorOrg, creatorCertIssuer, args)
	} else if function == "updateShipmentLocation" {
		return t.updateShipmentLocation(stub, creatorOrg, creatorCertIssuer, args)
	} else if function == "makePayment" {
		return t.makePayment(stub, creatorOrg, creatorCertIssuer, args)
	} else if function == "getBalance" {
		return t.getBalance(stub, creatorOrg, creatorCertIssuer, args)
	} else if function == "reset" {
		return t.reset(stub, creatorOrg, creatorCertIssuer, args)
	}

	return shim.Error("Invalid invoke function name")
}

func (t *TradeWorkflowChaincode) getBalance(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) pb.Response {

	var balance float64
	var balanceBytes []byte
	var err error

	if len(args) != 1 {
		return shim.Error("argument owner of balance should be provided")
	}

	balanceBytes, err = stub.GetState(args[0])

	if err != nil {
		return shim.Error(err.Error())
	}

	balance, err = strconv.ParseFloat(string(balanceBytes), 64)
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Printf("%s balance %.2f \n", funcName(), balance)

	return shim.Success([]byte(fmt.Sprintf("balance:%.2f", balance)))
}

func (t *TradeWorkflowChaincode) getOrder(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) pb.Response {

	var tradeAgreement *TradeAgreement
	var tradeAgreementBytes []byte
	var orderKey string
	var err error

	if len(args) != 1 {
		return shim.Error("argument ID should be provided")
	}

	orderKey, err = getOrderKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Printf("%s orderKey %s \n", funcName(), orderKey)
	tradeAgreementBytes, err = stub.GetState(orderKey)

	if err != nil {
		return shim.Error(err.Error())
	}

	err = json.Unmarshal(tradeAgreementBytes, &tradeAgreement)
	if err != nil {
		return shim.Error(err.Error())
	}
	fmt.Printf("%s %+v\n", funcName(), tradeAgreement)

	fmt.Printf("%s DescriptionOfGoods[%s] Amount[%.2f] Payment [%.2f] Numbers [%d] Status[%s]\n", funcName(),
		tradeAgreement.DescriptionOfGoods, tradeAgreement.Amount, tradeAgreement.Payment,
		tradeAgreement.Numbers, tradeAgreement.Status)

	return shim.Success([]byte(tradeAgreement.DescriptionOfGoods + "/Amount " +
		fmt.Sprintf("%.2f", tradeAgreement.Amount) + "/Payment " +
		fmt.Sprintf("%.2f", tradeAgreement.Payment) + "/Status " +
		tradeAgreement.Status))
}

func (t *TradeWorkflowChaincode) getShipment(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) pb.Response {

	var shipmentDelivery *ShipmentDelivery
	var shipmentDeliveryBytes []byte
	var shipmentKey string
	var err error

	if len(args) != 1 {
		return shim.Error("argument ID should be provided")
	}

	shipmentKey, err = getShipmentKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Printf("%s shipmentKey %s \n", funcName(), shipmentKey)
	shipmentDeliveryBytes, err = stub.GetState(shipmentKey)

	if err != nil {
		return shim.Error(err.Error())
	}

	err = json.Unmarshal(shipmentDeliveryBytes, &shipmentDelivery)
	if err != nil {
		return shim.Error(err.Error())
	}
	fmt.Printf("%s %+v\n", funcName(), shipmentDelivery)

	fmt.Printf("%s TradeId[%s] current location [%s] \n", funcName(),
		shipmentDelivery.TradeId, shipmentDelivery.Location)

	return shim.Success([]byte(shipmentDelivery.TradeId +
		"/SourcePort " + shipmentDelivery.SourcePort +
		"/DestinationPort " + shipmentDelivery.DestinationPort +
		"/Current Location " + shipmentDelivery.Location +
		"/EndDate " + shipmentDelivery.EndDate))
}

// Request a trade agreement
func (t *TradeWorkflowChaincode) requestOrder(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) pb.Response {
	var orderKey string
	var tradeAgreement *TradeAgreement
	var tradeAgreementBytes []byte
	var amount float64
	var numbers int
	var err error

	// Access control: Only an Importer Org member can invoke this transaction
	// if !t.testMode && !authenticateImporterOrg(creatorOrg, creatorCertIssuer) {
	// 	return shim.Error("Caller not a member of Importer Org. Access denied.")
	// }

	if len(args) != 4 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 3: {ID, Amount, Description of Goods}. Found %d", len(args)))
		return shim.Error(err.Error())
	}

	orderKey, err = getOrderKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	tradeAgreementBytes, err = stub.GetState(orderKey)

	if len(tradeAgreementBytes) != 0 {
		return shim.Error(fmt.Sprintf("orderKey [%s] is already existed, please, use another", orderKey))
	}

	amount, err = strconv.ParseFloat(args[1], 64)
	if err != nil {
		return shim.Error(err.Error())
	}
	numbers, err = strconv.Atoi(args[3])
	if err != nil {
		return shim.Error(err.Error())
	}

	tradeAgreement = &TradeAgreement{amount, args[2], REQUESTED, 0, numbers}
	tradeAgreementBytes, err = json.Marshal(tradeAgreement)
	if err != nil {
		return shim.Error("Error marshaling trade agreement structure")
	}

	// Write the state to the ledger

	err = stub.PutState(orderKey, tradeAgreementBytes)
	if err != nil {
		return shim.Error(err.Error())
	}
	fmt.Printf("Trade %s request recorded\n", args[0])

	return shim.Success(nil)
}

func (t *TradeWorkflowChaincode) reset(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) pb.Response {
	var orderKey string
	var shipmentKey string
	var err error

	if len(args) != 1 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 1: {ID}. Found %d", len(args)))
		return shim.Error(err.Error())
	}

	orderKey, err = getOrderKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.DelState(orderKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	shipmentKey, err = getShipmentKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.DelState(shipmentKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	//install initial states
	err = stub.PutState(ImporterBalance, []byte("20000"))
	if err != nil {
		fmt.Println(fmt.Errorf("Error recording key %s: %s\n", ImporterBalance, err.Error()))
		return shim.Error(err.Error())
	}

	err = stub.PutState(ExporterBalance, []byte("0"))
	if err != nil {
		fmt.Println(fmt.Errorf("Error recording key %s: %s\n", ExporterBalance, err.Error()))
		return shim.Error(err.Error())
	}

	return shim.Success([]byte(string(orderKey + " && " + shipmentKey + " are removed!")))
}

func (t *TradeWorkflowChaincode) updateShipmentLocation(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) pb.Response {

	var shipmentKey string
	var shipmentDelivery *ShipmentDelivery
	var shipmentDeliveryBytes []byte

	var err error

	// Access control: Only an Importer Org member can invoke this transaction
	// if !t.testMode && !authenticateImporterOrg(creatorOrg, creatorCertIssuer) {
	// 	return shim.Error("Caller not a member of Importer Org. Access denied.")
	// }

	if len(args) != 2 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 2: "+
			"{trade-id, current location}. Found %d", len(args)))
		return shim.Error(err.Error())
	}

	shipmentKey, err = getShipmentKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	//update trade's status
	shipmentDeliveryBytes, err = stub.GetState(shipmentKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = json.Unmarshal(shipmentDeliveryBytes, &shipmentDelivery)
	if err != nil {
		return shim.Error("Error unmarshaling shipment structure")
	}

	shipmentDelivery.Location = args[1]

	//update
	if shipmentDelivery.Location == shipmentDelivery.DestinationPort {
		deliverCargo(stub, args[0])
	}

	shipmentDeliveryBytes, err = json.Marshal(shipmentDelivery)
	if err != nil {
		return shim.Error("Error marshaling shipment updating structure")
	}

	// Write the state to the ledger

	err = stub.PutState(shipmentKey, shipmentDeliveryBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

func (t *TradeWorkflowChaincode) prepareShipment(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) pb.Response {
	var orderKey string
	var shipmentKey string
	var tradeAgreement *TradeAgreement
	var tradeAgreementBytes []byte

	var shipmentDelivery *ShipmentDelivery
	var shipmentDeliveryBytes []byte
	var err error

	// Access control: Only an Importer Org member can invoke this transaction
	// if !t.testMode && !authenticateImporterOrg(creatorOrg, creatorCertIssuer) {
	// 	return shim.Error("Caller not a member of Importer Org. Access denied.")
	// }

	if len(args) != 6 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 6: "+
			"{trade-id, SourcePort, DestinationPort, Location, startDate ,endDate}. Found %d", len(args)))
		return shim.Error(err.Error())
	}

	orderKey, err = getOrderKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	//update trade's status
	tradeAgreementBytes, err = stub.GetState(orderKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = json.Unmarshal(tradeAgreementBytes, &tradeAgreement)
	if err != nil {
		return shim.Error("Error unmarshaling trade agreement structure")
	}

	if tradeAgreement.Status != PREPAYMENT {
		return shim.Error(fmt.Sprintf(" [%s] : has to be in PREPAYMENT state", args[0]))
	}

	tradeAgreement.Status = SETOFF

	tradeAgreementBytes, err = json.Marshal(tradeAgreement)
	if err != nil {
		return shim.Error("Error marshaling trade agreement structure")
	}

	// Write the state to the ledger

	err = stub.PutState(orderKey, tradeAgreementBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	//update shipment's status
	shipmentDelivery = &ShipmentDelivery{args[1], args[2], args[3], args[4], args[5], args[0]}

	shipmentDeliveryBytes, err = json.Marshal(shipmentDelivery)

	if err != nil {
		return shim.Error(err.Error())
	}

	shipmentKey, err = getShipmentKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	// Write the state to the ledger

	err = stub.PutState(shipmentKey, shipmentDeliveryBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Printf("%s request recorded orderKey [%s] shipmentKey[%s]\n", funcName(), args[0], shipmentKey)

	return shim.Success(nil)
}

//make full payment
func (t *TradeWorkflowChaincode) makePayment(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) pb.Response {
	var orderKey string
	var impBalByte, exBalByte []byte
	var importerBalalance, exporterBalalance float64
	var tradeAgreement *TradeAgreement
	var tradeAgreementBytes []byte
	var err error

	// // Access control: Only an Exporter Org member can invoke this transaction
	// if !t.testMode && !authenticateExporterOrg(creatorOrg, creatorCertIssuer) {
	// 	return shim.Error("Caller not a member of Exporter Org. Access denied.")
	// }

	if len(args) != 1 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 1: {ID}. Found %d", len(args)))
		return shim.Error(err.Error())
	}

	// // Get the state from the ledger
	orderKey, err = getOrderKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}
	tradeAgreementBytes, err = stub.GetState(orderKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	if len(tradeAgreementBytes) == 0 {
		err = errors.New(fmt.Sprintf("No record found for trade ID %s", args[0]))
		return shim.Error(err.Error())
	}

	// // Unmarshal the JSON
	err = json.Unmarshal(tradeAgreementBytes, &tradeAgreement)
	if err != nil {
		return shim.Error(err.Error())
	}

	if tradeAgreement.Status != DELIVERED {
		return shim.Error(fmt.Sprintf("Trade %s : has to be in DELIVERED state", args[0]))
	}

	impBalByte, err = stub.GetState(ImporterBalance)
	if err != nil {
		return shim.Error(err.Error())
	}

	importerBalalance, err = strconv.ParseFloat(string(impBalByte), 64)
	if err != nil {
		return shim.Error(err.Error())
	}

	currentPayment := tradeAgreement.Amount - tradeAgreement.Payment

	if importerBalalance < currentPayment {
		return shim.Error("no sufficient money on importer's balance currentPayment " + fmt.Sprintf("%f", currentPayment) +
			" importerBalalance " + fmt.Sprintf("%f", importerBalalance))
	}

	importerBalalance -= currentPayment
	err = stub.PutState(ImporterBalance, []byte(toString(importerBalalance)))
	if err != nil {
		return shim.Error(err.Error())
	}

	exBalByte, err = stub.GetState(ExporterBalance)
	if err != nil {
		return shim.Error(err.Error())
	}

	exporterBalalance, err = strconv.ParseFloat(string(exBalByte), 64)
	if err != nil {
		return shim.Error(err.Error())
	}

	exporterBalalance += currentPayment
	err = stub.PutState(ExporterBalance, []byte(toString(exporterBalalance)))
	if err != nil {
		return shim.Error(err.Error())
	}

	//payment is complete
	tradeAgreement.Payment = tradeAgreement.Amount
	tradeAgreement.Status = PAID
	tradeAgreementBytes, err = json.Marshal(tradeAgreement)
	if err != nil {
		return shim.Error("Error marshaling trade agreement structure")
	}
	// Write the state to the ledger
	err = stub.PutState(orderKey, tradeAgreementBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Printf("Trade %s make prepayment recorded\n", args[0])

	return shim.Success(nil)
}

func (t *TradeWorkflowChaincode) makePrepayment(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) pb.Response {
	var orderKey string
	var impBalByte, exBalByte []byte
	var importerBalalance, exporterBalalance float64
	var tradeAgreement *TradeAgreement
	var tradeAgreementBytes []byte
	var err error

	// // Access control: Only an Exporter Org member can invoke this transaction
	// if !t.testMode && !authenticateExporterOrg(creatorOrg, creatorCertIssuer) {
	// 	return shim.Error("Caller not a member of Exporter Org. Access denied.")
	// }

	if len(args) != 1 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 1: {ID}. Found %d", len(args)))
		return shim.Error(err.Error())
	}

	// // Get the state from the ledger
	orderKey, err = getOrderKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}
	tradeAgreementBytes, err = stub.GetState(orderKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	if len(tradeAgreementBytes) == 0 {
		err = errors.New(fmt.Sprintf("No record found for trade ID %s", args[0]))
		return shim.Error(err.Error())
	}

	// // Unmarshal the JSON
	err = json.Unmarshal(tradeAgreementBytes, &tradeAgreement)
	if err != nil {
		return shim.Error(err.Error())
	}

	if tradeAgreement.Status != ACCEPTED {
		return shim.Error(fmt.Sprintf("Trade %s : has to be in ACCEPTED state", args[0]))
	}

	impBalByte, err = stub.GetState(ImporterBalance)
	if err != nil {
		return shim.Error(err.Error())
	}

	importerBalalance, err = strconv.ParseFloat(string(impBalByte), 64)
	if err != nil {
		return shim.Error(err.Error())
	}

	currentPayment := tradeAgreement.Amount * 0.2 //20 percent

	if importerBalalance < currentPayment {
		return shim.Error("no sufficient money on importer's balance")
	}

	importerBalalance -= currentPayment
	err = stub.PutState(ImporterBalance, []byte(toString(importerBalalance)))
	if err != nil {
		return shim.Error(err.Error())
	}

	exBalByte, err = stub.GetState(ExporterBalance)
	if err != nil {
		return shim.Error(err.Error())
	}

	exporterBalalance, err = strconv.ParseFloat(string(exBalByte), 64)
	if err != nil {
		return shim.Error(err.Error())
	}

	exporterBalalance += currentPayment
	err = stub.PutState(ExporterBalance, []byte(toString(exporterBalalance)))
	if err != nil {
		return shim.Error(err.Error())
	}

	tradeAgreement.Payment += currentPayment

	tradeAgreement.Status = PREPAYMENT
	tradeAgreementBytes, err = json.Marshal(tradeAgreement)
	if err != nil {
		return shim.Error("Error marshaling trade agreement structure")
	}
	// Write the state to the ledger
	err = stub.PutState(orderKey, tradeAgreementBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Printf("Trade %s make prepayment recorded\n", args[0])

	return shim.Success(nil)
}

// Accept a trade agreement
func (t *TradeWorkflowChaincode) acceptOrder(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) pb.Response {
	var orderKey string
	var tradeAgreement *TradeAgreement
	var tradeAgreementBytes []byte
	var err error

	// // Access control: Only an Exporter Org member can invoke this transaction
	// if !t.testMode && !authenticateExporterOrg(creatorOrg, creatorCertIssuer) {
	// 	return shim.Error("Caller not a member of Exporter Org. Access denied.")
	// }

	if len(args) != 1 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 1: {ID}. Found %d", len(args)))
		return shim.Error(err.Error())
	}

	// // Get the state from the ledger
	orderKey, err = getOrderKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}
	tradeAgreementBytes, err = stub.GetState(orderKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	if len(tradeAgreementBytes) == 0 {
		err = errors.New(fmt.Sprintf("No record found for trade ID %s", args[0]))
		return shim.Error(err.Error())
	}

	// // Unmarshal the JSON
	err = json.Unmarshal(tradeAgreementBytes, &tradeAgreement)
	if err != nil {
		return shim.Error(err.Error())
	}

	if tradeAgreement.Status != REQUESTED {
		fmt.Printf("Trade %s is already  ACCEPTED\n", args[0])
		return shim.Error(fmt.Sprintf("Trade %s is already ACCEPTED", args[0]))
	} else {
		tradeAgreement.Status = ACCEPTED
		tradeAgreementBytes, err = json.Marshal(tradeAgreement)
		if err != nil {
			return shim.Error("Error marshaling trade agreement structure")
		}
		// Write the state to the ledger
		err = stub.PutState(orderKey, tradeAgreementBytes)
		if err != nil {
			return shim.Error(err.Error())
		}
	}
	fmt.Printf("Trade %s acceptance recorded\n", args[0])

	return shim.Success(nil)
}

//private method
func deliverCargo(stub shim.ChaincodeStubInterface, orderId string) pb.Response {
	var orderKey string
	var tradeAgreement *TradeAgreement
	var tradeAgreementBytes []byte
	var err error

	orderKey, err = getOrderKey(stub, orderId)
	if err != nil {
		return shim.Error(err.Error())
	}

	//update trade's status
	tradeAgreementBytes, err = stub.GetState(orderKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = json.Unmarshal(tradeAgreementBytes, &tradeAgreement)
	if err != nil {
		return shim.Error("Error unmarshaling tradeAgreement structure")
	}

	tradeAgreement.Status = DELIVERED

	tradeAgreementBytes, err = json.Marshal(&tradeAgreement)
	if err != nil {
		return shim.Error("Error unmarshaling tradeAgreement structure")
	}

	err = stub.PutState(orderKey, tradeAgreementBytes)

	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

func main() {
	fmt.Printf("order runs\n")
	twc := new(TradeWorkflowChaincode)
	err := shim.Start(twc)
	if err != nil {
		fmt.Printf("Error starting order chaincode: %s\n", err)
	}
}
