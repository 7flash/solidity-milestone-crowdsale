pragma solidity ^0.4.11;

import "./BasicToken.sol";

contract CrowdsaleMilestoneToken is BasicToken {
    string public constant name = "CrowdsaleMilestoneToken";
    string public constant symbol = "CMT";
    uint public constant decimals = 18;
    
    struct Milestone {
        uint time;
        uint price;
    }
    Milestone[10] public milestones;
    uint public constant MAX_MILESTONE = 10;
    uint public milestoneCount;

    address public wallet = 0x0;
    
    function CrowdsaleMilestoneToken(address destination, uint[] _milestones) {
        wallet = destination;
        setMilestones(_milestones);        
    }
    
    function () payable {
        createTokens(msg.sender);
    }
    
    function createTokens(address recipient) payable {
        if(msg.value == 0) {
            throw;   
        }
        
        uint tokens = msg.value.mul(getPrice());
        totalSupply = totalSupply.add(tokens);
        
        balances[recipient] = balances[recipient].add(tokens);
        
        if(!wallet.send(msg.value)) {
            throw;
        }
    }

    function getPrice() constant returns (uint result) {
        return getCurrentMilestone().price;
    }
    
    function setMilestones(uint[] _milestones) internal {
        if(_milestones.length % 2 == 1 || _milestones.length >= MAX_MILESTONE*2) {
            throw;
        }
        
        milestoneCount = _milestones.length / 2;
        
        uint lastTimestamp = 0;
        
        for(uint i = 0; i<_milestones.length/2; i++) {
            milestones[i].time = now + _milestones[i*2];
            milestones[i].price = _milestones[i*2+1];
            
            if((lastTimestamp != 0) && (milestones[i].time <= lastTimestamp)) {
                throw;
            }
            
            lastTimestamp = milestones[i].time;
        }
        
        if(milestones[milestoneCount - 1].price != 0) {
            throw;
        }
    }
    
    function getCurrentMilestone() private constant returns (Milestone) {
        for(uint i = 0; i < milestones.length; i++) {
            if(now < milestones[i].time) {
                return milestones[i-1];
            }
        }
    }
}
