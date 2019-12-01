--------------------------NET MODE-------------------------------

#export
export CORE_PEER_MSPCONFIGPATH=/blockchain/hyperledger/book_2019/src/trade-finance-logistics/order_hyperledger/network/crypto-config/peerOrganizations/exporterorg.trade.com/users/Admin@exporterorg.trade.com/msp/ 
export CORE_PEER_ADDRESS=peer0.exporterorg.trade.com:7051
export CORE_PEER_LOCALMSPID=ExporterOrgMSP

#import
export CORE_PEER_MSPCONFIGPATH=/blockchain/hyperledger/book_2019/src/trade-finance-logistics/order_hyperledger/network/crypto-config/peerOrganizations/importerorg.trade.com/users/Admin@importerorg.trade.com/msp/
export CORE_PEER_ADDRESS=peer0.importerorg.trade.com:8051
export CORE_PEER_LOCALMSPID=ImporterOrgMSP

export CORE_PEER_TLS_ROOTCERT_FILE=/blockchain/hyperledger/book_2019/src/trade-finance-logistics/network/crypto-config/ordererOrganizations/trade.com/orderers/orderer.trade.com/tls/ca.crt

peer channel create -o orderer.trade.com:7050 -c tradechannel -f channel-artifacts/channel.tx   --tls --cafile /blockchain/hyperledger/book_2019/src/trade-finance-logistics/order_hyperledger/network/crypto-config/ordererOrganizations/trade.com/orderers/orderer.trade.com/msp/tlscacerts/tlsca.trade.com-cert.pem

peer channel join -b tradechannel.block
peer channel fetch config tradechannel.block -o orderer.trade.com:7050 -c tradechannel

peer chaincode install -n test -p trade-finance-logistics/chaincode/src/github.com/trade_workflow  -v 1

peer chaincode instantiate -C tradechannel -n test -v 1 -c '{"Args":["init","LumberInc","LumberBank","100000","WoodenToys","ToyBank","200000","UniversalFreight","ForestryDepartment"]}' -o orderer.trade.com:7050

peer chaincode upgrade -n test -v 1 -C tradechannel  -c '{"Args":["init","LumberInc","LumberBank","100000","WoodenToys","ToyBank","200000","UniversalFreight","ForestryDepartment"]}'


peer chaincode invoke -n test -c '{"Args":["getTradeStatus", "trade-12"]}' -C tradechannel

peer chaincode invoke -n test -c '{"Args":["requestTrade", "trade-12", "50000", "Wood for Toys"]}' -C tradechannel

peer chaincode invoke -n test -c '{"Args":["getTradeStatus", "trade-12"]}' -C tradechannel

peer chaincode install -n test -p trade-finance-logistics/order_hyperledger/chaincode/order  -v 1
peer chaincode instantiate -C tradechannel -n test -c '{"Args":["init"]}' -o orderer.trade.com:7050 -v 1
peer chaincode upgrade -o orderer.trade.com:7050 -C tradechannel -n test  -c '{"Args":["init"]}' -v 1



----------------------------DEV-----------------------------------

1) first console
CORE_PEER_ADDRESS=127.0.0.1:7052 CORE_CHAINCODE_ID_NAME=test:1 go run /blockchain/hyperledger/book_2019/src/trade-finance-logistics/order_hyperledger/chaincode/order/*.go

2) second console
export CORE_PEER_MSPCONFIGPATH=/blockchain/hyperledger/book_2019/src/trade-finance-logistics/order_hyperledger/network/devmode/crypto-config/peerOrganizations/devorg.trade.com/users/Admin@devorg.trade.com/msp/
export CORE_PEER_ADDRESS=peer:7051
export CORE_PEER_LOCALMSPID=DevOrgMSP

peer chaincode install -n test -p trade-finance-logistics/chaincode/src/github.com/order  -v 1
peer chaincode instantiate -C tradechannel -n test -c '{"Args":["init"]}' -o orderer.trade.com:7050 -v 1

peer chaincode upgrade -o orderer.trade.com:7050 -C tradechannel -n test  -c '{"Args":["init"]}' -v 1


---------------------------Chaincode------------------------------------
 
peer chaincode invoke -n test -c '{"Args":["requestOrder","trade-1","17000","solar battery: Risen rsm 144-6-390m half-cell","187"]}' -C tradechannel
peer chaincode invoke -n test -c '{"Args":["acceptOrder","trade-1"]}' -C tradechannel
peer chaincode invoke -n test -c '{"Args":["makePrepayment","trade-1"]}' -C tradechannel
peer chaincode invoke -n test -c '{"Args":["prepareShipment","trade-1","Shanghai","Odessa","Shanghai","19.02.2020","20.03.2020"]}' -C tradechannel
peer chaincode invoke -n test -c '{"Args":["updateShipmentLocation","trade-1","Alexandria"]}' -C tradechannel
peer chaincode invoke -n test -c '{"Args":["updateShipmentLocation","trade-1","Odessa"]}' -C tradechannel
peer chaincode invoke -n test -c '{"Args":["makePayment","trade-1"]}' -C tradechannel

peer chaincode invoke -n test -c '{"Args":["reset","trade-1"]}' -C tradechannel

peer chaincode invoke -n test -c '{"Args":["getOrder","trade-1"]}' -C tradechannel
peer chaincode invoke -n test -c '{"Args":["getShipment","trade-1"]}' -C tradechannel

peer chaincode invoke -n test -c '{"Args":["getBalance","ImporterBalance"]}' -C tradechannel
peer chaincode invoke -n test -c '{"Args":["getBalance","ExporterBalance"]}' -C tradechannel 