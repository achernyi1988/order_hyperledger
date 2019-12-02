/**
 * Demonstrates the use of Channel class instance for querying the channel
 */
const fs = require('fs');
const Client = require('fabric-client');

const asn = require('asn1.js')
var sha = require('js-sha256');

// Constants for profile, wallet & user
const CONNECTION_PROFILE_PATH = './profiles/dev-connection.yaml'
// Client section configuration
const EXPORTER_CLIENT_CONNECTION_PROFILE_PATH = './profiles/exporter.yaml'
const BUDGET_CLIENT_CONNECTION_PROFILE_PATH = './profiles/budget-max.yaml'

// Org & User
const MSP_ID = "ExporterOrgMSP"
const ORG_NAME = 'exporterorg.trade.com'
const USER_NAME = 'peer0.exporterorg.trade.com'   // Non admin identity will lead to 'access denied' try User1
const PEER_NAME = 'peer0.exporterorg.trade.com'
const CHANNEL_NAME = 'tradechannel'
const CHAINCODE_ID = "test"
const CRYPTO_CONFIG_CLIENT_PATH = "../network/crypto-config/peerOrganizations"

// Variable to hold the client
const client = Client.loadFromConfig(CONNECTION_PROFILE_PATH)
// Variable to hold the channel
var channel = {} 



async function main() {
    // Setup the client instance
    await setupClient()

    // Setup the channel instance
    channel = await setupChannel()
    
   // console.log("channel", channel);
    // Print the info for the chain
   // await getChannelInfo()

    // Print the chaincode info
   // await getChaincodeInfo()


   await queryChaincode();

   await invokeChaincode();


  // await queryChaincode();
}


/**
 * Initialize the file system credentials store
 * 1. Creates the instance of client using <static> loadFromConfig
 * 2. Loads the client connection profile based on org name
 * 3. Initializes the credential store
 * 4. Loads the user from credential store
 * 5. Sets the user on client instance and returns it
 */
async function setupClient() {

    // setup the client part

    await switchAccount(ORG_NAME, USER_NAME)
}


switchAccount = async (org, user) => {

    // setup the instance
    if (org == 'exporterorg.trade.com') {
        client.loadFromConfig(EXPORTER_CLIENT_CONNECTION_PROFILE_PATH)
    } else if (org == 'budget') {
        client.loadFromConfig(BUDGET_CLIENT_CONNECTION_PROFILE_PATH)
    } else {
        console.log("Invalid Org: ", org)
        return `Invalid Org: ${org}`;
        process.exit(1)
    }


    // Call the function for initializing the credentials store on file system
    await client.initCredentialStores()
        .then((done) => {
            console.log("initCredentialStore(): ", done)
        }).catch((err) =>{
            console.log("err: ", err)
            return `credential store ${org} | ${user} failed`;
        }) 

   
    let userContext = await client.loadUserFromStateStore(user)

    if( userContext == null ){
    
        // Create the user context
        const {userContext, err} = await createUserContext(org, user)

        if(null != userContext){
            console.log(`Created ${user} under the credentials store!!!`)
        }else{
            return err;
        }

  

    } else { 
        console.log(`User ${user} already exist!!`)
    }
      
    //set the user context on client
   try{
        await client.setUserContext(userContext, true);
   }catch(err){
       console.log("err", err);
   }

    return `switched to org  [${org}] | user [${user}] successfully`;
}

async function createUserContext(org, user) {

    try{

        console.log("org: " + org + " user: " + user);
    // Get the path  to user private key
    let privateKeyPath = getPrivateKeyPath(org, user)

   // console.log("privateKeyPath",privateKeyPath);

    // Get the path to the user certificate
    let certPath = getCertPath(org, user)
  
    // Setup the options for the user context
    // Global Type: UserOpts 

 
    let opts = {
        username: user,
        mspid:  "ExporterOrgMSP",
        cryptoContent: {
            privateKey: privateKeyPath,
            signedCert: certPath
        },
        // Set this to true to skip persistence
        skipPersistence: false
    }
    
    // Setup the user 
    let userContext = await client.createUser(opts)

    return {userContext, err: ""} 
    }
    catch(err){
        console.log("no user available");
        return {userContext : null, err};
        
    }
}

/**
 * Reads content of the certificate
 * @param {string} org 
 * @param {string} user 
 */
function getCertPath(org, user) {
    //budget.com/users/Admin@budget.com/msp/signcerts/Admin@budget.com-cert.pem"
    //var certPath = CRYPTO_CONFIG_CLIENT_PATH + "/" + org + ".com/users/" + user + "@" + org + ".com/msp/signcerts/" + user + "@" + org + ".com-cert.pem"

    //var certPath = CRYPTO_CONFIG_CLIENT_PATH + "/" + org + "/peers/" + PEER_NAME + `/msp/signcerts/peer0.exporterorg.trade.com-cert.pem`
    var certPath = CRYPTO_CONFIG_CLIENT_PATH + "/" + org + "/peers/" + PEER_NAME + `/msp/signcerts/peer0.exporterorg.trade.com-cert.pem`

    console.log("getCertPath", certPath);
    return certPath
    //return "../fabric-ca/client/acme/alex/msp/signcerts/cert.pem"
}
 
/**
 * Reads the content of users private key
 * @param {string} org 
 * @param {string} user 
 */ 
function getPrivateKeyPath(org, user) {
    // ../crypto/crypto-config/peerOrganizations/budget.com/users/Admin@budget.com/msp/keystore/05beac9849f610ad5cc8997e5f45343ca918de78398988def3f288b60d8ee27c_sk
    //var pkFolder = CRYPTO_CONFIG_CLIENT_PATH + "/" + org + ".com/users/" + user + "@" + org + ".com/msp/keystore"
    var pkFolder = CRYPTO_CONFIG_CLIENT_PATH + "/" + org + "/peers/" + PEER_NAME + "/msp/keystore"
    console.log("getPrivateKeyPath pkFolder:",pkFolder);
    fs.readdirSync(pkFolder).forEach(file => {
       // console.log("getPrivateKeyPath ",file);
        // return the first file
        pkfile = file
        return
    })

    

    return (pkFolder + "/" + pkfile)

   // return "../fabric-ca/client/acme/alex/msp/keystore/42c4abe807c8f174051d8052687d17b396b811cb608eb0093a923da7c5573e8a_sk"
}

/**
 * Creates the MSP ID from the org name for 'acme' it will be 'AcmeMSP'
 * @param {string} org 
 */
function createMSPId(org) {
    return org.charAt(0).toUpperCase() + org.slice(1) + 'MSP'
}

/**
 * Gathers info for the channel
 * Prints the information for the 2 latest blocks
 */
async function getChannelInfo() {

    // Gets the info on the blockchain
    let info = await channel.queryInfo()
  
    const blockHeight = parseInt(info.height.low);
    console.log(`Current Chain Height: ${blockHeight}\n`)

    // Lets make sure there are enough blocks in chai
    if (blockHeight < 3) {
        console.log("Not enough height!! - please invoke chaincode!!")
        return
    }

    // Get the latest block
    let block = await channel.queryBlock(blockHeight - 1)
    printBlockInfo(block)
     
    // Get the previous block with hash from latest block
    block = await channel.queryBlock(blockHeight - 2)
    printBlockInfo(block)
   
}

/**
 * Get the information on instantiated chaincode
 */
async function getChaincodeInfo(){
    let chaincodes = await channel.queryInstantiatedChaincodes()
    console.log("Chaincode instantiated:")
    for (var i=0; i<chaincodes.chaincodes.length; i++){
        console.log(`\t${i+1}. name=${chaincodes.chaincodes[i].name} version=${chaincodes.chaincodes[i].version}`)
    }
}


invokeChaincode = async(callback) => {

    // Get the peer for channel. 
    let peerName = channel.getChannelPeer(PEER_NAME)

    // Create a transaction ID
    var tx_id = client.newTransactionID();
    let tx_id_string = tx_id.getTransactionID();

    // Create the ChaincodeInvokeRequest - used as arg for sending proposal to endorser(s)
    // https://fabric-sdk-node.github.io/release-1.4/global.html#ChaincodeInvokeRequest
    var request = {
        targets: peerName,
        chaincodeId: CHAINCODE_ID,
        fcn: 'prepareShipment',
        args: ["trade-1","Shanghai","Odessa","Shanghai","19.02.2020","20.03.2020"],
        chainId: CHANNEL_NAME,
        txId: tx_id
    };

    // PHASE-1 of Transaction Flow
    // 1. Send the transaction proposal
    // https://fabric-sdk-node.github.io/release-1.4/Channel.html#sendTransactionProposal__anchor
    // Response // https://fabric-sdk-node.github.io/release-1.4/global.html#ChaincodeInvokeRequest

    // #1  Send the txn proposal
    console.log("#1 channel.sendTransactionProposal     Done.")
    let results = await channel.sendTransactionProposal(request);

    // Array of proposal responses *or* error @ index=0
    var proposalResponses = results[0];
    // Original proposal @ index = 1
    var proposal = results[1];
    
    console.log("print",results[0][0].message);

    // #2 Loop through responses to check if they are good
    var all_good = true;
    for (var i in proposalResponses) {
        let  good = false
        if (proposalResponses && proposalResponses[i].response &&
            proposalResponses[i].response.status === 200) {
            good = true;
            console.log(`\tinvoke chaincode EP response #${i} was good`);
        } else {
            console.log(`\tinvoke chaincode EP response #${i} was bad!!!`);
        }
        all_good = all_good & good
    }

    console.log("#2 Looped through the EP results  all_good=",all_good)

    // #3 Setup the TX listener
    await setupTxListener(tx_id_string, callback)
    console.log('#3 Registered the Tx Listener')

    // Broadcast request
    var orderer_request = {
        txId: tx_id,
        proposalResponses: proposalResponses,
        proposal: proposal
    };

    // PHASE-2 of Transaction Flow
    // 4. Send the transaction to orderer for delivery
    // https://fabric-sdk-node.github.io/release-1.4/Channel.html#sendTransaction__anchor

    // #4 Request orderer to broadcast the txn
    await channel.sendTransaction(orderer_request);
    console.log("#4 channel.sendTransaction - waiting for Tx Event")
}

/**
 * Setup the transaction listener
 * 
 * #5. Print message in call back of event listener
 */
 function setupTxListener(tx_id_string, callback){

    // 1. Get the event hub for the named peer
    let event_hub = channel.getChannelEventHub(PEER_NAME);
    
    let shouldUnregister = true;
    let handle = setTimeout(() => {
        if(shouldUnregister)
        {
            // do the housekeeping when there is a problem
            event_hub.unregisterTxEvent(tx_id_string);
            console.log('Timeout - Failed to receive the transaction event');

            event_hub.disconnect();
        }

    }, 5000);

    // PHASE-3 of Transaction Flow
    // 2. Register the TX Listenerl
    event_hub.registerTxEvent(tx_id_string, async (tx, code, block_num) => {
        console.log("#5 Received Tx Event")
        console.log('\tThe chaincode invoke chaincode transaction has been committed on peer %s',event_hub.getPeerAddr());
        console.log('\tTransaction %s is in block %s', tx, block_num);

        // Check for the Validity of transaction
        // Note: All transactions are logged to ledger irrespective of the status
        if (code !== 'VALID') {
    
            let message = util.format('\tThe invoke chaincode transaction was invalid, code:%s',code);
            console.log(message);
        
          //  callback("submitted failed");
        } else {
            shouldUnregister = false;
            console.log('\tThe invoke chaincode transaction was VALID.');
            await queryChaincode()
          //  callback("submitted successfully");
        }
    }, 
    // 3. Callback for errors
    (err) => {
        console.log(err);
    },
        // the default for 'unregister' is true for transaction listeners
        // so no real need to set here, however for 'disconnect'
        // the default is false as most event hubs are long running
        // in this use case we are using it only once
        {unregister: true, disconnect: true}
    );

    // 4. Connect to the hub
    event_hub.connect();
}

/**
 * Demonstrates the use of query by chaincode
 */
queryChaincode = async () =>{
    // Execute the query
    try{
    chaincodes = await channel.queryByChaincode({
        targets: PEER_NAME,
        chaincodeId: CHAINCODE_ID,
        fcn: 'getOrder',
        args: ['trade-1']
    })
    }
    catch(err){
        console.log("queryChaincode", err);
    }
    // res=`query [a] = ${chaincodes[0].toString("utf8")}\n`;
    // console.log("query [a] = ",chaincodes[0].toString("utf8"))

    // chaincodes = await channel.queryByChaincode({
    //     chaincodeId: 'nodecc',
    //     fcn: 'query',
    //     args: ['b']
    // })
    res =` ${chaincodes[0].toString("utf8")}`;
    console.log("queryChaincode=> ",res)

  //  callback(res);
}


/**
 * Creates an instance of the Channel class
 */
async function setupChannel() {
    try {
        // Get the Channel class instance from client
        channel = await client.getChannel(CHANNEL_NAME, true)
    } catch (e) {
        console.log("Could NOT create channel: ", CHANNEL_NAME)
        process.exit(1)
    }
    console.log("Created channel object.")

    return channel
}

/**
 * Prints information in the block
 * @param {*} block 
 */
function printBlockInfo(block) {
    console.log('Block Number: ' + block.header.number);
    console.log('Block Hash: ' +calculateBlockHash(block.header))
    console.log('\tPrevious Hash: ' + block.header.previous_hash);
    console.log('\tData Hash: ' + block.header.data_hash);
    console.log('\tTransactions Count: ' + block.data.data.length);

    block.data.data.forEach(transaction => {
      console.log('\t\tTransaction ID: ' + transaction.payload.header.channel_header.tx_id);
      console.log('\t\tCreator ID: ' + transaction.payload.header.signature_header.creator.Mspid);
    // Following lines if uncommented will dump too much info :)
    //   console.log('Data: ');
    //   console.log(JSON.stringify(transaction.payload.data));
    })
}

/**
 * Used for calculating hash for block received with channel.queryBlock
 * @param {*} header 
 */
function calculateBlockHash(header) {
    let headerAsn = asn.define('headerAsn', function () {
        this.seq().obj(
            this.key('Number').int(),
            this.key('PreviousHash').octstr(),
            this.key('DataHash').octstr()
        );
    });

    let output = headerAsn.encode({
        Number: parseInt(header.number),
        PreviousHash: Buffer.from(header.previous_hash, 'hex'),
        DataHash: Buffer.from(header.data_hash, 'hex')
    }, 'der');

    let hash = sha.sha256(output);
    return hash;
}



module.exports = {
    switchAccount,
    invokeChaincode,
    queryChaincode
};


// Call the main function
main()