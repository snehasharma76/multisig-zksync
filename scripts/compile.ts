import { HardhatRuntimeEnvironment } from "hardhat/types";
import * as hre from "hardhat";

async function main() {
  console.log(`\nCompiling contracts...`);
  await hre.run("compile");
  console.log("Compilation completed!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
