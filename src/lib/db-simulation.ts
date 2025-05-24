import type { Row, ParsedStatement } from '@/types/db';
import { COLUMN_USERNAME_SIZE, COLUMN_EMAIL_SIZE, TABLE_MAX_ROWS, DB_FILE_NAME } from '@/types/db';

let database: Row[] = [];

export function initializeDatabase(): string {
  if (typeof window !== 'undefined') {
    try {
      const storedData = localStorage.getItem(DB_FILE_NAME);
      if (storedData) {
        database = JSON.parse(storedData);
        return `Database loaded from ${DB_FILE_NAME}. Rows: ${database.length}.`;
      } else {
        database = [];
        return `New database initialized. Stored in ${DB_FILE_NAME} on exit.`;
      }
    } catch (error) {
      console.error("Failed to load database from localStorage:", error);
      database = [];
      return "Error loading database from localStorage. Using empty database.";
    }
  }
  database = [];
  return "Database initialized (server-side or localStorage unavailable). Data will not persist.";
}

function persistDatabase(): string {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(DB_FILE_NAME, JSON.stringify(database));
      return `Database saved to ${DB_FILE_NAME}.`;
    } catch (error) {
      console.error("Failed to save database to localStorage:", error);
      return "Error saving database to localStorage.";
    }
  }
  return "localStorage not available. Data not saved.";
}

export function parseCommand(input: string): ParsedStatement {
  const trimmedInput = input.trim();
  const parts = trimmedInput.split(/\s+/);
  const command = parts[0]?.toLowerCase();

  if (!command) {
    return { type: 'error', error: 'Empty command.' };
  }

  if (command.startsWith('.')) {
    if (command === '.exit') {
      return { type: 'meta', payload: 'exit' };
    }
    return { type: 'error', error: `Unrecognized meta-command '${command}'.` };
  }

  if (command === 'insert') {
    if (parts.length !== 4) {
      return { type: 'error', error: 'Syntax error. Usage: insert <id> <username> <email>' };
    }
    const id = parseInt(parts[1]);
    if (isNaN(id)) {
      return { type: 'error', error: 'Syntax error: ID must be a number.' };
    }
    if (id < 0) {
      return { type: 'error', error: 'ID must be positive.' };
    }
    const username = parts[2];
    const email = parts[3];
    if (username.length > COLUMN_USERNAME_SIZE) {
      return { type: 'error', error: `Username too long (max ${COLUMN_USERNAME_SIZE} chars).` };
    }
    if (email.length > COLUMN_EMAIL_SIZE) {
      return { type: 'error', error: `Email too long (max ${COLUMN_EMAIL_SIZE} chars).` };
    }
    return { type: 'insert', payload: { id, username, email } };
  }

  if (command === 'select') {
    if (parts.length > 1) {
      return { type: 'error', error: 'Syntax error: select command does not take arguments.' };
    }
    return { type: 'select' };
  }

  return { type: 'error', error: `Unrecognized keyword at start of '${trimmedInput}'.` };
}

export function executeInsert(row: Row): string {
  if (database.length >= TABLE_MAX_ROWS) {
    return 'Error: Table full.';
  }
  if (database.some(r => r.id === row.id)) {
    return `Error: Row with ID ${row.id} already exists.`;
  }
  database.push(row);
  return 'Executed.';
}

export function executeSelect(): Row[] {
  return [...database]; // Return a copy
}

export function handleMetaCommand(command: string): string {
  if (command === 'exit') {
    const saveMessage = persistDatabase();
    return `Exiting session. ${saveMessage}`;
  }
  return `Unrecognized meta-command '${command}'.`;
}
