// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/DCAScheduler.sol";

/**
 * @title DeployDCAScheduler
 * @dev Deployment script for DCAScheduler contract
 */
contract DeployDCAScheduler is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address feeRecipient = vm.envAddress("FEE_RECIPIENT");
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy DCAScheduler contract
        DCAScheduler dcaScheduler = new DCAScheduler(feeRecipient);

        vm.stopBroadcast();

        // Log deployment information
        console.log("DCAScheduler deployed at:", address(dcaScheduler));
        console.log("Fee recipient:", feeRecipient);
        console.log("Deployer:", vm.addr(deployerPrivateKey));
    }
}
