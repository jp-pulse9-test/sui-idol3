// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PhotocardNFT
 * @dev ERC-721 NFT contract for Sui:Idol³ photocard cross-chain minting
 * @notice This contract allows minting of photocard NFTs bridged from Sui network
 */
contract PhotocardNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    // Mapping from Sui photocard ID to EVM token ID
    mapping(string => uint256) public suiToEvmTokenId;

    // Mapping to track if a Sui photocard has been minted
    mapping(string => bool) public isMinted;

    // Cross-chain bridge address (can be WalrusStorageProof or other authorized contracts)
    mapping(address => bool) public authorizedMinters;

    // Events
    event PhotocardMinted(
        uint256 indexed tokenId,
        address indexed recipient,
        string suiPhotocardId,
        string tokenURI
    );

    event MinterAuthorized(address indexed minter, bool authorized);

    /**
     * @dev Constructor
     * @param initialOwner Address of the contract owner
     */
    constructor(address initialOwner) ERC721("Sui Idol Photocard", "SIPC") Ownable(initialOwner) {
        // Authorize the deployer as initial minter
        authorizedMinters[initialOwner] = true;
    }

    /**
     * @dev Modifier to restrict function access to authorized minters only
     */
    modifier onlyAuthorizedMinter() {
        require(authorizedMinters[msg.sender], "PhotocardNFT: caller is not an authorized minter");
        _;
    }

    /**
     * @dev Authorize or revoke minter address
     * @param minter Address to authorize/revoke
     * @param authorized True to authorize, false to revoke
     */
    function setAuthorizedMinter(address minter, bool authorized) external onlyOwner {
        authorizedMinters[minter] = authorized;
        emit MinterAuthorized(minter, authorized);
    }

    /**
     * @dev Mint a new photocard NFT
     * @param recipient Address to receive the NFT
     * @param suiPhotocardId Unique ID from Sui network
     * @param tokenURI Metadata URI (IPFS/Walrus)
     * @return tokenId The minted token ID
     */
    function mintPhotocard(
        address recipient,
        string memory suiPhotocardId,
        string memory tokenURI
    ) external onlyAuthorizedMinter returns (uint256) {
        require(!isMinted[suiPhotocardId], "PhotocardNFT: photocard already minted");
        require(recipient != address(0), "PhotocardNFT: mint to zero address");
        require(bytes(suiPhotocardId).length > 0, "PhotocardNFT: invalid Sui photocard ID");
        require(bytes(tokenURI).length > 0, "PhotocardNFT: invalid token URI");

        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;

        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURI);

        suiToEvmTokenId[suiPhotocardId] = tokenId;
        isMinted[suiPhotocardId] = true;

        emit PhotocardMinted(tokenId, recipient, suiPhotocardId, tokenURI);

        return tokenId;
    }

    /**
     * @dev Batch mint multiple photocards (gas optimization)
     * @param recipients Array of recipient addresses
     * @param suiPhotocardIds Array of Sui photocard IDs
     * @param tokenURIs Array of metadata URIs
     */
    function batchMintPhotocards(
        address[] memory recipients,
        string[] memory suiPhotocardIds,
        string[] memory tokenURIs
    ) external onlyAuthorizedMinter {
        require(
            recipients.length == suiPhotocardIds.length &&
            recipients.length == tokenURIs.length,
            "PhotocardNFT: array length mismatch"
        );

        for (uint256 i = 0; i < recipients.length; i++) {
            if (!isMinted[suiPhotocardIds[i]]) {
                _tokenIdCounter++;
                uint256 tokenId = _tokenIdCounter;

                _safeMint(recipients[i], tokenId);
                _setTokenURI(tokenId, tokenURIs[i]);

                suiToEvmTokenId[suiPhotocardIds[i]] = tokenId;
                isMinted[suiPhotocardIds[i]] = true;

                emit PhotocardMinted(tokenId, recipients[i], suiPhotocardIds[i], tokenURIs[i]);
            }
        }
    }

    /**
     * @dev Get EVM token ID from Sui photocard ID
     * @param suiPhotocardId Sui photocard ID
     * @return tokenId EVM token ID (0 if not minted)
     */
    function getEvmTokenId(string memory suiPhotocardId) external view returns (uint256) {
        return suiToEvmTokenId[suiPhotocardId];
    }

    /**
     * @dev Check if a Sui photocard has been minted on this chain
     * @param suiPhotocardId Sui photocard ID
     * @return True if minted, false otherwise
     */
    function isPhotocardMinted(string memory suiPhotocardId) external view returns (bool) {
        return isMinted[suiPhotocardId];
    }

    /**
     * @dev Get total number of minted photocards
     * @return Total supply
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev Override to prevent token URI updates after minting (immutable metadata)
     */
    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal override {
        super._setTokenURI(tokenId, _tokenURI);
    }
}
