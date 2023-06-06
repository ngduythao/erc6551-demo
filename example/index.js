const dotenv = require("dotenv");
dotenv.config();

const { getAccount, createAccount, executeCall } = require("../dist/index.js");

const ethers = require("ethers");
const RPC_URL = process.env.RPC;
const PK = process.env.PK;
const NFT_ADDRESS = "0x040e646c218F593215e080bE9265E7f3087B82BE";

const erc721Abi = [
  {
    constant: false,
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
];
const erc721Interface = new ethers.utils.Interface(erc721Abi);

const tokenIds = ["394", "2186", "5266", "5274", "5746"];

const main = async () => {
  const node = new ethers.providers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PK);
  const account = wallet.connect(node);
  const recipient = "0x034e03c0EF68f7CEfcFd2704f69951FE59491980";

  // create tba account
  const tbaTx = await createAccount(NFT_ADDRESS, tokenIds[0], account);
  await tbaTx.wait();

  // get created account
  const tba = await getAccount(NFT_ADDRESS, tokenIds[0], node);
  console.log(account.address, recipient, tokenIds[3]);
  // prepare transfer data
  const transferData = erc721Interface.encodeFunctionData("transferFrom", [
    tba,
    recipient,
    tokenIds[3],
  ]);

  // transfer NFT
  const executeTx = await executeCall(
    tba,
    NFT_ADDRESS,
    "0",
    transferData,
    account
  );
  const res = await executeTx.wait();
  console.log(res);
};

main();
