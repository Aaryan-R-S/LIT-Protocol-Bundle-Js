// src/index.js
var go = async () => {
  console.log("hello");
  const privateKey = await Lit.Actions.decryptAndCombine({
    accessControlConditions,
    chain: "ethereum",
    ciphertext,
    dataToEncryptHash,
    authSig: null,
    sessionSigs
  });
  console.log("privateKey: ", privateKey);
  Lit.Actions.setResponse({ response: privateKey });
};
go();
