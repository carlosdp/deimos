// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "multicall/Multicall.sol";

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


        address deployedAddress = deployer.getDeployed();
        GovernorGasRefundProxy proxy = GovernorGasRefundProxy(deployedAddress);

        vm.startBroadcast();
        token.mint(1 ether);
        token.delegate(msg.sender);
        vm.stopBroadcast();

        vm.startBroadcast();
        Multicall multicall = new Multicall();
        proxy.createPool{value: 0.5 ether}(address(governor), 0, 0);
        vm.stopBroadcast();

        console.log("Governor: %s", address(governor));
        console.log("GasRefundProxy: %s", deployedAddress);
        console.log("Multicall: %s", address(multicall));
        console.log("Token: %s", address(token));
    }
}
