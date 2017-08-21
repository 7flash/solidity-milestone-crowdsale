const Token = artifacts.require("CrowdsaleMilestoneToken");

contract("CrowdsaleMilestoneToken", function([investor, wallet]) {
    it("should receive payments", async function () {
        let token = await Token.new(wallet, [0, 100, 10000, 0]);
        let value = web3.toWei(1, "ether");
        
        let investorBalanceBefore = await token.balanceOf(investor);
        let walletBalanceBefore = await web3.eth.getBalance(wallet);
        
        await token.sendTransaction({value: value, from: investor});
        
        let investorBalanceAfter = await token.balanceOf(investor);
        let walletBalanceAfter = await web3.eth.getBalance(wallet);
        

        assert.ok(investorBalanceAfter > investorBalanceBefore, "Investor should receive tokens");
        assert.ok(walletBalanceAfter > walletBalanceBefore, "Wallet should receive ether");
    });
    
    it("should change price over time", async function () {
        // {relative time, price for 1 wei in tokens}...
        let milestones = [
            0, 1000,
            10000, 500,
            20000, 100,
            30000, 0 // throw further payments
        ];
        let token = await Token.new(wallet, milestones);
        let value = web3.toWei(1, "wei");
        
        let initialBalance = await token.balanceOf(investor);
        
        await token.sendTransaction({value: value, from: investor});
        let firstBalance = await token.balanceOf(investor);
        
        await web3.currentProvider.send({jsonrpc: "2.0", method: "evm_increaseTime", params: [10000], id: 0})
        await token.sendTransaction({value: value, from: investor});
        let secondBalance = await token.balanceOf(investor);
        
        await web3.currentProvider.send({jsonrpc: "2.0", method: "evm_increaseTime", params: [10000], id: 0})
        await token.sendTransaction({value: value, from: investor});
        let thirdBalance = await token.balanceOf(investor);
        
        assert.equal(firstBalance.toString(), initialBalance.add(1000).toString(), "1000 tokens = 1 wei (in first period)");
        assert.equal(secondBalance.toString(), firstBalance.add(500).toString(), "500 tokens = 1 wei (in second period)");
        assert.equal(thirdBalance.toString(), secondBalance.add(100).toString(), "100 tokens = 1 wei (in third period)");
    });
});