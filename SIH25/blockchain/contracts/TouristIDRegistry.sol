// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title TouristIDRegistry (Anchor Mode)
/// @notice Minimal per-subject anchor (hash + DID URI). No PII. Provides tamper‑evident integrity surface.
contract TouristIDRegistry is Ownable {
    struct Anchor {
        bytes32 anchorHash;   // Hash of canonical minimal DTID bundle
        string didUri;         // Off-chain DID document / metadata pointer
        uint64 updatedAt;      // Last write timestamp
        uint32 version;        // Starts at 1
    }

    mapping(address => Anchor) private _anchors; // subject => anchor

    event AnchorRegistered(address indexed subject, bytes32 anchorHash, string didUri, uint64 timestamp, uint32 version);
    event AnchorUpdated(address indexed subject, bytes32 anchorHash, string didUri, uint64 timestamp, uint32 version);

    constructor(address initialOwner) Ownable(initialOwner) {}

    /// Register first anchor for msg.sender.
    function register(bytes32 anchorHash, string calldata didUri) external {
        require(_anchors[msg.sender].version == 0, "ALREADY_REGISTERED");
        _anchors[msg.sender] = Anchor(anchorHash, didUri, uint64(block.timestamp), 1);
        emit AnchorRegistered(msg.sender, anchorHash, didUri, uint64(block.timestamp), 1);
    }

    /// Update (rotate) your own anchor.
    function update(bytes32 newAnchorHash, string calldata newDidUri) external {
        Anchor storage a = _anchors[msg.sender];
        require(a.version > 0, "NOT_REGISTERED");
        a.anchorHash = newAnchorHash;
        a.didUri = newDidUri;
        a.updatedAt = uint64(block.timestamp);
        a.version += 1;
        emit AnchorUpdated(msg.sender, newAnchorHash, newDidUri, a.updatedAt, a.version);
    }

    // -------------------------
    // Per-subject (server mediated) functions
    // Allow the contract owner (backend) to register/update anchors on behalf of tourists so mapping key is the tourist wallet, not the backend signer.
    // -------------------------

    /// Owner registers the first anchor for a tourist subject address.
    function registerFor(address subject, bytes32 anchorHash, string calldata didUri) external onlyOwner {
        require(_anchors[subject].version == 0, "ALREADY_REGISTERED");
        _anchors[subject] = Anchor(anchorHash, didUri, uint64(block.timestamp), 1);
        emit AnchorRegistered(subject, anchorHash, didUri, uint64(block.timestamp), 1);
    }

    /// Owner (or future delegated roles) updates existing tourist anchor.
    function updateFor(address subject, bytes32 newAnchorHash, string calldata newDidUri) external onlyOwner {
        Anchor storage a = _anchors[subject];
        require(a.version > 0, "NOT_REGISTERED");
        a.anchorHash = newAnchorHash;
        a.didUri = newDidUri;
        a.updatedAt = uint64(block.timestamp);
        a.version += 1;
        emit AnchorUpdated(subject, newAnchorHash, newDidUri, a.updatedAt, a.version);
    }

    /// Admin recovery / forced rotation.
    function adminUpdate(address subject, bytes32 newAnchorHash, string calldata newDidUri) external onlyOwner {
        Anchor storage a = _anchors[subject];
        require(a.version > 0, "NOT_REGISTERED");
        a.anchorHash = newAnchorHash;
        a.didUri = newDidUri;
        a.updatedAt = uint64(block.timestamp);
        a.version += 1;
        emit AnchorUpdated(subject, newAnchorHash, newDidUri, a.updatedAt, a.version);
    }

    function getLatest(address subject) external view returns (bytes32 anchorHash, string memory didUri, uint64 updatedAt, uint32 version) {
        Anchor memory a = _anchors[subject];
        return (a.anchorHash, a.didUri, a.updatedAt, a.version);
    }
}
