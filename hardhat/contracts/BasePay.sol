// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract BasePay {
    // ------------------------------- Data Structures ------------------------------- //
    struct User {
        address userAddress;
        uint256 balance;
    }

    enum PaymentRequestState {
        Open,
        Rejected,
        Completed
    }
    enum PaymentRequestDecision {
        Accept,
        Reject
    }

    struct PaymentRequest {
        uint256 paymentRequestId;
        address payable fundReceiver;
        uint256 txAmount; // Transaction amount is in Ether instead of Wei
        PaymentRequestState paymentRequestState;
    }

    // ------------------------------- State Variables ------------------------------- //

    // a list of User struct to keep track of registered users
    User[] userList;

    // a list of PaymentRequest struct to keep track of initialed paymnent requests
    PaymentRequest[] paymentRequestList;

    // ------------------------------- Functions ------------------------------- //
    function registerAsUser() public {
        userList.push(User({userAddress: msg.sender, balance: 0}));
    }

    function getAllUser() public view returns (User[] memory) {
        return userList;
    }

    function topUpAccount() public payable {
        // find the user account first
        for (uint256 i = 0; i < userList.length; i++) {
            if (userList[i].userAddress == msg.sender) {
                userList[i].balance += msg.value;
            }
        }
    }

    // Please provide _txAmount in unit of Ether NOT Wei!
    function initiatePaymentRequest(uint256 _txAmount) public {
        paymentRequestList.push(
            PaymentRequest({
                paymentRequestId: paymentRequestList.length,
                fundReceiver: payable(msg.sender),
                txAmount: (_txAmount * 1 ether),
                paymentRequestState: PaymentRequestState.Open
            })
        );
    }

    function getAllPaymentRequest()
        public
        view
        returns (PaymentRequest[] memory)
    {
        return paymentRequestList;
    }

    function getPaymentRequest(uint256 _paymentRequestId)
        public
        view
        returns (PaymentRequest memory targetPaymentRequest)
    {
        for (uint256 i = 0; i < paymentRequestList.length; i++) {
            if (paymentRequestList[i].paymentRequestId == _paymentRequestId) {
                return paymentRequestList[i];
            }
        }
    }

    function handlePaymentRequest(
        uint256 _paymentRequestId,
        PaymentRequestDecision _paymentRequestDecision
    ) public payable {
        PaymentRequest memory targetPaymentRequest = getPaymentRequest(
            _paymentRequestId
        );
        if (_paymentRequestDecision == PaymentRequestDecision.Accept) {
            // handle transaction
            targetPaymentRequest.fundReceiver.transfer(
                targetPaymentRequest.txAmount
            );
            // update state variable - PaymentRequestState to "Completed" after successful txn
            // using for loop to locate target struct instead of using getPaymentRequest as we need to update the state variable
            // using getPaymentRequest can only update memory variable
            for (uint256 i = 0; i < paymentRequestList.length; i++) {
                if (
                    paymentRequestList[i].paymentRequestId == _paymentRequestId
                ) {
                    paymentRequestList[i]
                        .paymentRequestState = PaymentRequestState.Completed;
                }
            }

            if (_paymentRequestDecision == PaymentRequestDecision.Reject) {
                // update paymentRequestState to rejected after rejecting txn
                for (uint256 i = 0; i < paymentRequestList.length; i++) {
                    if (
                        paymentRequestList[i].paymentRequestId ==
                        _paymentRequestId
                    ) {
                        paymentRequestList[i]
                            .paymentRequestState = PaymentRequestState.Rejected;
                    }
                }
            }

            // ------------------------------- Modifiers ------------------------------- //
        }
    }
}
