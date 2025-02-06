const { expect } = require("chai");
const { ethers } = require("hardhat");

const {ERC20} = require('@openzeppelin/contracts/build/contracts/ERC20.json');
const { ProviderWrapper } = require("hardhat/plugins");

describe("NetworkState Contract", function () {
    let NetworkState, networkState, token, owner, agent, user;
    const STAKE_AMOUNT = ethers.parseEther("10000");
    const TIP_AMOUNT = ethers.parseEther("100");
    
    const FUND_AMOUNT = ethers.parseEther("1000000")

    beforeEach(async function () {
        [owner, agent, user] = await ethers.getSigners();

        // Deploy mock token
        const USAToken = await ethers.getContractFactory("USA");
        token = await USAToken.deploy();
        await token.waitForDeployment();

        // Deploy NetworkState
        NetworkState = await ethers.getContractFactory("NetworkState");
        networkState = await NetworkState.deploy(await token.getAddress());
        await networkState.waitForDeployment();

        // Fund Agent & User with tokens
        await token.transfer(agent.address, STAKE_AMOUNT);
        await token.transfer(user.address, TIP_AMOUNT);
    });

    describe("1. Agent Creation: Staking & Unstaking", function () {
        it("Agents should be able to stake and activate their profile", async function () {
            await token.connect(agent).approve(await networkState.getAddress(), STAKE_AMOUNT);
            await expect(networkState.connect(agent).stake())
                .to.emit(networkState, "Staked")
                .withArgs(agent.address, STAKE_AMOUNT);

            const agentData = await networkState.agents(agent.address);
            expect(agentData.isActive).to.be.true;
            expect(await networkState.stakes(agent.address)).to.equal(STAKE_AMOUNT);
        });

        it("Agents should not be able to stake twice", async function () {
            await token.connect(agent).approve(await networkState.getAddress(), STAKE_AMOUNT);
            await networkState.connect(agent).stake();
            await expect(networkState.connect(agent).stake()).to.be.revertedWith("Already staked");
        });

        it("Agents should be able to unstake", async function () {
            await token.connect(agent).approve(await networkState.getAddress(), STAKE_AMOUNT);
            await networkState.connect(agent).stake();
            await expect(networkState.connect(agent).unstake())
                .to.emit(networkState, "Unstaked")
                .withArgs(agent.address, STAKE_AMOUNT);

            expect(await networkState.stakes(agent.address)).to.equal(0);
        });

    });

    describe("2. Agent Payment: Task Requests & Accept/Reject", function () {
        beforeEach(async function () {
            await token.connect(agent).approve(await networkState.getAddress(), STAKE_AMOUNT);
            await networkState.connect(agent).stake();
        });

        it("Users should be able to request a service by paying an agent", async function () {
            await token.connect(user).approve(await networkState.getAddress(), TIP_AMOUNT);
            await expect(networkState.connect(user).payAgent(agent.address, TIP_AMOUNT))
                .to.emit(networkState, "TaskRequested");

            const request = await networkState.requests(1);
            expect(request.user).to.equal(user.address);
            expect(request.agent).to.equal(agent.address);
        });

        it("Agents should be able to accept a request and receive funds", async function () {
            await token.connect(user).approve(await networkState.getAddress(), TIP_AMOUNT);
            await networkState.connect(user).payAgent(agent.address, TIP_AMOUNT);

            await expect(networkState.connect(agent).acceptTask(1))
                .to.emit(networkState, "TaskAccepted");

            expect(await token.balanceOf(agent.address)).to.equal(TIP_AMOUNT);
        });

        it("Agents or users should be able to reject a request and refund user", async function () {
            await token.connect(user).approve(await networkState.getAddress(), TIP_AMOUNT);
            await networkState.connect(user).payAgent(agent.address, TIP_AMOUNT);

            await expect(networkState.connect(agent).rejectTask(1))
                .to.emit(networkState, "TaskRejected");

            expect(await token.balanceOf(user.address)).to.equal(TIP_AMOUNT);
        });

        it("Agent should not accept a request twice", async function () {
            await token.connect(user).approve(await networkState.getAddress(), TIP_AMOUNT);
            await networkState.connect(user).payAgent(agent.address, TIP_AMOUNT);
            await networkState.connect(agent).acceptTask(1);

            await expect(networkState.connect(agent).acceptTask(1)).to.be.revertedWith("Task already handled");
        });
    });

    describe("3. Agent Feedbacks: Reviewing Completed Tasks", function () {
        
        beforeEach(async function () {
            await token.connect(agent).approve(await networkState.getAddress(), STAKE_AMOUNT);
            await networkState.connect(agent).stake();

            await token.connect(user).approve(await networkState.getAddress(), TIP_AMOUNT);
            await networkState.connect(user).payAgent(agent.address, TIP_AMOUNT);
            await networkState.connect(agent).acceptTask(1);
        });

        it("Users should be able to leave feedback after task completion", async function () {
            await expect(networkState.connect(user).reviewTask(1, 8))
                .to.emit(networkState, "TaskReviewed");

            const agentData = await networkState.agents(agent.address);
            expect(agentData.feedbackQuality).to.be.above(0);
        });

        it("Users cannot leave feedback for a rejected task", async function () {
            await token.transfer(user.address, TIP_AMOUNT);
            await token.connect(user).approve(await networkState.getAddress(), TIP_AMOUNT);
            await networkState.connect(user).payAgent(agent.address, TIP_AMOUNT);
            await networkState.connect(agent).rejectTask(2);

            await expect(networkState.connect(user).reviewTask(2, 8)).to.be.revertedWith("Task not completed");
        });
    });
});
