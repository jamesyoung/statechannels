pragma solidity ^0.4.24;

import "./SafeMath.sol";

contract Demo1 {
    using SafeMath for uint256;
    uint256 public count = 0;

    function click() public {
        count++;
    }
}
