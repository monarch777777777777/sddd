export interface Row {
  id: number;
  username: string;
  email: string;
}

export const COLUMN_USERNAME_SIZE = 32;
export const COLUMN_EMAIL_SIZE = 255;
// Calculated from C code: (PAGE_SIZE / ROW_SIZE_C) * TABLE_MAX_PAGES_C = (4096 / 293) * 100 approx 13 * 100 = 1300
export const TABLE_MAX_ROWS = 1300; 

export const DB_FILE_NAME = "db_next_data.json";

export type StatementType = 'insert' | 'select' | 'meta' | 'unknown' | 'error';

export interface ParsedStatement {
  type: StatementType;
  payload?: any;
  error?: string;
}

export type OutputLine = {
  id: string; // for react key
  type: 'command' | 'response' | 'error' | 'system';
  text: string;
};
