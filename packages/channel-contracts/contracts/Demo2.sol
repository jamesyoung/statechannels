pragma solidity ^0.4.24;

import "./SafeMath.sol";

contract Demo2 {
    using SafeMath for uint256;
    uint256 public count = 0;

    mapping(address => uint256) public clicks;

    function click(address _address, bytes32 _hash, bytes32 r, bytes32 s, uint8 v) public {
        require(_address == ecrecover(_hash, v, r, s), "Demo2:click signature verification failed");
        clicks[_address]++;
        count++;
    }
}
