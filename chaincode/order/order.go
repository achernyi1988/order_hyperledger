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

//	fmt.Printf("Exporter: %s\n", args[0])
	// fmt.Printf("Exporter's Bank: %s\n", args[1])
	// fmt.Printf("Exporter's Account Balance: %s\n", args[2])
	// fmt.Printf("Importer: %s\n", args[3])
	// fmt.Printf("Importer's Bank: %s\n", args[4])
	// fmt.Printf("Importer's Account Balance: %s\n", args[5])
	// fmt.Printf("Carrier: %s\n", args[6])
	// fmt.Printf("Regulatory Authority: %s\n", args[7])

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

	fmt.Printf("%s %s \n",funcName(), function)
	if function == "requestOrder" {
		// Importer requests an order
		return t.requestOrder(stub, creatorOrg, creatorCertIssuer, args)
	} else if function == "acceptOrder" {
		// Exporter accepts an order
		return t.acceptOrder(stub, creatorOrg, creatorCertIssuer, args)
	} else if function == "getOrder" {
		// Exporter get an order
		return t.getOrder(stub, creatorOrg, creatorCertIssuer, args)
	} else if function == "makePrepayment"{
		return t.makePrepayment(stub, creatorOrg, creatorCertIssuer, args)
	}else if function == "prepareShipment"{
		return t.prepareShipment(stub, creatorOrg, creatorCertIssuer, args)
	}else if function == "closeDeal"{
		return t.closeDeal(stub, creatorOrg, creatorCertIssuer, args)
	}

	return shim.Error("Invalid invoke function name")
}

func (t *TradeWorkflowChaincode) getOrder(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) pb.Response {

	var tradeAgreement *TradeAgreement
	var tradeAgreementBytes []byte
	var orderKey string 
	var err error

	if len(args) != 1{
		return shim.Error("argument ID should be provided")
	}

	orderKey, err = getOrderKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Printf("%s orderKey %s \n", funcName(),orderKey);
	tradeAgreementBytes, err = stub.GetState(orderKey)

	if err != nil{
		return shim.Error(err.Error())
	}

	err = json.Unmarshal(tradeAgreementBytes, &tradeAgreement)
	if err != nil{
		return shim.Error(err.Error())
	}
	fmt.Printf("%s %+v\n", funcName(), tradeAgreement )

	fmt.Printf("%s DescriptionOfGoods[%s] Amount[%.2f] Payment [%.2f] Numbers [%d] Status[%s]\n",funcName(),
	 	tradeAgreement.DescriptionOfGoods, tradeAgreement.Amount, tradeAgreement.Payment, 
	 	tradeAgreement.Numbers, tradeAgreement.Status )
	
 
	return shim.Success([]byte(tradeAgreement.DescriptionOfGoods + "/Amount " +
		 fmt.Sprintf("%.2f",tradeAgreement.Amount) + "/Payment " +
		 fmt.Sprintf("%.2f",tradeAgreement.Payment) + "/Status " + 
		 tradeAgreement.Status))
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
		return shim.Error(fmt.Sprintf("orderKey [%s] is already existed, please, use another", orderKey));
	}
 

	amount,err = strconv.ParseFloat(args[1],64)
	if err != nil{
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



func (t *TradeWorkflowChaincode) closeDeal(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) pb.Response {
	var orderKey string
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
	if err != nil{
		return shim.Error(err.Error())
	}
	return shim.Success([]byte(string(orderKey + " is removed")));
}


func (t *TradeWorkflowChaincode) prepareShipment(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) pb.Response {
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
		return shim.Error(fmt.Sprintf("orderKey [%s] is already existed, please, use another", orderKey));
	}
 

	amount,err = strconv.ParseFloat(args[1],64)
	if err != nil{
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


func (t *TradeWorkflowChaincode) makePrepayment(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) pb.Response {
	var orderKey string
	var impBalByte,exBalByte  []byte
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
		
	impBalByte,err = stub.GetState(ImporterBalance)
	if err != nil {
		return shim.Error(err.Error())
	}

	importerBalalance, err = strconv.ParseFloat(string(impBalByte),64)
	if err != nil {
		return shim.Error(err.Error())
	}

	currentPayment:= tradeAgreement.Amount*0.2; //20 percent

	if importerBalalance  < currentPayment {
		return shim.Error("no sufficient money on importer's balance")
	}
	
	importerBalalance -= currentPayment;
	err = stub.PutState(ImporterBalance, []byte(toString(importerBalalance)))
	if err != nil {
		return shim.Error(err.Error())
	}

	exBalByte,err = stub.GetState(ExporterBalance)
	if err != nil {
		return shim.Error(err.Error())
	}

	exporterBalalance, err = strconv.ParseFloat(string(exBalByte),64)
	if err != nil {
		return shim.Error(err.Error())
	}

	exporterBalalance += currentPayment;
	err = stub.PutState(ExporterBalance, []byte(toString(exporterBalalance)))
	if err != nil {
		return shim.Error(err.Error())
	}

	tradeAgreement.Payment+= currentPayment;

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

	if tradeAgreement.Status == ACCEPTED {
		fmt.Printf("Trade %s already accepted", args[0])
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


func main() {
	fmt.Printf("order runs\n")
	twc := new(TradeWorkflowChaincode)
	err := shim.Start(twc)
	if err != nil {
		fmt.Printf("Error starting order chaincode: %s\n", err)
	}
}
