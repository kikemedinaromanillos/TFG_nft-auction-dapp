// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HelloWorld {
    string public message = "Hello, Hardhat!";

    function setMessage(string calldata _message) external {
        message = _message;
    }
}
