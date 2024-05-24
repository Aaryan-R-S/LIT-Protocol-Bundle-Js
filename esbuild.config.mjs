import { build, analyzeMetafile } from "esbuild";

const go = async () => {
  let result = await build({
    // entryPoints: ["./src/index.js"],
    entryPoints: ["./src/index1.js"],
    bundle: true,
    minify: false,
    sourcemap: false,
    // outfile: "./dist/bundled.js",
    outfile: "./dist/bundled1.js",
    sourceRoot: "./",
    platform: "node",
    metafile: true,
    // external: ["ethers"],
    // inject: ["./esbuild-shims.js"],
  });
  // let text = await analyzeMetafile(result.metafile);
  // console.log(text);
};

go();