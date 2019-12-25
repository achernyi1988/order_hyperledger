
ACTION=$1;
VERSION=$2;

if [ -z $VERSION ] ; then
     VERSION="1"
fi

# Determine whether starting, stopping, restarting or generating for announce
if [ "$ACTION" == "install" ]; then

peer chaincode install -n test -p trade-finance-logistics/order_hyperledger/chaincode/order  -v ${VERSION}

elif [ "$ACTION" == "instantiate" ]; then
peer chaincode instantiate -C tradechannel -n test -c '{"Args":["init"]}' -o orderer.trade.com:7050 -v ${VERSION}
elif [ "$ACTION" == "upgrade" ]; then
peer chaincode upgrade -o orderer.trade.com:7050 -C tradechannel -n test  -c '{"Args":["init"]}' -v ${VERSION}

elif [ "$ACTION" == "create" ]; then
peer channel create -o orderer.trade.com:7050 -c tradechannel -f channel-artifacts/channel.tx
elif [ "$ACTION" == "join" ]; then
peer channel join -b tradechannel.block
elif [ "$ACTION" == "fetch" ]; then
peer channel fetch config tradechannel.block -o orderer.trade.com:7050 -c tradechannel

elif [ "$ACTION" == "run" ]; then
CORE_CHAINCODE_ID_NAME=test:${VERSION} CORE_PEER_TLS_ENABLED=false go run /blockchain/hyperledger/book_2019/src/trade-finance-logistics/order_hyperledger/chaincode/order/*.go -peer.address ${CORE_PEER_NAME}:${CORE_LISTENING_PORT}
elif [ "$ACTION" == "rundev" ]; then
CORE_CHAINCODE_ID_NAME=test:${VERSION} CORE_PEER_TLS_ENABLED=false go run /blockchain/hyperledger/book_2019/src/trade-finance-logistics/order_hyperledger/chaincode/order/*.go -peer.address ${CORE_PEER_NAME}:${CORE_LISTENING_PORT} testMode
else
  exit 1
fi


echo "${ACTION} is done for ${CORE_PEER_NAME}"

