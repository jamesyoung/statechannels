pragma solidity ^0.4.24;

import "./SafeMath.sol";

contract Demo5 {
    using SafeMath for uint256;

    address public hub;
    uint256 public percentageFee;

    struct Deposit {
        uint256 amount;
        uint256 timeout;
        bool complete;
        address payer;
    }

    mapping(bytes32 => Deposit) public payers;
    mapping(bytes32 => bool) public signatures;

    constructor(address _hub, uint256 _percentageFee) public {
        require(_hub != address(0x0));
        hub = _hub;
        percentageFee = _percentageFee;
    }

    function deposit(address payee, uint _timeout) public payable {
        bytes32 key = keccak256(msg.sender, payee);
        require(payers[key].complete == false, "Channel:deposit withdrawn");

        payers[key].amount = msg.value;
        payers[key].timeout = _timeout;
        payers[key].payer = msg.sender;
    }

    // NOTE: this is a basic contract for a quick demo, it's not secured at all!
    function withdraw(bytes32 _hash, bytes32 r, bytes32 s, uint8 v, uint256 value, address payer, address receiver) public {
        bytes32 key = keccak256(payer, hub);
        require(payers[key].amount >= value, "Channel:withdraw overdrawn");
        require(payers[key].complete == false, "Channel:withdraw withdrawn");

        // NOTE: prefixed message is required for personal signatures
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 proof = keccak256(abi.encodePacked(this, receiver, value));
        bytes32 prefixedProof = keccak256(abi.encodePacked(prefix, proof));
        require(prefixedProof == _hash, "Channel:withdraw invalid proof");

        address signer = ecrecover(_hash, v, r, s);
        require(signer == payer);

        payers[key].amount = payers[key].amount.sub(value);
        //payers[key].complete = true;
        receiver.transfer(value);
    }
}
