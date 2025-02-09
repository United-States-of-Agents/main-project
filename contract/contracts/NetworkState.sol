// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title   NetworkStateV2
 * @dev     Contract that handles a Agents Payment & Reputation System within a Network State of AI Agents.
 * 
 * The contract allows agents to stake a fixed amount of tokens to become active in the network.
 * Once active, agents can receive payments from users within the network state for completing tasks for them. 
 * 
 * The contract handles a reputation system where agents/users can rate & give feedbacks to agents that completed tasks for them.
 * 
 * Check Out NetworkStateV1: https://sepolia.basescan.org/address/0xcea14b51d4e2811b7799ff29a6b6b532f5b27a87
 * *V2 fixxes bugs in Reviewing Function from V1
 */
contract NetworkState is ReentrancyGuard {
    IERC20 public immutable token;
    uint256 public constant STAKE_AMOUNT = 10_000 ether; // Assuming token has 18 decimals
    uint256 public requestCounter;

    struct Agent {
        uint64 socialReputation;
        uint64 feedbackQuality;
        uint64 tasksCompleted;
        uint64 feedbacksCompleted;
        uint256 totalSpent;
        uint256 totalEarned;
        bool isActive;
    }

    struct User {
        uint64 feedbackQuality;
        uint64 feedbacksCompleted;
        uint256 totalSpent;
    }

    struct Request {
        uint256 id;
        uint256 tipAmount;
        uint64 feedback;
        address user;
        address agent;
        bool rejected;
        bool completed;
    }

    mapping(address => Agent) public agents;
    mapping(address => User) public users;
    mapping(uint256 => Request) public requests;
    mapping(address => uint256) public stakes;

    event Staked(address indexed agent, uint256 amount);
    event Unstaked(address indexed agent, uint256 amount);
    event TaskRequested(uint256 indexed requestId, address indexed user, address indexed agent, uint256 amount);
    event TaskAccepted(uint256 indexed requestId, address indexed agent);
    event TaskRejected(uint256 indexed requestId, address indexed agent);
    event TaskReviewed(uint256 indexed requestId, address indexed user, uint256 feedbackScore);

    modifier onlyAgent() {
        require(agents[msg.sender].isActive, "Not an active agent");
        _;
    }

    modifier onlyRequestUser(uint256 _id) {
        require(requests[_id].user == msg.sender, "Not request owner");
        _;
    }

    constructor(address _tokenAddress) {
        token = IERC20(_tokenAddress);
    }

    /**
     * @dev     Stake a fixed amount of tokens to become an active agent in the network.
     * @notice  This function requires the agent to have not staked before.
     */
    function stake() external nonReentrant {
        // Check if agent has already staked their tokens
        require(stakes[msg.sender] == 0, "Already staked");
        // Transfer Staked Tokens to the contract
        require(token.transferFrom(msg.sender, address(this), STAKE_AMOUNT), "Stake failed");

        // Activate the Agent into the Network State
        agents[msg.sender].isActive = true;
        stakes[msg.sender] = STAKE_AMOUNT;

        emit Staked(msg.sender, STAKE_AMOUNT);
    }

    /**
     * @dev     Unstake the fixed amount of tokens to remove the user from the network
     */
    function unstake() external nonReentrant onlyAgent {
        // Return staked tokens to the agent
        require(token.transfer(msg.sender, STAKE_AMOUNT), "Unstake failed");
        
        // Deactivate the Agent from the Network State
        agents[msg.sender].isActive = false;
        delete stakes[msg.sender];

        emit Unstaked(msg.sender, STAKE_AMOUNT);
    }

    /**
     * @dev     Request a Task from an agent with an allocated tip amount as payment for task completion.
     * 
     * The Payment will be held in escrow until Agent decides whether to accept or rehect the task.
     * 
     * @param _agent        Address of the requested AI Agent
     * @param _tipAmount    Amount of tokens to pay the agent
     */
    function payAgent(address _agent, uint256 _tipAmount) external nonReentrant {
        // Check if the address is a valid agent in the Network State
        require(agents[_agent].isActive, "Agent is not active");
        // Paid Amount must be greater than 0
        require(_tipAmount > 0, "Amount must be greater than zero");

        // Generate new Task Request for the Agent
        uint256 requestId = ++requestCounter;
        requests[requestId] = Request(requestId, _tipAmount, 0, msg.sender, _agent, false, false);

        // Transfer the paid amount to the contract (Escrow before task completion)
        require(token.transferFrom(msg.sender, address(this), _tipAmount), "Payment failed");

        emit TaskRequested(requestId, msg.sender, _agent, _tipAmount);
    }

    /**
     * @dev    Accept a Task Request from a User and complete the task.
     * 
     * Once accepted, the Escrow will transfer the tip amount to the Agent, and user willl be allowed to review the Task Completion.
     * 
     * @param _id   Task Request ID to be completed
     */
    function acceptTask(uint256 _id) external onlyAgent nonReentrant {
        // Check the Task Request
        Request storage req = requests[_id];
        require(req.agent == msg.sender, "Not your task");
        require(!req.rejected && !req.completed, "Task already handled");

        // Transfer the escrow fund to the Agent
        require(token.transfer(msg.sender, req.tipAmount), "Transfer failed");

        // Update the Agent & User Stats
        agents[msg.sender].totalEarned += req.tipAmount;
        agents[msg.sender].tasksCompleted++;
        users[req.user].totalSpent += req.tipAmount;

        // Uppdate Task Request Status to 'completed'
        req.completed = true;

        emit TaskAccepted(_id, msg.sender);
    }

    /**
     * @dev    Reject a Task Request from a User and refund the tip amount.
     * 
     * Once rejected, the Escrow will refund the tip amount to the User.
     * 
     * @param _id   Task Request ID to be rejected
     */
    function rejectTask(uint256 _id) external nonReentrant {
        // Check the Task Request
        Request storage req = requests[_id];
        require(req.agent == msg.sender || req.user == msg.sender, "Not authorized");
        require(!req.completed, "Task already completed");

        // Return the tip amount back to the User
        require(token.transfer(req.user, req.tipAmount), "Refund failed");

        // Update Task Request Status to 'rejected';
        req.rejected = true;

        emit TaskRejected(_id, req.agent);
    }

    /**
     * @dev    Review a Task Request from an Agent and provide feedback on the task completion.
     * 
     * The feedback score must be between 0 and 100.
     * 
     * @param _id               Task Request ID to be reviewed
     * @param _feedbackScore    Feedback Score for the Agent
     */
    function reviewTask(uint256 _id, uint64 _feedbackScore) external onlyRequestUser(_id) nonReentrant {
        // Check the Task Request
        Request storage req = requests[_id];
        require(req.completed, "Task not completed");
        require(req.feedback == 0, "Task already reviewed");
        require(_feedbackScore >=0 && _feedbackScore <= 10, "Invalid feedback score");

        // Update the Agent Stats
        agents[req.agent].feedbacksCompleted++;
        agents[req.agent].feedbackQuality += uint64(_feedbackScore);

        // Update the User Stats
        users[msg.sender].feedbacksCompleted++;
        users[msg.sender].feedbackQuality += uint64(_feedbackScore);

        emit TaskReviewed(_id, msg.sender, _feedbackScore);
    }
}
