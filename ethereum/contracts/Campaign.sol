// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

contract CampaignFactory {
    address[] public deployedCampaigns;

    function createCampaign(uint minimum, string memory description, string memory title) public {
        Campaign newCampaign = new Campaign(minimum, msg.sender, description, title);
        deployedCampaigns.push(address(newCampaign));
    }

    function getDeployedCampaigns() public view returns(address[] memory) {
        return deployedCampaigns;
    }
}

contract Campaign {

    struct Request {
        string description;
        uint value;
        address recipient;
        bool complete;
        mapping(address => bool) approvals;
        uint approvalCount;
        bool isset;
    }

    mapping (uint => Request) public requests;
    uint public numRequests;
    address public manager;
    uint public minimumContribution;
    mapping(address => bool) public approvers;
    uint public approversCount;
    string public description;
    string public title;

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    constructor(
        uint minimum,
        address owner,
        string memory campaignDescription,
        string memory campaignTitle
    ) {
        manager = owner;
        minimumContribution = minimum;
        description = campaignDescription;
        title = campaignTitle;
    }

    function contribute() public payable {
        require(msg.value > minimumContribution);
        approvers[msg.sender] = true;
        approversCount++;
    }

    function createRequest(
        string memory requestDescription,
        uint value,
        address recipient
    ) public restricted {
        Request storage request = requests[numRequests++];
        request.description = requestDescription;
        request.value = value;
        request.recipient = recipient;
        request.complete = false;
        request.approvalCount = 0;
        request.isset = true;
    }

    function approveRequest(uint index) public {
        require(requests[index].isset);
        require(approvers[msg.sender]);
        require(!requests[index].approvals[msg.sender]);

        requests[index].approvals[msg.sender] = true;
        requests[index].approvalCount++;
    }

    function finalizeRequest(uint index) public restricted {
        Request storage request = requests[index];
        require(!request.complete);
        require(request.approvalCount > (approversCount / 2));
        payable(request.recipient).transfer(request.value);
        request.complete = true;
    }

    function getSummary() public view returns (
        uint, uint, uint, uint, address, string memory, string memory, address
    ) {
        return (
        minimumContribution,
        address(this).balance,
        numRequests,
        approversCount,
        manager,
        description,
        title,
        address(this)
        );
    }

    function getRequestsCount() public view returns (uint) {
        return numRequests;
    }
}