const express = require('express')
const cors = require('cors')
const app = express()
const router = express.Router()
const PORT = process.env.port || 4000
// import firestore instance
const {db} = require("./firebase");
const { collection, addDoc, serverTimestamp, where, getDocs, query, doc, getDoc, updateDoc, orderBy, limit } = require("firebase/firestore");
//const { queryPaymentSent,queryPaymentReceived } = require('./modules/etherScan')


// Middlewares
const currentDateAndTime = new Date().toLocaleString('en-US', { timeZone: 'America/Toronto' });
app.use(cors())
app.use(express.json())

/* ----- Define Routes ----- */

// Landing Route
router.get("/", (req,res) => {
    res.send("<h1>Server On!!!</h1>")
})

/* ------------------------- Payment Request Related Endpoints ------------------------- */
const PaymentRequestRef = collection(db,"PaymentRequests")

// POST Request: Create a "payment request document" to the "payment request collection" 
// returns back the newly created document id 
router.post('/create-payment-request', async (req,res) => {
    try {
        const {payment_requester, request_recipient, ether_amount, transaction_message} = req.body

        if (ether_amount <= 0){
            console.log(`${currentDateAndTime}: Invalid transaction amount`)
            return res.status(400).send("Invalid transaction amount")
        }

        if (payment_requester == request_recipient) {
            console.log(`${currentDateAndTime}: Invalid receipient: You are no allowed to send funds to your own address`)
            return res.status(400).send("Invalid receipient: You are no allowed to send funds to your own address")
        }

        const data = {
            payment_requester : payment_requester,
            request_recipient : request_recipient,
            ether_amount : ether_amount,
            transaction_message : transaction_message,
            transaction_state : "Pending",
            request_time: serverTimestamp(),
            transaction_completion_time: false,
            transaction_hash: false 
        }
        
        // Add a new payment request document with an auto-generated ID.
        const newDocumentRef = await addDoc(PaymentRequestRef, data)
        console.log(`${currentDateAndTime}: Added new payment request document with id: ${newDocumentRef.id}`)
        return res.status(200).json(newDocumentRef.id)

    } 
    catch(error) {
        console.log(`${currentDateAndTime}: ${error.message}`)
        return res.status(500).send(error.message)
    }
})

// GET Request: Query payment request by request recipient
// Returns back an array of payment request document
router.get('/get-payment-request/:requestRecipient', async (req,res) => {
    try {
        const queryResult = []
        const queryResultId = []
        const request_recipient = req.params.requestRecipient
        const q = query(PaymentRequestRef,where('request_recipient', '==', request_recipient))
        const querySnapshot = await getDocs(q)
        querySnapshot.forEach(documentSnapshot => {
            const documentData = documentSnapshot.data()
            documentData.paymentRequestId = documentSnapshot.id
            queryResultId.push(documentSnapshot.id)
            queryResult.push(documentData)
        })
        console.log(`${currentDateAndTime}: There are ${queryResultId.length} documents matchs the query: ${queryResultId}`)
        return res.status(200).json(queryResult)
    } 
    catch(error) {
        console.log(`${currentDateAndTime}: ${error.message}`)
        return res.status(500).send(error.message)
    }
})

//PATCH Request: Update payment request's transaction state
// Returns back the entire updated document
// decision = true if user accepts request
// decision = false if user rejects request
// @dev get back to this function how how to verify update result
router.patch('/update-transaction-state/:paymentRequestId', async (req,res) => {
    try {
        // Destructure request params and body
        const payment_request_id = req.params.paymentRequestId
        const { decision } = req.body

        // query the target payment request documnet
        const targetDocumentRef = doc(db, 'PaymentRequests', payment_request_id)
        const targetDocumentSnap = await getDoc(targetDocumentRef)

        // edge case handling: If the provided paymentRequestId do no exist in db
        if (!targetDocumentSnap.exists()) {
            console.log(`${currentDateAndTime}: Bad request: No such payment request document`)
            return res.status(400).send("No such payment request document") 
        }

        // update the payment request document
        if (decision) {
            const updatedData = {
                transaction_state : "Processed",
                transaction_completion_time : serverTimestamp()
            }
            // update the transaction state
            await updateDoc(targetDocumentRef,updatedData) // returning void
            
        } else{
            const updatedData = {
                transaction_state : "Rejected",
                transaction_completion_time : serverTimestamp()
            }
            // update the transaction state
            await updateDoc(targetDocumentRef,updatedData) // returning void
        }
        
        // return the updated payment document data
        const updatedTargetDocumentRef = doc(db, 'PaymentRequests', payment_request_id)
        const updatedTargetDocumentSnap = await getDoc(updatedTargetDocumentRef)
        const updatedTargetDocumentData = updatedTargetDocumentSnap.data()
    
        console.log(`${currentDateAndTime}: Here is the updated document: `,updatedTargetDocumentData)
        return res.status(200).json(updatedTargetDocumentData)
    } 
    catch(error) {
        return res.status(500).send(error.message)
    }
})

//PATCH Request: Update payment request's transaction Hash
// Returns back the entire updated document
router.patch('/update-transaction-hash/:paymentRequestId/:transactionHash', async (req,res) => {
    try {
        // Destructure request params
        const payment_request_id = req.params.paymentRequestId
        const transaction_hash = req.params.transactionHash

        // get target payment request document
        const targetDocumentRef = doc(db, 'PaymentRequests', payment_request_id)
        const targetDocumentSnap = await getDoc(targetDocumentRef)

        // edge case handling: If the provided paymentRequestId do no exist in db
        if (!targetDocumentSnap.exists()) {
            console.log(`${currentDateAndTime}: Bad request: No such payment request document`)
            return res.status(400).send("No such payment request document") 
        }

        // upate target payment request document
        await updateDoc(targetDocumentRef,{transaction_hash : transaction_hash}) // returning void

        // return the updated payment document data
        const updatedTargetDocumentRef = doc(db, 'PaymentRequests', payment_request_id)
        const updatedTargetDocumentSnap = await getDoc(updatedTargetDocumentRef)
        const updatedTargetDocumentData = updatedTargetDocumentSnap.data()
    
        console.log(`${currentDateAndTime}: Here is the updated document: `,updatedTargetDocumentData)
        return res.status(200).json(updatedTargetDocumentData)
    } 
    catch(error) {
        res.status(500).send(error.message)
    }
})

/* ------------------------- BASE & DB Query Endpoints ------------------------- */

// GET Request: Query Request Activities (Request Sent, Request Received)
// returns back an array of Request Activity (Sorted By timestamp)
/*
Activity Object Structure 
{
    "activityId" : "01hlEmQYIz6Dpr8ACpOa" <-- doc ID for DB query, txn hash for ethereum query
    "activityType" : "Payment Sent", <--- enum type (Payment Sent, Payment Reveived, Request Sent, Request Received)
    "activityState" : "Processed", <--- enmu type (Processed , Rejected, Pending)
    "counterParty" : "0x9dD82EE27cc23B343f186756771904E0386973f1" <--- For "Payment Sent" and "Request Sent" it will be the Payment / Request Recipient. For "Payment Received" and "Request Received", its will be the Payment / Request Sender
    "amount" : "0.001",
    "timestamp" : "8/20/2023, 11:01:00 PM" <--- will be request time instead of completion time for "request type". will be txn completion time for "payment type"
}

*/

router.get('/activties/:userAddress', async (req,res) => {
    try {
        const userAddress = req.params.userAddress
        //const { etherscanDomain } = req.body
        const activities = []

        // query activties
        const requestSendActivities = await queryPaymentRequestSent(userAddress)
        const requestReceivedActivities = await queryPaymentRequestReceived(userAddress)
        //const paymentSendActivities = await queryPaymentSent(etherscanDomain,userAddress)
        //const paymentReceivedActivities = await queryPaymentReceived(etherscanDomain,userAddress)

        //activities.push(...requestSendActivities, ...requestReceivedActivities, ...paymentSendActivities, ...paymentReceivedActivities);
        activities.push(...requestSendActivities, ...requestReceivedActivities);

        // sort the activities array by timestamp in descending order (latest appears as first)
        activities.sort((a, b) => {
            const timestampA = a.timestamp.seconds * 1000 + a.timestamp.nanoseconds / 1000000;
            const timestampB = b.timestamp.seconds * 1000 + b.timestamp.nanoseconds / 1000000;
            return timestampB - timestampA;
          });

        console.log(`${currentDateAndTime}: User ${userAddress} have ${activities.length} activities in our application`)
        return res.status(200).json(activities)
    } 
    catch(error) {
        console.log(`${currentDateAndTime}: ${error.message}`)
        return res.status(500).send(error.message)
    }
})

/* ------------------------- Payment Request Helper Functions ------------------------- */
// query all PaymentRequest that payment_requester matches userId
// returns a array of Activity Object: "Request Sent"
const queryPaymentRequestSent = async(userAddress) => {
    try {
        const result = []
        const request_requester = userAddress
        const q = query(PaymentRequestRef,where('payment_requester', '==', request_requester))
        const querySnapshot = await getDocs(q)
        querySnapshot.forEach(documentSnapshot => {
            const documentData = documentSnapshot.data()

            const { transaction_state, request_recipient, ether_amount, request_time } = documentData
            
            result.push({
                activityId : documentSnapshot.id,
                activityType : "Request Sent",
                activityState : transaction_state,
                counterParty : request_recipient,
                amount : ether_amount,
                timestamp : request_time
            })

            
        })
        return result
    } 
    catch(error) {
        return error.message
    }
}


// query all PaymentRequest that request_recipient matchs userId
// returns a array of Activity Object: "Request Received"
const queryPaymentRequestReceived = async(userAddress) => {
    try {
        const result = []
        const request_recipient = userAddress
        const q = query(PaymentRequestRef,where('request_recipient', '==', request_recipient))
        const querySnapshot = await getDocs(q)
        querySnapshot.forEach(documentSnapshot => {
            const documentData = documentSnapshot.data()

            const { transaction_state, payment_requester, ether_amount, request_time } = documentData
            
            result.push({
                activityId : documentSnapshot.id,
                activityType : "Request Received",
                activityState : transaction_state,
                counterParty : payment_requester,
                amount : ether_amount,
                timestamp : request_time
            })
        })
        return result
    } 
    catch(error) {
        return error.message
    }
}



/* ------------------------- Private Chatroom Related Endpoints ------------------------- */
const PrivateChatRoomsRef = collection(db,"PrivateChatRooms")

// GET Request: Query PrivateChatRooms by user address
// Returns back an array custom chatroom object for front-end display
router.get('/get-private-chatroom/:userAddress', async (req, res) => {
    try {
        // destructure request params
        const userAddress = req.params.userAddress;

        // empty array for returning response: Will returns an array custom chatroom object
        const customChatrooms = [];
        // create an array of promises for subcollection queries
        const subCollectionPromises = [];

        // start to query PrivateChatRooms document that's a user participated in
        const q = query(PrivateChatRoomsRef, where("participants", "array-contains", userAddress));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach(documentSnapshot => {
            
            const { participants } = documentSnapshot.data();

            // start to query the sub-collection "Messages" within a PrivateChatRoom: Only query the latest message
            const subCollectionQuery = query(collection(db, "PrivateChatRooms", documentSnapshot.id, "Messages"), orderBy("timestamp", "desc"), limit(1));
            subCollectionPromises.push(getDocs(subCollectionQuery).then(subCollectionQuerySnapshot => {
                const latestMessage = subCollectionQuerySnapshot.docs[0];

                if (latestMessage) {
                    const { from, text_content, timestamp } = latestMessage.data();

                    const customChatroom = {
                        chatroomId : documentSnapshot.id,
                        chatWith : findChatWith(participants, userAddress),
                        lastestMessageFrom : from,
                        lastestMessage : text_content,
                        lastestMessageTimeStamp : timestamp
                    };

                    customChatrooms.push(customChatroom);
                }
            }));
        });

        // Wait for all subcollection queries to complete
        await Promise.all(subCollectionPromises);

        console.log(`${currentDateAndTime}: There are ${customChatrooms.length} ongoing chats for user ${userAddress}`);
        
        return res.status(200).json(customChatrooms);

    } catch (error) {
        console.log(`${currentDateAndTime}: ${error.message}`);
        return res.status(500).send(error.message);
    }
});

// POST Request: Create a PrivateChatRoom document
// returns back the newly created document id 
router.post('/create-private-chatroom', async (req,res) => {
    try {
        const {currentUserAddress, secondUserAddress} = req.body
        
        // validation: can't create private chatroom with yourself
        if (currentUserAddress == secondUserAddress) {
            return res.status(400).json('Bad request: can not create a private chatroom with two same address')
        }

        // validation: can't create private chatroom with a same set of participants
        const q = query(PrivateChatRoomsRef, where("participants", "array-contains-any", [currentUserAddress, secondUserAddress]));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty != true) {
            return res.status(400).json(`Bad request: You aleardy engaged in a chat with ${secondUserAddress} `)
        }

        const data = { participants : [currentUserAddress, secondUserAddress] }

        const newDocRef = await addDoc(PrivateChatRoomsRef, data)
        console.log(`${currentDateAndTime}: Created new PrivateChatRoom with ID: ${newDocRef.id}`)
        return res.status(200).json(newDocRef.id)    

    } catch(error){
        console.log(`${currentDateAndTime}: ${error.message}`);
        return res.status(500).send(error.message);
    }
})

// POST Request: Send Message
// returns back the newly created Messages Document ID
router.post('/send-message', async (req,res) => {
    try {
        const {chatroomId, currentUserAddress, message_content} = req.body

        // find the second user address
        const chatroomDocRef = doc(db, "PrivateChatRooms", chatroomId)
        const chatroomSnap = await getDoc(chatroomDocRef)
        const secondUserAddress = findChatWith(chatroomSnap.data().participants,currentUserAddress)

        // create new Message Document
        const MessagesRef = collection(db, "PrivateChatRooms", chatroomId, "Messages")

        const data = {
            from : currentUserAddress,
            to : secondUserAddress,
            text_content : message_content,
            timestamp : serverTimestamp()
        }

        const newMessageRef = await addDoc(MessagesRef, data)
        console.log(`${currentDateAndTime}: Message sent with id: ${newMessageRef.id}`)
        return res.status(200).json(newMessageRef.id)

    } catch(error){
        console.log(`${currentDateAndTime}: ${error.message}`);
        return res.status(500).send(error.message);
    }
})

// POST Request: Add a Payment Request Type Message to Messages Collection
// returns back the 1. new payment request ID 2. new Message ID
router.post('/send-paymentRequest-message', async (req,res) => {
    try {
        // first Add a Payment Request Type message to Messages collection
        const {ether_amount, transaction_message} = req.body
        const {chatroomId,currentUserAddress} = req.body

        // find the second user address
        const chatroomDocRef = doc(db, "PrivateChatRooms", chatroomId)
        const chatroomSnap = await getDoc(chatroomDocRef)
        const secondUserAddress = findChatWith(chatroomSnap.data().participants,currentUserAddress)

        if (ether_amount <= 0){
            console.log(`${currentDateAndTime}: Invalid transaction amount`)
            return res.status(400).send("Invalid transaction amount")
        }

        if (currentUserAddress == secondUserAddress) {
            console.log(`${currentDateAndTime}: Invalid receipient: You are no allowed to send funds to your own address`)
            return res.status(400).send("Invalid receipient: You are no allowed to send funds to your own address")
        }

        const data = {
            payment_requester : currentUserAddress,
            request_recipient : secondUserAddress,
            ether_amount : ether_amount,
            transaction_message : transaction_message,
            transaction_state : "Pending",
            request_time: serverTimestamp(),
            transaction_completion_time: false,
            transaction_hash: false 
        }
        
        // Add a new payment request document with an auto-generated ID.
        const newDocumentRef = await addDoc(PaymentRequestRef, data)
        
        // add the newly created payment request document to Messages collection as a reference type document 
        // Create a reference to the newly created payment request document
        const paymentRequestRef = doc(db, "PaymentRequests", newDocumentRef.id);
        // Create the data for the message document
        const messageData = {
            payment_request_message : paymentRequestRef,
            timestamp : serverTimestamp(),
            from : currentUserAddress,
            to : secondUserAddress
        };

        const MessagesRef = collection(db, "PrivateChatRooms", chatroomId, "Messages")
        // Add a new message document with an auto-generated ID to the Messages collection
        const newMessageRef = await addDoc(MessagesRef, messageData);

        console.log(`${currentDateAndTime}: Added new payment request document with id: ${newDocumentRef.id}`)
        console.log(`${currentDateAndTime}: Added new Message document with id: ${newMessageRef.id}`)

        const result = {
            newPaymentRequestId : newDocumentRef.id,
            newMessageId : newMessageRef.id
        }

        return res.status(200).json(result)

    } catch(error){
        console.log(`${currentDateAndTime}: ${error.message}`);
        return res.status(500).send(error.message);
    }
})

// GET Request: Get payment request by payment request ref
router.post('/get-paymentRequset-byRef/', async (req,res) => {
    try {
        const {referenceDocRef} = request.body
        const referenceDocSnap = await getDoc(referenceDocRef)
        const referenceDocData = referenceDocSnap.data()
        return res.status(200).json(referenceDocData)
    } 
    catch(error) {
        console.log(`${currentDateAndTime}: ${error.message}`)
        return res.status(500).send(error.message)
    }
})



// GET Request: Testing GET Request: Review Referene type doc data structure
router.get('/get-paymentRequsetType-message/', async (req,res) => {
    try {
        const docRef = doc(db, "PrivateChatRooms", "CGieudoeTGi3fK0vVDgq", "Messages", "QLfHHDymr6d7pNHQRVbJ")
        const docSnap = await getDoc(docRef)
        const referenceedDocRef = docSnap.data().payment_request_message
        const referenceedDocSnap = await getDoc(referenceedDocRef)
        const referenceedDocData = referenceedDocSnap.data()
        return res.status(200).json(referenceedDocData)
    } 
    catch(error) {
        console.log(`${currentDateAndTime}: ${error.message}`)
        return res.status(500).send(error.message)
    }
})


/* ------------------------- PrivateChatRoom Helper Functions ------------------------- */
const findChatWith = (userList, userId) => {
    for (const user of userList) {
        if (user !== userId) {
            return user
        }
    }
}
/* ----- Start Server ----- */
app.use('/', router)

app.listen(PORT, ()=> {
    console.log(`Server listening on ${PORT}`)
})