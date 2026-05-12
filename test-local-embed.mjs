import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { env } from "@huggingface/transformers";

env.backends.onnx.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/';
env.backends.onnx.wasm.numThreads = 1;

async function test() {
  const embed = new HuggingFaceTransformersEmbeddings({
    modelName: "Xenova/all-MiniLM-L6-v2"
  });
  console.log("Embedding...");
  const res = await embed.embedQuery("hello world");
  console.log("Length:", res.length);
}
test();
