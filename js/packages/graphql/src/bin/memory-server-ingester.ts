import { config } from 'dotenv';
import { MemoryAdapter, MemoryWriter } from '../adapters/memory';
import { Ingester } from '../ingester';
import { MetaplexDataSource } from '../reader';
import { startApolloServer } from '../server';

const main = async () => {
  const ingester = new Ingester(MemoryWriter);
  const adapter = new MemoryAdapter(ingester);

  const api = new MetaplexDataSource(adapter);
  await startApolloServer(api);

  if (!process.env.DISABLE_MEM_WARMUP) {
    ingester.load();
  }
};

config();
main();
