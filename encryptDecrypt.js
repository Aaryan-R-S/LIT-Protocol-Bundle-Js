const LitJsSdk = require("@lit-protocol/lit-node-client");
const { ethers } = require("ethers");
const { SiweMessage } = require("siwe");
const { LitNetwork } = require("@lit-protocol/constants");
const { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58');
const fs = require('fs');
const dotenv = require("dotenv");
const path = require("path");
const {
    LitActionResource,
    LitAccessControlConditionResource,
    LitAbility,
    createSiweMessageWithRecaps,
    generateAuthSig,
} = require("@lit-protocol/auth-helpers");
// const { genActionSource, genActionSource2 } = require("./src/contstants.js");

dotenv.config();

const litActionCode = fs.readFileSync("./dist/bundled1.js", "utf-8");
// console.log("litActionCode:", litActionCode);

class Lit {
    litNodeClient;

    constructor(client, chain, accessControlConditions){
        this.litNodeClient = client;
        this.chain = chain;
        this.accessControlConditions = accessControlConditions;
    }

    async connect() {
        LitJsSdk.disconnectWeb3();
        await this.litNodeClient.connect()
    }

    async getSessionSigsServer(){
        const walletWithCapacityCredit = new ethers.Wallet(
            process.env.ETHEREUM_WALLET_A_PRIVATE_KEY
        );
        const latestBlockhash = await this.litNodeClient.getLatestBlockhash();

        // // To mint a capacity delegation auth sig and use it in getSessionSigs to delegate it to pkp or some other wallet
        // const { capacityDelegationAuthSig } =
        // await client.createCapacityDelegationAuthSig({
        //   uses: '1',
        //   dAppOwnerWallet: walletWithCapacityCredit,
        //   capacityTokenId: '12342452454',
        //   delegateeAddresses: [],
        // });
        // console.log(capacityDelegationAuthSig)

        const authNeededCallback = async(params) => {
        if (!params.uri) {
            throw new Error("uri is required");
        }
        if (!params.expiration) {
            throw new Error("expiration is required");
        }

        if (!params.resourceAbilityRequests) {
            throw new Error("resourceAbilityRequests is required");
        }

        const toSign = await createSiweMessageWithRecaps({
            uri: params.uri,
            expiration: params.expiration,
            resources: params.resourceAbilityRequests,
            walletAddress: walletWithCapacityCredit.address,
            nonce: latestBlockhash,
            litNodeClient: this.litNodeClient,
        });

        const authSig = await generateAuthSig({
            signer: walletWithCapacityCredit,
            toSign,
        });
        // console.log("authSig:", authSig);
        return authSig;
        }

        // const litResource = new LitAccessControlConditionResource('*');

        const sessionSigs = await this.litNodeClient.getSessionSigs({
            chain: this.chain,
            resourceAbilityRequests: [
            {
                resource: new LitActionResource('*'),
                ability: LitAbility.LitActionExecution,
            },
            {
                resource: new LitAccessControlConditionResource('*'),
                ability: LitAbility.AccessControlConditionDecryption,
            }
            ],
            authNeededCallback,
        });
        console.log("sessionSigs:", sessionSigs);
        return sessionSigs
    }

    async encrypt(message) {
        const sessionSigs = await this.getSessionSigsServer();
        const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString(
        {
            accessControlConditions: this.accessControlConditions,
            chain: this.chain,
            dataToEncrypt: message,
            sessionSigs,
        },
        this.litNodeClient,
        );
        return {
        ciphertext,
        dataToEncryptHash,
        };
    }

    async decrypt(ciphertext, dataToEncryptHash) {
        const sessionSigs = await this.getSessionSigsServer();
        const decryptedString = await LitJsSdk.decryptToString(
        {
            accessControlConditions: this.accessControlConditions,
            chain: this.chain,
            ciphertext,
            dataToEncryptHash,
            sessionSigs,
        },
        this.litNodeClient,
        );
        return { decryptedString }
    }

    async decryptLitAction(ciphertext, dataToEncryptHash, mode) {
        const sessionSigs = await this.getSessionSigsServer();
            
        // // Decrypt the private key
        // const decryptedString = await LitJsSdk.decryptToString(
        //   {
        //     accessControlConditions: this.accessControlConditions,
        //     chain: this.chain,
        //     ciphertext,
        //     dataToEncryptHash,
        //     sessionSigs,
        //   },
        //   this.litNodeClient,
        // );
        // console.log("decryptedString:", decryptedString);

        // // Decrypt the private key inside a lit action
        const res = await this.litNodeClient.executeJs({
            sessionSigs,
            code: litActionCode,
            // code: genActionSource2(),
            jsParams: {
                accessControlConditions: this.accessControlConditions,
                ciphertext,
                dataToEncryptHash,
                sessionSigs,
                publicKey2: process.env.SOLANA_WALLET_C_PUBLIC_KEY,
            }
        });
        console.log("result from action execution:", res);

        return res.response;
    }
}

const runServerMode = async () => {
    const client = new LitJsSdk.LitNodeClient({
        litNetwork: LitNetwork.Cayenne,
        debug: true,
    });

    const chain = "ethereum";

    const accessControlConditions = [
        {
            contractAddress: "",
            standardContractType: "",
            chain,
            method: "",
            parameters: [":userAddress", "latest"],
            returnValueTest: {
            comparator: "=",
            value: process.env.ETHEREUM_WALLET_A_PUBLIC_KEY,
            },
        },  
    ];

    const message = process.env.SOLANA_WALLET_B_PRIVATE_KEY;

    let myLit = new Lit(client, chain, accessControlConditions);
    await myLit.connect();

    const { ciphertext, dataToEncryptHash } = await myLit.encrypt(message, "server");
    console.log("ciphertext: ", ciphertext);
    console.log("dataToEncryptHash: ", dataToEncryptHash);

    const data = await myLit.decryptLitAction(ciphertext, dataToEncryptHash, "server");
    console.log("decrypted data: ",data);
}

const signTransaction = async()=> {
    try {
        // Replace with your own private key in base58 format
        const privateKey = process.env.SOLANA_WALLET_B_PRIVATE_KEY;
        const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));

        const connection = new Connection('https://api.devnet.solana.com');
        
        // Fetch the recent blockhash
        const blockhash = (await connection.getLatestBlockhash()).blockhash;

        // Check your balance in lamports
        const balance = await connection.getBalance(keypair.publicKey);
        console.log('Balance:', balance/LAMPORTS_PER_SOL);

        const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: keypair.publicKey,
            toPubkey: process.env.SOLANA_WALLET_C_PUBLIC_KEY,
            lamports: 1000, // Amount in lamports (1 SOL = 1,000,000,000 lamports)
        })
        );

        transaction.feePayer = keypair.publicKey;
        transaction.recentBlockhash = blockhash;

        // Sign the transaction
        transaction.sign(keypair);

        // Send the transaction
        const signature = await connection.sendRawTransaction(transaction.serialize());
        await connection.confirmTransaction(signature);

        console.log('Transaction confirmed:', signature);
        return signature;
        // setMessage(`Transaction successful with signature: ${signature}`);
    } catch (error) {
        console.error('Transaction error:', error);
        // setMessage(`Error: ${error.message}`);
    }
};

// signTransaction();
runServerMode();
