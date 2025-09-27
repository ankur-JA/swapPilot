// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title DCAScheduler
 * @dev Smart contract for Dollar Cost Averaging (DCA) functionality
 * @author Gearhead
 */
contract DCAScheduler is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    // DCA Strategy structure
    struct DCAStrategy {
        address user;
        address fromToken;      // Token to sell (e.g., USDC)
        address toToken;        // Token to buy (e.g., ETH)
        uint256 amountPerPeriod; // Amount to invest per period
        uint256 periodLength;   // Period length in seconds (e.g., 86400 for daily)
        uint256 nextExecution;  // Timestamp of next execution
        bool isActive;          // Whether strategy is active
        uint256 totalExecutions; // Total number of executions
        uint256 totalInvested;  // Total amount invested
        uint256 createdAt;      // Creation timestamp
    }

    // Events
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

    event DCAStrategyPaused(uint256 indexed strategyId, address indexed user);
    event DCAStrategyResumed(uint256 indexed strategyId, address indexed user);
    event DCAStrategyCancelled(uint256 indexed strategyId, address indexed user);

    // State variables
    uint256 public nextStrategyId = 1;
    mapping(uint256 => DCAStrategy) public strategies;
    mapping(address => uint256[]) public userStrategies;
    
    // Fee configuration
    uint256 public feePercentage = 25; // 0.25% (25 basis points)
    uint256 public constant FEE_DENOMINATOR = 10000;
    address public feeRecipient;

    // 1inch aggregator address (will be set by owner)
    address public oneInchAggregator;

    constructor(address _feeRecipient) {
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev Create a new DCA strategy
     * @param fromToken Token to sell
     * @param toToken Token to buy
     * @param amountPerPeriod Amount to invest per period
     * @param periodLength Period length in seconds
     */
    function createDCAStrategy(
        address fromToken,
        address toToken,
        uint256 amountPerPeriod,
        uint256 periodLength
    ) external whenNotPaused nonReentrant returns (uint256) {
        require(fromToken != address(0), "Invalid from token");
        require(toToken != address(0), "Invalid to token");
        require(amountPerPeriod > 0, "Amount must be greater than 0");
        require(periodLength >= 3600, "Period must be at least 1 hour");

        uint256 strategyId = nextStrategyId++;
        
        strategies[strategyId] = DCAStrategy({
            user: msg.sender,
            fromToken: fromToken,
            toToken: toToken,
            amountPerPeriod: amountPerPeriod,
            periodLength: periodLength,
            nextExecution: block.timestamp + periodLength,
            isActive: true,
            totalExecutions: 0,
            totalInvested: 0,
            createdAt: block.timestamp
        });

        userStrategies[msg.sender].push(strategyId);

        emit DCAStrategyCreated(
            strategyId,
            msg.sender,
            fromToken,
            toToken,
            amountPerPeriod,
            periodLength
        );

        return strategyId;
    }

    /**
     * @dev Execute a DCA strategy
     * @param strategyId ID of the strategy to execute
     * @param swapData Calldata for 1inch swap
     */
    function executeDCAStrategy(
        uint256 strategyId,
        bytes calldata swapData
    ) external whenNotPaused nonReentrant {
        DCAStrategy storage strategy = strategies[strategyId];
        
        require(strategy.isActive, "Strategy is not active");
        require(block.timestamp >= strategy.nextExecution, "Not time for execution yet");
        require(msg.sender == strategy.user || msg.sender == owner(), "Unauthorized");

        // Calculate fee
        uint256 fee = (strategy.amountPerPeriod * feePercentage) / FEE_DENOMINATOR;
        uint256 amountAfterFee = strategy.amountPerPeriod - fee;

        // Transfer fee to fee recipient
        if (fee > 0) {
            IERC20(strategy.fromToken).safeTransferFrom(
                strategy.user,
                feeRecipient,
                fee
            );
        }

        // Transfer remaining amount to contract
        IERC20(strategy.fromToken).safeTransferFrom(
            strategy.user,
            address(this),
            amountAfterFee
        );

        // Execute swap via 1inch
        (bool success, bytes memory returnData) = oneInchAggregator.call(swapData);
        require(success, "Swap failed");

        // Parse return data to get amount of tokens received
        uint256 tokensReceived = abi.decode(returnData, (uint256));

        // Update strategy state
        strategy.totalExecutions++;
        strategy.totalInvested += strategy.amountPerPeriod;
        strategy.nextExecution = block.timestamp + strategy.periodLength;

        emit DCAStrategyExecuted(
            strategyId,
            strategy.user,
            strategy.amountPerPeriod,
            tokensReceived
        );
    }

    /**
     * @dev Pause a DCA strategy
     * @param strategyId ID of the strategy to pause
     */
    function pauseDCAStrategy(uint256 strategyId) external {
        DCAStrategy storage strategy = strategies[strategyId];
        require(strategy.user == msg.sender, "Not strategy owner");
        require(strategy.isActive, "Strategy already paused");

        strategy.isActive = false;

        emit DCAStrategyPaused(strategyId, msg.sender);
    }

    /**
     * @dev Resume a paused DCA strategy
     * @param strategyId ID of the strategy to resume
     */
    function resumeDCAStrategy(uint256 strategyId) external {
        DCAStrategy storage strategy = strategies[strategyId];
        require(strategy.user == msg.sender, "Not strategy owner");
        require(!strategy.isActive, "Strategy already active");

        strategy.isActive = true;
        // Reset next execution to current time + period length
        strategy.nextExecution = block.timestamp + strategy.periodLength;

        emit DCAStrategyResumed(strategyId, msg.sender);
    }

    /**
     * @dev Cancel a DCA strategy permanently
     * @param strategyId ID of the strategy to cancel
     */
    function cancelDCAStrategy(uint256 strategyId) external {
        DCAStrategy storage strategy = strategies[strategyId];
        require(strategy.user == msg.sender, "Not strategy owner");

        strategy.isActive = false;

        emit DCAStrategyCancelled(strategyId, msg.sender);
    }

    /**
     * @dev Get all strategies for a user
     * @param user User address
     * @return Array of strategy IDs
     */
    function getUserStrategies(address user) external view returns (uint256[] memory) {
        return userStrategies[user];
    }

    /**
     * @dev Get strategy details
     * @param strategyId Strategy ID
     * @return Strategy details
     */
    function getStrategy(uint256 strategyId) external view returns (DCAStrategy memory) {
        return strategies[strategyId];
    }

    /**
     * @dev Check if a strategy is ready for execution
     * @param strategyId Strategy ID
     * @return True if ready for execution
     */
    function isStrategyReady(uint256 strategyId) external view returns (bool) {
        DCAStrategy memory strategy = strategies[strategyId];
        return strategy.isActive && block.timestamp >= strategy.nextExecution;
    }

    // Admin functions

    /**
     * @dev Set the 1inch aggregator address
     * @param _oneInchAggregator New aggregator address
     */
    function setOneInchAggregator(address _oneInchAggregator) external onlyOwner {
        require(_oneInchAggregator != address(0), "Invalid aggregator address");
        oneInchAggregator = _oneInchAggregator;
    }

    /**
     * @dev Set the fee percentage
     * @param _feePercentage New fee percentage in basis points
     */
    function setFeePercentage(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 1000, "Fee cannot exceed 10%"); // Max 10%
        feePercentage = _feePercentage;
    }

    /**
     * @dev Set the fee recipient address
     * @param _feeRecipient New fee recipient address
     */
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency function to withdraw tokens
     * @param token Token address
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }
}
