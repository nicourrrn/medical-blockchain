// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract InsuranceNFT is ERC721, Ownable {
    uint256 public tokenCounter;
    mapping(address => bool) public insuredUsers;
    mapping(uint256 => uint256) public tokenToPremium;

    event InsurancePurchased(address indexed user, uint256 premium, uint256 tokenId);

    constructor() ERC721("InsuranceNFT", "INFT") Ownable(msg.sender) {
        tokenCounter = 1;
    }

    function purchaseInsurance() external payable {
        require(!insuredUsers[msg.sender], "Already insured");
        require(msg.value > 0, "Premium required");

        uint256 tokenId = tokenCounter;
        tokenCounter++;

        insuredUsers[msg.sender] = true;
        tokenToPremium[tokenId] = msg.value;

        _safeMint(msg.sender, tokenId);

        emit InsurancePurchased(msg.sender, msg.value, tokenId);
    }

    function getPremium(uint256 tokenId) external view returns (uint256) {
        return tokenToPremium[tokenId];
    }


    function withdrawFunds() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
