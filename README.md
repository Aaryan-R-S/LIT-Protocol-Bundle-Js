This is repo to create a bundler for LIT Protocol. The bundler will be able to bundle all the files in a directory into a single file.

## Usage
1. Clone this repo
2. Run `npm install` to install the dependencies
3. Create `.env` file and fill in the following values:
```
ETHEREUM_WALLET_A_PUBLIC_KEY=<your-ethereum-wallet-a-public-key>
ETHEREUM_WALLET_A_PRIVATE_KEY=<your-ethereum-wallet-a-private-key>
SOLANA_WALLET_B_PRIVATE_KEY=<your-solana-wallet-b-private-key>
SOLANA_WALLET_C_PUBLIC_KEY=<your-solana-wallet-c-public-key>
```

4. To run the example, run the following command:
```bash
node encryptDecrypt.js
```
Note this example does the following steps:
- Decrypt a string which is Solana private key. You can get this from the Solana/web3 package
- The ACC is based on your Eth wallet NOT Solana
- Decrypt inside the Lit Action
- Use the decrypted Solana private key to sign a transaction using Solana/web3

5. To bundle the file run the following command:
```bash 
node ./esbuild.config.mjs
```
Note: Feel free to edit the `esbuild.config.mjs` file to bundle the files you want. See the comments in it.