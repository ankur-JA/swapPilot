//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import "../contracts/DCAScheduler.sol";

/**
 * @title DeployDCAScheduler
 * @dev Deployment script for DCAScheduler contract
 * @author Gearhead
 */
contract DeployDCAScheduler is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        // Set fee recipient (default to deployer if not set)
        address feeRecipient = deployer;
        
        // Deploy DCAScheduler contract
        DCAScheduler dcaScheduler = new DCAScheduler(feeRecipient);
        
        // Add to deployments array for export
        deployments.push(Deployment("DCAScheduler", address(dcaScheduler)));

        // Log deployment information
        console.log("DCAScheduler deployed at:", address(dcaScheduler));
        console.log("Fee recipient:", feeRecipient);
        console.log("Deployer:", deployer);
    }
}
