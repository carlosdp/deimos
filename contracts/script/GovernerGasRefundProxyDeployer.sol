// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "solmate/utils/CREATE3.sol";

import "../src/GovernorGasRefundProxy.sol";

contract GovernorGasRefundProxyDeployer {
    bytes32 private constant _salt = keccak256("GovernorGasRefundProxyV1");

    function deploy() external returns (address) {
        return CREATE3.deploy(_salt, type(GovernorGasRefundProxy).creationCode, 0);
    }

    function getDeployed() external view returns (address) {
        return CREATE3.getDeployed(_salt);
    }
}
