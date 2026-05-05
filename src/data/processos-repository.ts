import {
  loadProcessosDatabase as loadLocalProcessosDatabase,
  ProcessosDatabase,
  saveProcessosDatabase as saveLocalProcessosDatabase,
} from './processos-db';

export interface ProcessosRepository {
  load(): ProcessosDatabase;
  save(database: ProcessosDatabase): void;
}

export const localStorageProcessosRepository: ProcessosRepository = {
  load() {
    return loadLocalProcessosDatabase();
  },
  save(database) {
    saveLocalProcessosDatabase(database);
  },
};

export function createProcessosRepository(): ProcessosRepository {
  return localStorageProcessosRepository;
}
