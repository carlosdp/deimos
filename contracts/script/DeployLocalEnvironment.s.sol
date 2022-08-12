// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "forge-std/console.sol";

import "../src/GovernorGasRefundProxy.sol";
import "../src/utils/TestToken.sol";
import "../src/utils/TestGovernor.sol";
import "./GovernerGasRefundProxyDeployer.sol";

contract DeployLocalEnvironment is Script {
    function setUp() public {}

    function run() public {
        vm.startBroadcast();
        GovernorGasRefundProxyDeployer deployer = new GovernorGasRefundProxyDeployer();
        deployer.deploy();
        TestToken token = new TestToken();
        TestGovernor governor = new TestGovernor(token);
        vm.stopBroadcast();

        console.log(address(governor));

        address deployedAddress = deployer.getDeployed();
        GovernorGasRefundProxy proxy = GovernorGasRefundProxy(deployedAddress);
        console.log(deployedAddress);

        vm.startBroadcast();
        token.mint(1 ether);
        token.delegate(msg.sender);
        vm.stopBroadcast();

        console.log(address(this));
        console.log(msg.sender);

        vm.startBroadcast();
        proxy.createPool{value: 0.5 ether}(address(governor), 0, 0);
        vm.stopBroadcast();
    }
}
