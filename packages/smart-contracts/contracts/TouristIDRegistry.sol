// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title TouristIDRegistry
 * @dev Smart contract for anchoring Digital Tourist ID hashes on-chain
 * @notice Stores only hash anchors and DID URIs, never PII data
 */
contract TouristIDRegistry {
    struct TouristRecord {
        bytes32 anchorHash;
        string didUri;
        uint256 timestamp;
        bool isActive;
    }

    // Mapping from subject address to their latest tourist record
    mapping(address => TouristRecord) public touristRecords;
    
    // Mapping from anchor hash to subject address for verification
    mapping(bytes32 => address) public hashToSubject;
    
    // Array to track all registered subjects
    address[] public registeredSubjects;
    
    // Events
    event Registered(
        address indexed subject,
        bytes32 indexed anchorHash,
        string didUri,
        uint256 timestamp
    );
    
    event Revoked(
        address indexed subject,
        bytes32 indexed anchorHash,
        uint256 timestamp
    );

    // Modifiers
    modifier onlyActiveRecord(address subject) {
        require(touristRecords[subject].isActive, "No active record found");
        _;
    }

    /**
     * @dev Register a new Digital Tourist ID anchor
     * @param anchorHash The hash anchor of the tourist's DID document
     * @param didUri The DID URI for the tourist
     */
    function register(bytes32 anchorHash, string memory didUri) external {
        require(anchorHash != bytes32(0), "Invalid anchor hash");
        require(bytes(didUri).length > 0, "DID URI cannot be empty");
        require(hashToSubject[anchorHash] == address(0), "Hash already registered");

        // If this is a new subject, add to registered list
        if (!touristRecords[msg.sender].isActive && touristRecords[msg.sender].timestamp == 0) {
            registeredSubjects.push(msg.sender);
        }

        // Update the tourist record
        touristRecords[msg.sender] = TouristRecord({
            anchorHash: anchorHash,
            didUri: didUri,
            timestamp: block.timestamp,
            isActive: true
        });

        // Map hash to subject for reverse lookup
        hashToSubject[anchorHash] = msg.sender;

        emit Registered(msg.sender, anchorHash, didUri, block.timestamp);
    }

    /**
     * @dev Get the latest record for a subject
     * @param subject The address of the subject
     * @return anchorHash The anchor hash
     * @return didUri The DID URI
     * @return timestamp The registration timestamp
     * @return isActive Whether the record is active
     */
    function getLatest(address subject) 
        external 
        view 
        returns (bytes32 anchorHash, string memory didUri, uint256 timestamp, bool isActive) 
    {
        TouristRecord memory record = touristRecords[subject];
        return (record.anchorHash, record.didUri, record.timestamp, record.isActive);
    }

    /**
     * @dev Verify an anchor hash exists and is active
     * @param anchorHash The hash to verify
     * @return subject The subject address
     * @return isValid Whether the hash is valid and active
     */
    function verifyHash(bytes32 anchorHash) 
        external 
        view 
        returns (address subject, bool isValid) 
    {
        address recordSubject = hashToSubject[anchorHash];
        if (recordSubject != address(0) && touristRecords[recordSubject].isActive) {
            return (recordSubject, true);
        }
        return (address(0), false);
    }

    /**
     * @dev Revoke a tourist's active record
     * @notice Only the subject themselves can revoke their record
     */
    function revoke() external onlyActiveRecord(msg.sender) {
        bytes32 currentHash = touristRecords[msg.sender].anchorHash;
        
        // Mark record as inactive
        touristRecords[msg.sender].isActive = false;
        
        // Clear reverse mapping
        delete hashToSubject[currentHash];

        emit Revoked(msg.sender, currentHash, block.timestamp);
    }

    /**
     * @dev Get total number of registered subjects
     * @return count The total count
     */
    function getTotalRegistered() external view returns (uint256 count) {
        return registeredSubjects.length;
    }

    /**
     * @dev Get registered subject by index
     * @param index The index in the registered subjects array
     * @return subject The subject address
     */
    function getRegisteredSubject(uint256 index) external view returns (address subject) {
        require(index < registeredSubjects.length, "Index out of bounds");
        return registeredSubjects[index];
    }

    /**
     * @dev Check if a subject has any record (active or inactive)
     * @param subject The address to check
     * @return exists Whether the subject has a record
     */
    function hasRecord(address subject) external view returns (bool exists) {
        return touristRecords[subject].timestamp > 0;
    }
}
