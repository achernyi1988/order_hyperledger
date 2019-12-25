
ACTION=$1;

if [ -z $ACTION ] ; then
     ACTION="import"
fi

# Determine whether starting, stopping, restarting or generating for announce
if [ "$ACTION" == "import" ]; then
export CORE_PEER_MSPCONFIGPATH=/blockchain/hyperledger/book_2019/src/trade-finance-logistics/order_hyperledger/network/crypto-config/peerOrganizations/importer.trade.com/users/Admin@importer.trade.com/msp/
export CORE_PEER_ADDRESS=peer0.importer.trade.com:8051
export CORE_PEER_LOCALMSPID=ImporterOrgMSP
export CORE_PEER_NAME=peer0.importer.trade.com
export CORE_LISTENING_PORT=8052
elif [ "$ACTION" == "export" ]; then
export CORE_PEER_MSPCONFIGPATH=/blockchain/hyperledger/book_2019/src/trade-finance-logistics/order_hyperledger/network/crypto-config/peerOrganizations/exporter.trade.com/users/Admin@exporter.trade.com/msp/ 
export CORE_PEER_ADDRESS=peer0.exporter.trade.com:7051
export CORE_PEER_LOCALMSPID=ExporterOrgMSP
export CORE_PEER_NAME=peer0.exporter.trade.com
export CORE_LISTENING_PORT=7052
elif [ "$ACTION" == "carrier" ]; then
export CORE_PEER_MSPCONFIGPATH=/blockchain/hyperledger/book_2019/src/trade-finance-logistics/order_hyperledger/network/crypto-config/peerOrganizations/carrier.trade.com/users/Admin@carrier.trade.com/msp/ 
export CORE_PEER_ADDRESS=peer0.carrier.trade.com:9051
export CORE_PEER_LOCALMSPID=CarrierOrgMSP
export CORE_PEER_NAME=peer0.carrier.trade.com
export CORE_LISTENING_PORT=9052
else
exit 1
fi


echo "switch to ${ACTION}"

