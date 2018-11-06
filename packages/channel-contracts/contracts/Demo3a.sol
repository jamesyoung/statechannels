pragma solidity ^0.4.24;

import "./SafeMath.sol";

contract Demo3a {
    using SafeMath for uint256;

    address public hub;
    uint256 public percentageFee;

    struct Deposit {
        uint256 amount;
        uint256 timeout;
        bool complete;
        address payer;
        address payee;
    }
    mapping(address => Deposit) public payers;

    mapping(address => uint256) public clicks;

    constructor(address _hub, uint256 _percentageFee) public {
        require(_hub != address(0x0));
        hub = _hub;
        percentageFee = _percentageFee;
    }

    function deposit(uint _timeout, address _payee) public payable {
        require(payers[msg.sender].complete == false, "Channel:deposit withdrawn");

        payers[msg.sender].amount = msg.value;
        payers[msg.sender].timeout = _timeout;
        payers[msg.sender].payer = msg.sender;
        payers[msg.sender].payee = _payee;
    }

    function withdraw(bytes32 _hash, bytes32 r, bytes32 s, uint8 v, uint256 value, address payer) public {
        require(payers[payer].amount >= value, "Channel:withdraw overdrawn");
        require(payers[payer].complete == false, "Channel:withdraw withdrawn");

        // NOTE: prefixed message is required for personal signatures
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 proof = keccak256(abi.encodePacked(this, value));
        bytes32 prefixedProof = keccak256(abi.encodePacked(prefix, proof));
        require(prefixedProof == _hash, "Channel:withdraw invalid proof");

        address signer = ecrecover(_hash, v, r, s);
        require(signer == payer);
        uint256 fee = payers[payer].amount.mul(percentageFee).div(100);

        // TODO: debug
        // let depositer withdraw their unspent value from the channel after reaching timeout
        if (payers[payer].timeout > now && signer == payer) {
            //payers[payer].complete = true;
            //hub.transfer(fee);
            //payer.transfer(payers[payer].amount.sub(fee));
        }

        // TODO: debug
        // let payee withdraw before timeout the signed message value
        //if (payers[payer].timeout <= now && signer == payers[payer].payee) {
            payers[payer].complete = true;
            payers[payer].payee.transfer(value);
            if (fee >= payers[payer].amount.sub(value)) {
                hub.transfer(payers[payer].amount.sub(value));
            } else {
                hub.transfer(fee);
                payer.transfer(payers[payer].amount.sub(value).sub(fee));
            }
        //}
    }
}
