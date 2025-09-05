import { expect } from "chai";
import { ethers } from "hardhat";

describe("TouristIDRegistry", () => {
  it("registers and updates anchor", async () => {
    const [owner, user] = await ethers.getSigners();
    const F = await ethers.getContractFactory("TouristIDRegistry");
    const reg = await F.deploy(owner.address);
    await reg.deployed();

    const anchor1 = ethers.keccak256(ethers.toUtf8Bytes("anchor-1"));
    await (await reg.connect(user).register(anchor1, "did:example:123"));
    const latest1 = await reg.getLatest(user.address);
    expect(latest1[0]).to.equal(anchor1);
    expect(latest1[3]).to.equal(1n);

    const anchor2 = ethers.keccak256(ethers.toUtf8Bytes("anchor-2"));
    await (await reg.connect(user).update(anchor2, "did:example:456"));
    const latest2 = await reg.getLatest(user.address);
    expect(latest2[0]).to.equal(anchor2);
    expect(latest2[3]).to.equal(2n);

    // admin recovery
    const anchor3 = ethers.keccak256(ethers.toUtf8Bytes("anchor-3"));
    await (await reg.connect(owner).adminUpdate(user.address, anchor3, "did:example:789"));
    const latest3 = await reg.getLatest(user.address);
    expect(latest3[0]).to.equal(anchor3);
    expect(latest3[3]).to.equal(3n);
  });
});
