const ProxyCall = artifacts.require("ProxyCall");
const SomeLibrary = artifacts.require("SomeLibrary");
const truffleAssert = require("truffle-assertions");
const ethers = require("ethers");
const utils = ethers.utils;
const BN = require("bn.js");

contract("ProxyCall", accounts => {
  let proxy;
  let lib;
  const coder = new ethers.utils.AbiCoder();
  const owner = accounts[0];
  before(async () => {
    lib = await SomeLibrary.deployed();
    proxy = await ProxyCall.deployed(lib.address, { from: owner });
  });

  it("get owner should pass", () => {
    return proxy.owner().then(result => {
      assert.equal(result, owner, "owner not match");
    });
  });

  it("getMsgSender by delegatecall should pass", () => {
    // generate the function selector for getMsgSender()
    const data = utils.id("getMsgSender()").slice(0, 10);
    return proxy.sendTransaction({ from: accounts[1], data }).then(tx => {
      truffleAssert.eventEmitted(tx, "LogResult", ev => {
        // perform a case insensitive comparison of the address
        // for account[1] and the address logged in the event
        const regex = new RegExp(proxy.address.slice(2), "i");
        console.log(proxy.address);
        return regex.test(ev.result);
      });
    });
  });

  it("setVersion by delegatecall should pass", async () => {
    const expectedVersion = 3;
    // generate the function selector for setVersion
    const selector = utils.id("setVersion(uint256)").slice(0, 10);
    // encode the argument
    const versionData = coder.encode(["uint256"], [expectedVersion]);
    const data = utils.hexlify(utils.concat([selector, versionData]));
    await proxy.sendTransaction({ from: accounts[1], data });

    // check the value of owner, has it been changed? Why?
    const ownerResult = await proxy.owner();
    assert.equal(ownerResult, owner, "owner changed!!");

    // check if the version in lib is set
    const version = await lib.version();
    assert.equal(version.toString(), "3", "version mismatch");
  });
});