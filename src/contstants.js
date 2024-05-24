export const genActionSource = () => {
  return `(async () => {
    const privateKey = await Lit.Actions.decryptAndCombine({
      accessControlConditions,
      chain: 'ethereum',
      ciphertext,
      dataToEncryptHash,
      authSig: null,
      sessionSigs,
    });

    // const resp = await fetch(url);
    // let data = await resp.json();
    Lit.Actions.setResponse({ response: privateKey });
  })();`;
}

export const genActionSource2 = () => {
  return `(async()=>{const s=await Lit.Actions.decryptAndCombine({accessControlConditions,chain:"ethereum",ciphertext,dataToEncryptHash,authSig:null,sessionSigs});Lit.Actions.setResponse({response:s})})();`;
}

