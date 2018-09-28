pragma solidity ^0.4.24;

import "./SafeMath.sol";


contract Channel {
    using SafeMath for uint256;

    address hub;
    uint256 percentageFee;

    struct Deposit {
        uint256 amount;
        uint256 timeout;
        bool complete;
        address payee;
    }
    mapping(address => Deposit) public payers;
    
    constructor(address _hub, uint256 _percentageFee) public {
        hub = _hub;
        percentageFee = _percentageFee;
    }

    function deposit(uint _timeout, address _payee) public payable {
        require(payers[msg.sender].complete == false, "SmartIO:deposit withdrawn");

        payers[msg.sender].amount = msg.value;
        payers[msg.sender].timeout = _timeout;
        payers[msg.sender].payee = _payee;
    }

    function withdraw(bytes32 h, uint8 v, bytes32 r, bytes32 s, uint256 value, address payer) public {
        require(payers[payer].amount >= value, "SmartIO:withdraw overdrawn");
        require(payers[payer].complete == false, "SmartIO:withdraw withdrawn");

        bytes32 proof = keccak256(abi.encodePacked(this, value));
        require(proof == h, "invalid proof");

        address signer = ecrecover(h, v, r, s);
        uint256 fee = payers[payer].amount.mul(percentageFee).div(100);

        if (payers[payer].timeout > now && signer == payer) {
            payers[payer].complete = true;
            hub.transfer(fee);
            payer.transfer(payers[payer].amount.sub(fee));
        }

        if (payers[payer].timeout <= now && signer == payers[payer].payee) {
            payers[payer].complete = true;
            hub.transfer(fee);
            payers[payer].payee.transfer(payers[payer].amount);
        }
    }
}
