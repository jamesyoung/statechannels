pragma solidity ^0.4.24;

import "./SafeMath.sol";

contract Demo4 {
    using SafeMath for uint256;

    address public hub;
    uint256 public percentageFee;

    struct Deposit {
        uint256 amount;
        uint256 timeout;
        bool complete;
        address payer;
    }

    mapping(address => Deposit) public payers;
    mapping(bytes32 => bool) public signatures;

    constructor(address _hub, uint256 _percentageFee) public {
        require(_hub != address(0x0));
        hub = _hub;
        percentageFee = _percentageFee;
    }

    function deposit(uint _timeout) public payable {
        require(payers[msg.sender].complete == false, "Channel:deposit withdrawn");

        payers[msg.sender].amount = msg.value;
        payers[msg.sender].timeout = _timeout;
        payers[msg.sender].payer = msg.sender;
    }

    // NOTE: this is a basic contract for a quick demo, it's not secured at all!
    function withdraw(bytes32 _hash, bytes32 r, bytes32 s, uint8 v, uint256 value, address payer, address receiver) public {
        require(payers[payer].amount >= value, "Channel:withdraw overdrawn");
        require(payers[payer].complete == false, "Channel:withdraw withdrawn");

        // NOTE: prefixed message is required for personal signatures
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 proof = keccak256(abi.encodePacked(this, receiver, value));
        bytes32 prefixedProof = keccak256(abi.encodePacked(prefix, proof));
        require(prefixedProof == _hash, "Channel:withdraw invalid proof");

        address signer = ecrecover(_hash, v, r, s);
        require(signer == payer || signer == hub);
        uint256 fee = payers[payer].amount.mul(percentageFee).div(100);

        payers[payer].amount = payers[payer].amount.sub(value);
        //payers[payer].complete = true;
        receiver.transfer(value);
    }
}
