const dotenv = require("dotenv");
dotenv.config();

const { getAccount, createAccount, executeCall } = require("../dist/index.js");

const ethers = require("ethers");
const RPC_URL = process.env.RPC;
const PK = process.env.PK;

const ERC721_ADDRESS = "0x02dE3E666a0901A31495025248E5C033D0846a0F";
const ERC1155_ADDRESS = "0xF62f36F9cE9fEAFa4E885A827dEd7d775D3027e9";

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

const erc1155Abi = [{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeBatchTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"}]
const erc1155Interface = new ethers.utils.Interface(erc1155Abi);

const erc721Id = "1";

const main = async () => {
  const node = new ethers.providers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PK);
  const account = wallet.connect(node);
  const recipient = "0xeeC5915A21DA64a58DE1e9a3D7dd7b8Bff775cF0";

  // create tba account with ERC721 tokenId
  const tbaTx = await createAccount(ERC721_ADDRESS, erc721Id, account);
  await tbaTx.wait();

  // get created account
  const tba = await getAccount(ERC721_ADDRESS, erc721Id, node);
  console.log(tba); // 0x5415B2d5910CaE8b509719d0964774eAF1102992

  // prepare transfer erc1155(token: 1, amount: 50) from TBA of erc721(tokenId: 1) into recipient
  let transferData = erc1155Interface.encodeFunctionData("safeTransferFrom", [
    "0x5415B2d5910CaE8b509719d0964774eAF1102992",
    recipient,
    "1", // tokenId
    "50", // amount
    "0x" // extended data
  ]);

  // execute transfer ERC1155 token
  let executeTx = await executeCall(
    "0x5415B2d5910CaE8b509719d0964774eAF1102992",
    ERC1155_ADDRESS,
    "0",
    transferData,
    account
  );
  await executeTx.wait();

  transferData = erc1155Interface.encodeFunctionData("safeBatchTransferFrom", [
    "0x5415B2d5910CaE8b509719d0964774eAF1102992",
    recipient,
    ["2", "3"], // tokenIds
    ["100", "150"], // amounts
    "0x" // extended data
  ]);

  executeTx = await executeCall(
    "0x5415B2d5910CaE8b509719d0964774eAF1102992",
    ERC1155_ADDRESS,
    "0",
    transferData,
    account
  );
  await executeTx.wait();
};

main();
