import chai, { expect } from "chai"
import { solidity } from "ethereum-waffle"
const chaiAsPromised = require("chai-as-promised")

chai.use(solidity)
chai.use(chaiAsPromised)

export { expect }
