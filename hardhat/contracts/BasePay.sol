// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract BasePay {
    // ------------------------------- Data Structures ------------------------------- //

    // ------------------------------- Events ------------------------------- //

    // ------------------------------- State Variables ------------------------------- //

    // ------------------------------- Functions ------------------------------- //
    function initiatePayment(address payable _paymentRecipient) public payable {
        require(_paymentRecipient !=  address(0), "Invalid address");
        require(msg.value > 0, "Payment amount must be greater than 0");

        _paymentRecipient.transfer(msg.value);
    }


    // ------------------------------- Modifiers ------------------------------- //
    

}
