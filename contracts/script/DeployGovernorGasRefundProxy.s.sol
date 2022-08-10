// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "forge-std/console.sol";

import "./GovernerGasRefundProxyDeployer.sol";

contract DeployGovernorGasRefundProxy is Script {
    function setUp() public {}

    function run() public {
        vm.startBroadcast();
        GovernorGasRefundProxyDeployer deployer = new GovernorGasRefundProxyDeployer();
        deployer.deploy();
        vm.stopBroadcast();

        address deployedAddress = deployer.getDeployed();

        console.log("Deployed to:");
        console.log(deployedAddress);
    }
}
