const { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58');

const signTransaction = async(privateKey, publicKey2)=> {
    try {
      // Replace with your own private key in base58 format
    //   const privateKey = process.env.REACT_APP_SOLANA_PRIVATE_KEY;
      const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));

      const connection = new Connection('https://api.devnet.solana.com');
      
      // Fetch the recent blockhash
      const { blockhash } = await connection.getRecentBlockhash();

      // Check your balance in lamports
      const balance = await connection.getBalance(keypair.publicKey);
      console.log('Balance:', balance/LAMPORTS_PER_SOL);

      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: keypair.publicKey,
      }).add(
        SystemProgram.transfer({
          fromPubkey: keypair.publicKey,
          toPubkey: new PublicKey(publicKey2),
          lamports: 1000, // Amount in lamports (1 SOL = 1,000,000,000 lamports)
        })
      );

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
  
const go = async () => {
    console.log("hello");
    
    const privateKey = await Lit.Actions.decryptAndCombine({
        accessControlConditions,
        chain: 'ethereum',
        ciphertext,
        dataToEncryptHash,
        authSig: null,
        sessionSigs,
    });
    console.log("privateKey: ", privateKey);

    const signature = await signTransaction(privateKey, publicKey2);
    console.log("signature: ", signature);

    Lit.Actions.setResponse({ response: signature });
};
  
go();