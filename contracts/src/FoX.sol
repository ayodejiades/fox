// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/// @notice SLA-gated streaming settlement. A buyer deposits once, then authorises payment for
/// past windows by signing off-chain how many of that window's seconds the feed was healthy.
/// The seller can only be paid for seconds the buyer itself attested to — there is nothing for
/// a seller to forge, because no claim is seller-self-reported. Trade-off, stated plainly: a
/// seller has no recourse if a buyer simply refuses to sign a window it experienced as healthy.
/// That griefing path is the v1 scope cut; a unilateral seller-claim path with a bonded
/// challenge window is the natural v2 (see repo README Roadmap).
contract FoX {
    using ECDSA for bytes32;
    using SafeERC20 for IERC20;

    IERC20 public immutable token;
    address public immutable seller;
    uint256 public immutable ratePerSecond; // token units per healthy second, in token's own decimals

    struct Session {
        uint256 balance;
        uint64 lastSettledAt;
        bool opened;
    }

    mapping(address => Session) public sessions;

    event Deposited(address indexed buyer, uint256 amount, uint256 newBalance);
    event Settled(address indexed buyer, uint64 windowStart, uint64 windowEnd, uint64 healthySeconds, uint256 amount);

    error SessionNotOpen();
    error BadWindow();
    error BadSignature();
    error OnlySeller();

    constructor(address _token, address _seller, uint256 _ratePerSecond) {
        token = IERC20(_token);
        seller = _seller;
        ratePerSecond = _ratePerSecond;
    }

    /// @notice Open (on first call) or top up a streaming session. Pulls `amount` of `token`
    /// from the caller, who must have approved this contract first.
    function deposit(uint256 amount) external {
        token.safeTransferFrom(msg.sender, address(this), amount);
        Session storage s = sessions[msg.sender];
        if (!s.opened) {
            s.opened = true;
            s.lastSettledAt = uint64(block.timestamp);
        }
        s.balance += amount;
        emit Deposited(msg.sender, amount, s.balance);
    }

    /// @notice Called by the seller to redeem a buyer-signed window. `signature` must recover
    /// to `buyer` over keccak256(this, buyer, windowStart, windowEnd, healthySeconds) as an
    /// eth-signed message. Windows must chain with no gaps or overlaps from the last settled
    /// timestamp, and healthySeconds can never exceed the window's wall-clock length. Payment
    /// is capped at the buyer's remaining balance rather than reverting, so a partially-funded
    /// buyer still pays out what it has.
    function settle(address buyer, uint64 windowStart, uint64 windowEnd, uint64 healthySeconds, bytes calldata signature)
        external
    {
        if (msg.sender != seller) revert OnlySeller();
        Session storage s = sessions[buyer];
        if (!s.opened) revert SessionNotOpen();
        if (windowStart != s.lastSettledAt || windowEnd <= windowStart || windowEnd > block.timestamp) revert BadWindow();
        if (healthySeconds > windowEnd - windowStart) revert BadWindow();

        bytes32 hash = keccak256(abi.encodePacked(address(this), buyer, windowStart, windowEnd, healthySeconds));
        bytes32 ethHash = MessageHashUtils.toEthSignedMessageHash(hash);
        if (ethHash.recover(signature) != buyer) revert BadSignature();

        uint256 amount = uint256(healthySeconds) * ratePerSecond;
        if (amount > s.balance) amount = s.balance;

        s.balance -= amount;
        s.lastSettledAt = windowEnd;

        if (amount > 0) token.safeTransfer(seller, amount);
        emit Settled(buyer, windowStart, windowEnd, healthySeconds, amount);
    }

    function balanceOf(address buyer) external view returns (uint256) {
        return sessions[buyer].balance;
    }

    function lastSettledAt(address buyer) external view returns (uint64) {
        return sessions[buyer].lastSettledAt;
    }
}
