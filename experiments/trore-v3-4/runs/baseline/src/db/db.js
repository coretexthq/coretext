import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../trore.db');

let databaseInstance = null;

export function getDatabase() {
  if (!databaseInstance) {
    databaseInstance = new DatabaseSync(dbPath);
    databaseInstance.exec('PRAGMA foreign_keys = ON;');
  }
  return databaseInstance;
}

export const db = getDatabase();
