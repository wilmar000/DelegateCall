const ProxyDelegate = artifacts.require("ProxyDelegate");
const SomeLibrary = artifacts.require("SomeLibrary");
const ProxyCall = artifacts.require("ProxyCall");

module.exports = function(deployer) {
  deployer
    .deploy(SomeLibrary)
    .then(() => deployer.deploy(ProxyDelegate, SomeLibrary.address));
  deployer
    .deploy(SomeLibrary)
    .then(() => deployer.deploy(ProxyCall, SomeLibrary.address));
};