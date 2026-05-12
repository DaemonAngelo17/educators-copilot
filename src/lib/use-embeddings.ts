import { Embeddings } from "@langchain/core/embeddings";
import * as tf from "@tensorflow/tfjs";
import * as use from "@tensorflow-models/universal-sentence-encoder";

let useModel: use.UniversalSentenceEncoder | null = null;

export class USEEmbeddings extends Embeddings {
  public onProgress?: (progress: number, message: string) => void;

  constructor() {
    super({});
  }

  async _getModel() {
    if (!useModel) {
      console.log("Loading Universal Sentence Encoder...");
      await tf.setBackend('cpu');
      useModel = await use.load();
      console.log("Universal Sentence Encoder loaded!");
    }
    return useModel;
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    const model = await this._getModel();
    const batchSize = 10;
    const results: number[][] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const currentBatch = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(texts.length / batchSize);
      
      const progress = Math.round((i / texts.length) * 100);
      const message = `Vectorizing batch ${currentBatch} of ${totalBatches}...`;
      
      console.log(message);
      if (this.onProgress) {
        this.onProgress(progress, message);
      }

      const embeddings = await model.embed(batch);
      const arrays = await embeddings.array();
      results.push(...arrays);
      
      // Yield to event loop
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    if (this.onProgress) {
      this.onProgress(100, "Vectorization complete!");
    }

    return results;
  }

  async embedQuery(text: string): Promise<number[]> {
    const model = await this._getModel();
    const embeddings = await model.embed([text]);
    const arrays = await embeddings.array();
    return arrays[0];
  }
}
