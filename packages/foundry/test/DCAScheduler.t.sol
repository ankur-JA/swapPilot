// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../contracts/DCAScheduler.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Mock ERC20 token for testing
contract MockToken is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 1000000 * 10**18);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

// Mock 1inch aggregator for testing
contract MockOneInchAggregator {
    function swap() external pure returns (uint256) {
        return 1 ether; // Return 1 ETH for testing
    }
}

contract DCASchedulerTest is Test {
    DCAScheduler public dcaScheduler;
    MockToken public usdc;
    MockToken public weth;
    MockOneInchAggregator public mockAggregator;
    
    address public user = address(0x1);
    address public feeRecipient = address(0x2);
    address public owner = address(0x3);

    event DCAStrategyCreated(
        uint256 indexed strategyId,
        address indexed user,
        address fromToken,
        address toToken,
        uint256 amountPerPeriod,
        uint256 periodLength
    );

    event DCAStrategyExecuted(
        uint256 indexed strategyId,
        address indexed user,
        uint256 amountInvested,
        uint256 tokensReceived
    );

    function setUp() public {
        // Deploy mock tokens
        usdc = new MockToken("USD Coin", "USDC");
        weth = new MockToken("Wrapped Ether", "WETH");
        
        // Deploy mock aggregator
        mockAggregator = new MockOneInchAggregator();
        
        // Deploy DCA scheduler
        vm.prank(owner);
        dcaScheduler = new DCAScheduler(feeRecipient);
        
        // Set mock aggregator
        vm.prank(owner);
        dcaScheduler.setOneInchAggregator(address(mockAggregator));
        
        // Mint tokens to user
        usdc.mint(user, 10000 * 10**18);
        weth.mint(user, 100 * 10**18);
        
        // Approve DCA scheduler to spend user's tokens
        vm.prank(user);
        usdc.approve(address(dcaScheduler), type(uint256).max);
    }

    function testCreateDCAStrategy() public {
        vm.prank(user);
        
        uint256 strategyId = dcaScheduler.createDCAStrategy(
            address(usdc),
            address(weth),
            100 * 10**18, // 100 USDC per period
            86400 // 1 day period
        );

        assertEq(strategyId, 1);
        
        DCAScheduler.DCAStrategy memory strategy = dcaScheduler.getStrategy(strategyId);
        assertEq(strategy.user, user);
        assertEq(strategy.fromToken, address(usdc));
        assertEq(strategy.toToken, address(weth));
        assertEq(strategy.amountPerPeriod, 100 * 10**18);
        assertEq(strategy.periodLength, 86400);
        assertTrue(strategy.isActive);
        assertEq(strategy.totalExecutions, 0);
        assertEq(strategy.totalInvested, 0);
    }

    function testCreateDCAStrategyInvalidParams() public {
        vm.prank(user);
        
        // Test with zero amount
        vm.expectRevert("Amount must be greater than 0");
        dcaScheduler.createDCAStrategy(
            address(usdc),
            address(weth),
            0,
            86400
        );

        // Test with invalid period length
        vm.expectRevert("Period must be at least 1 hour");
        dcaScheduler.createDCAStrategy(
            address(usdc),
            address(weth),
            100 * 10**18,
            3600 - 1
        );

        // Test with zero address tokens
        vm.expectRevert("Invalid from token");
        dcaScheduler.createDCAStrategy(
            address(0),
            address(weth),
            100 * 10**18,
            86400
        );
    }

    function testExecuteDCAStrategy() public {
        // Create strategy
        vm.prank(user);
        uint256 strategyId = dcaScheduler.createDCAStrategy(
            address(usdc),
            address(weth),
            100 * 10**18,
            86400
        );

        // Fast forward time to next execution
        vm.warp(block.timestamp + 86400);

        // Mock the swap data
        bytes memory swapData = abi.encodeWithSignature("swap()");

        // Execute strategy
        vm.prank(user);
        dcaScheduler.executeDCAStrategy(strategyId, swapData);

        // Check strategy state
        DCAScheduler.DCAStrategy memory strategy = dcaScheduler.getStrategy(strategyId);
        assertEq(strategy.totalExecutions, 1);
        assertEq(strategy.totalInvested, 100 * 10**18);
        assertTrue(strategy.nextExecution > block.timestamp);
    }

    function testPauseAndResumeStrategy() public {
        // Create strategy
        vm.prank(user);
        uint256 strategyId = dcaScheduler.createDCAStrategy(
            address(usdc),
            address(weth),
            100 * 10**18,
            86400
        );

        // Pause strategy
        vm.prank(user);
        dcaScheduler.pauseDCAStrategy(strategyId);

        DCAScheduler.DCAStrategy memory strategy = dcaScheduler.getStrategy(strategyId);
        assertFalse(strategy.isActive);

        // Resume strategy
        vm.prank(user);
        dcaScheduler.resumeDCAStrategy(strategyId);

        strategy = dcaScheduler.getStrategy(strategyId);
        assertTrue(strategy.isActive);
    }

    function testCancelStrategy() public {
        // Create strategy
        vm.prank(user);
        uint256 strategyId = dcaScheduler.createDCAStrategy(
            address(usdc),
            address(weth),
            100 * 10**18,
            86400
        );

        // Cancel strategy
        vm.prank(user);
        dcaScheduler.cancelDCAStrategy(strategyId);

        DCAScheduler.DCAStrategy memory strategy = dcaScheduler.getStrategy(strategyId);
        assertFalse(strategy.isActive);
    }

    function testGetUserStrategies() public {
        // Create multiple strategies
        vm.prank(user);
        uint256 strategyId1 = dcaScheduler.createDCAStrategy(
            address(usdc),
            address(weth),
            100 * 10**18,
            86400
        );

        vm.prank(user);
        uint256 strategyId2 = dcaScheduler.createDCAStrategy(
            address(usdc),
            address(weth),
            200 * 10**18,
            172800 // 2 days
        );

        uint256[] memory userStrategies = dcaScheduler.getUserStrategies(user);
        assertEq(userStrategies.length, 2);
        assertEq(userStrategies[0], strategyId1);
        assertEq(userStrategies[1], strategyId2);
    }

    function testIsStrategyReady() public {
        // Create strategy
        vm.prank(user);
        uint256 strategyId = dcaScheduler.createDCAStrategy(
            address(usdc),
            address(weth),
            100 * 10**18,
            86400
        );

        // Strategy should not be ready immediately
        assertFalse(dcaScheduler.isStrategyReady(strategyId));

        // Fast forward time
        vm.warp(block.timestamp + 86400);

        // Strategy should be ready now
        assertTrue(dcaScheduler.isStrategyReady(strategyId));
    }

    function testAdminFunctions() public {
        // Test setting fee percentage
        vm.prank(owner);
        dcaScheduler.setFeePercentage(50); // 0.5%
        assertEq(dcaScheduler.feePercentage(), 50);

        // Test setting fee recipient
        address newFeeRecipient = address(0x4);
        vm.prank(owner);
        dcaScheduler.setFeeRecipient(newFeeRecipient);
        assertEq(dcaScheduler.feeRecipient(), newFeeRecipient);

        // Test pausing contract
        vm.prank(owner);
        dcaScheduler.pause();
        assertTrue(dcaScheduler.paused());

        // Test unpausing contract
        vm.prank(owner);
        dcaScheduler.unpause();
        assertFalse(dcaScheduler.paused());
    }

    function testOnlyOwnerFunctions() public {
        // Test that only owner can call admin functions
        vm.prank(user);
        vm.expectRevert();
        dcaScheduler.setFeePercentage(50);

        vm.prank(user);
        vm.expectRevert();
        dcaScheduler.setFeeRecipient(address(0x4));

        vm.prank(user);
        vm.expectRevert();
        dcaScheduler.pause();
    }
}
