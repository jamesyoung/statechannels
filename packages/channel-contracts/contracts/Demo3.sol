pragma solidity ^0.4.24;

import "./SafeMath.sol";

contract Demo3 {
    using SafeMath for uint256;

    address public hub;
    uint256 public percentageFee;

    struct Deposit {
        uint256 amount;
        uint256 timeout;
        bool complete;
        address payee;
    }
    mapping(address => Deposit) public payers;
    
    mapping(address => uint256) public clicks;

    constructor(address _hub, uint256 _percentageFee) public {
        hub = _hub;
        percentageFee = _percentageFee;
    }

    function deposit(uint _timeout, address _payee) public payable {
        require(payers[msg.sender].complete == false, "Demo3:deposit withdrawn");

        payers[msg.sender].amount = msg.value;
        payers[msg.sender].timeout = _timeout;
        payers[msg.sender].payee = _payee;
    }

    function withdraw(bytes32 _hash, bytes32 r, bytes32 s, uint8 v, uint256 value, address payer) public {
        require(payers[payer].amount >= value, "Demo3:withdraw overdrawn");
        require(payers[payer].complete == false, "Demo3:withdraw withdrawn");

        bytes32 proof = keccak256(abi.encodePacked(this, value));
        require(proof == _hash, "Demo3:withdraw invalid proof");

        address signer = ecrecover(_hash, v, r, s);
        uint256 fee = payers[payer].amount.mul(percentageFee).div(100);

        // let depositer withdraw their unspent value from the channel after reaching timeout 
        if (payers[payer].timeout > now && signer == payer) {
            payers[payer].complete = true;
            hub.transfer(fee);
            payer.transfer(payers[payer].amount.sub(fee));
        }

        // let payee withdraw before timeout the signed message value
        if (payers[payer].timeout <= now && signer == payers[payer].payee) {
            payers[payer].complete = true;
            
            payers[payer].payee.transfer(value);

            if (fee >= payers[payer].amount.sub(value)) {
                hub.transfer(payers[payer].amount.sub(value));
            } else {
                hub.transfer(fee);
                payer.transfer(payers[payer].amount.sub(value).sub(fee));
            }
        }
    }
}
