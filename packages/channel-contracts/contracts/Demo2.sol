pragma solidity ^0.4.24;

import "./SafeMath.sol";

contract Demo2 {
    using SafeMath for uint256;
    uint256 public count = 0;

    mapping(address => uint256) public clicks;

    function click(bytes32 _hash, uint8 v, bytes32 r, bytes32 s) public {
        require(msg.sender == ecrecover(_hash, v, r, s), "Demo2:click verification failed");
        clicks[msg.sender]++;
        count++;
    }
}
