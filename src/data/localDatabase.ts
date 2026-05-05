import { LOCAL_DATABASE_KEY } from '../domains/constants'
import { createId } from '../utils/ids'
import type { AuditFields, CreateInput, Database, UpdateInput } from './database.types'
import { seedDatabase } from './seed'

type TableName = keyof Database
type DatabaseRecord = Record<TableName, AuditFields[]>

function cloneDatabase(database: Database): Database {
  return JSON.parse(JSON.stringify(database)) as Database
}

function readDatabase(): Database {
  const stored = localStorage.getItem(LOCAL_DATABASE_KEY)
  if (!stored) {
    const seeded = cloneDatabase(seedDatabase)
    localStorage.setItem(LOCAL_DATABASE_KEY, JSON.stringify(seeded))
    return seeded
  }

  return JSON.parse(stored) as Database
}

function writeDatabase(database: Database) {
  localStorage.setItem(LOCAL_DATABASE_KEY, JSON.stringify(database))
}

export const localDatabase = {
  list<T extends AuditFields>(table: TableName): T[] {
    const database = readDatabase()
    const records = (database as unknown as DatabaseRecord)[table]
    return [...records] as unknown as T[]
  },

  findById<T extends AuditFields>(table: TableName, id: string): T | undefined {
    return this.list<T>(table).find((record) => record.id === id)
  },

  create<T extends AuditFields>(table: TableName, data: CreateInput<T>): T {
    const database = readDatabase()
    const now = new Date().toISOString()
    const record = { ...data, id: createId(String(table)), createdAt: now, updatedAt: now } as T
    ;(database as unknown as DatabaseRecord)[table].push(record)
    writeDatabase(database)
    return record
  },

  update<T extends AuditFields>(table: TableName, id: string, data: UpdateInput<T>): T | undefined {
    const database = readDatabase()
    const collection = (database as unknown as DatabaseRecord)[table] as T[]
    const index = collection.findIndex((record) => record.id === id)

    if (index === -1) return undefined

    const updated = { ...collection[index], ...data, updatedAt: new Date().toISOString() }
    collection[index] = updated
    writeDatabase(database)
    return updated
  },

  delete(table: TableName, id: string) {
    const database = readDatabase()
    const mutableDatabase = database as unknown as DatabaseRecord
    mutableDatabase[table] = mutableDatabase[table].filter((record) => record.id !== id)
    writeDatabase(database)
  },
}
