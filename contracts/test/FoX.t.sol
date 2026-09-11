// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {FoX} from "../src/FoX.sol";
import {MockUSD} from "./mocks/MockUSD.sol";

/// @notice Acceptance criteria for FoX. This file is the definition of done for
/// contracts/src/FoX.sol — every test here must pass (`forge test`) before the contract
/// is considered complete. Do not weaken an assertion to make a test pass; fix the contract.
contract FoXTest is Test {
    FoX meter;
    MockUSD token;

    uint256 buyerPk = 0xB0B;
    address buyer;
    address seller = address(0x5E11E5);
    uint256 constant RATE = 1e15; // 0.001 mUSD per healthy second, 18 decimals

    function setUp() public {
        buyer = vm.addr(buyerPk);
        token = new MockUSD();
        meter = new FoX(address(token), seller, RATE);

        token.mint(buyer, 1000e18);
        vm.prank(buyer);
        token.approve(address(meter), type(uint256).max);
    }

    function _sign(uint64 windowStart, uint64 windowEnd, uint64 healthySeconds) internal view returns (bytes memory) {
        bytes32 hash = keccak256(abi.encodePacked(address(meter), buyer, windowStart, windowEnd, healthySeconds));
        bytes32 ethHash = MessageHashUtils.toEthSignedMessageHash(hash);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(buyerPk, ethHash);
        return abi.encodePacked(r, s, v);
    }

    function test_DepositOpensSessionAndIncreasesBalance() public {
        vm.prank(buyer);
        meter.deposit(100e18);
        assertEq(meter.balanceOf(buyer), 100e18);
        assertEq(meter.lastSettledAt(buyer), uint64(block.timestamp));
    }

    function test_SettleHealthyWindowPaysFullAmount() public {
        vm.prank(buyer);
        meter.deposit(100e18);

        uint64 start = uint64(block.timestamp);
        vm.warp(start + 10);
        uint64 end = uint64(block.timestamp);
        bytes memory sig = _sign(start, end, 10);

        vm.prank(seller);
        meter.settle(buyer, start, end, 10, sig);

        assertEq(token.balanceOf(seller), 10 * RATE);
        assertEq(meter.balanceOf(buyer), 100e18 - 10 * RATE);
        assertEq(meter.lastSettledAt(buyer), end);
    }

    function test_SettleBreachWindowPaysOnlyHealthySeconds() public {
        vm.prank(buyer);
        meter.deposit(100e18);

        uint64 start = uint64(block.timestamp);
        vm.warp(start + 10);
        uint64 end = uint64(block.timestamp);
        // window was 10 seconds long but only 4 were healthy — a mid-window breach
        bytes memory sig = _sign(start, end, 4);

        vm.prank(seller);
        meter.settle(buyer, start, end, 4, sig);

        assertEq(token.balanceOf(seller), 4 * RATE, "seller must not be paid for the breached seconds");
        assertEq(meter.balanceOf(buyer), 100e18 - 4 * RATE);
    }

    function test_SettleCapsAtBuyerBalanceInsteadOfReverting() public {
        vm.prank(buyer);
        meter.deposit(1 * RATE); // enough for exactly 1 healthy second

        uint64 start = uint64(block.timestamp);
        vm.warp(start + 10);
        uint64 end = uint64(block.timestamp);
        bytes memory sig = _sign(start, end, 10);

        vm.prank(seller);
        meter.settle(buyer, start, end, 10, sig);

        assertEq(token.balanceOf(seller), 1 * RATE, "payout must cap at the buyer's balance");
        assertEq(meter.balanceOf(buyer), 0);
        assertEq(meter.lastSettledAt(buyer), end, "window must still advance even when capped");
    }

    function test_SettleRevertsOnWrongSigner() public {
        vm.prank(buyer);
        meter.deposit(100e18);

        uint64 start = uint64(block.timestamp);
        vm.warp(start + 10);
        uint64 end = uint64(block.timestamp);

        uint256 attackerPk = 0xBAD;
        bytes32 hash = keccak256(abi.encodePacked(address(meter), buyer, start, end, uint64(10)));
        bytes32 ethHash = MessageHashUtils.toEthSignedMessageHash(hash);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(attackerPk, ethHash);
        bytes memory badSig = abi.encodePacked(r, s, v);

        vm.prank(seller);
        vm.expectRevert(FoX.BadSignature.selector);
        meter.settle(buyer, start, end, 10, badSig);
    }

    function test_SettleRevertsWhenCalledByNonSeller() public {
        vm.prank(buyer);
        meter.deposit(100e18);

        uint64 start = uint64(block.timestamp);
        vm.warp(start + 10);
        uint64 end = uint64(block.timestamp);
        bytes memory sig = _sign(start, end, 10);

        vm.prank(address(0xDEAD));
        vm.expectRevert(FoX.OnlySeller.selector);
        meter.settle(buyer, start, end, 10, sig);
    }

    function test_SettleRevertsOnReplayedWindow() public {
        vm.prank(buyer);
        meter.deposit(100e18);

        uint64 start = uint64(block.timestamp);
        vm.warp(start + 10);
        uint64 end = uint64(block.timestamp);
        bytes memory sig = _sign(start, end, 10);

        vm.prank(seller);
        meter.settle(buyer, start, end, 10, sig);

        // replaying the exact same window again must fail: lastSettledAt has moved to `end`,
        // so windowStart (`start`) no longer matches.
        vm.prank(seller);
        vm.expectRevert(FoX.BadWindow.selector);
        meter.settle(buyer, start, end, 10, sig);
    }

    function test_SettleRevertsWhenHealthySecondsExceedsWindowLength() public {
        vm.prank(buyer);
        meter.deposit(100e18);

        uint64 start = uint64(block.timestamp);
        vm.warp(start + 10);
        uint64 end = uint64(block.timestamp);
        bytes memory sig = _sign(start, end, 11); // claiming 11 healthy seconds in a 10s window

        vm.prank(seller);
        vm.expectRevert(FoX.BadWindow.selector);
        meter.settle(buyer, start, end, 11, sig);
    }

    function test_SettleRevertsWhenSessionNeverOpened() public {
        uint64 start = uint64(block.timestamp);
        vm.warp(start + 10);
        uint64 end = uint64(block.timestamp);
        bytes memory sig = _sign(start, end, 10);

        vm.prank(seller);
        vm.expectRevert(FoX.SessionNotOpen.selector);
        meter.settle(buyer, start, end, 10, sig);
    }

    function test_SettleRevertsWhenWindowEndInFuture() public {
        vm.prank(buyer);
        meter.deposit(100e18);

        uint64 start = uint64(block.timestamp);
        uint64 end = start + 100; // in the future relative to current block.timestamp
        bytes memory sig = _sign(start, end, 100);

        vm.prank(seller);
        vm.expectRevert(FoX.BadWindow.selector);
        meter.settle(buyer, start, end, 100, sig);
    }
}
