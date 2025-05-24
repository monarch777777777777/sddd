"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  parseCommand,
  executeInsert,
  executeSelect,
  handleMetaCommand,
  initializeDatabase,
} from '@/lib/db-simulation';
import type { Row, OutputLine } from '@/types/db';
import { SendHorizontal } from 'lucide-react';

const PROMPT = "db >";

export default function DbTerminal() {
  const [inputValue, setInputValue] = useState('');
  const [outputLines, setOutputLines] = useState<OutputLine[]>([]);
  const [isExited, setIsExited] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initMessage = initializeDatabase();
    addOutputLine(initMessage, 'system');
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [outputLines]);

  const addOutputLine = (text: string, type: OutputLine['type']) => {
    setOutputLines(prev => [...prev, { id: crypto.randomUUID(), text, type }]);
  };

  const handleCommandSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (isExited || !inputValue.trim()) return;

    const commandText = inputValue.trim();
    addOutputLine(`${PROMPT} ${commandText}`, 'command');
    setInputValue('');

    const parsed = parseCommand(commandText);

    switch (parsed.type) {
      case 'insert':
        const insertResult = executeInsert(parsed.payload as Row);
        addOutputLine(insertResult, insertResult.startsWith('Error:') ? 'error' : 'response');
        break;
      case 'select':
        const rows = executeSelect();
        if (rows.length === 0) {
          addOutputLine('No rows in table.', 'response');
        } else {
          rows.forEach(row => {
            addOutputLine(`(${row.id}, ${row.username}, ${row.email})`, 'response');
          });
        }
        break;
      case 'meta':
        const metaResult = handleMetaCommand(parsed.payload as string);
        addOutputLine(metaResult, 'system');
        if (parsed.payload === 'exit') {
          setIsExited(true);
        }
        break;
      case 'error':
        addOutputLine(parsed.error || 'Unknown error.', 'error');
        break;
      default:
        addOutputLine('Unrecognized command type.', 'error');
    }
  };
  
  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-2xl h-[calc(100vh-4rem)] flex flex-col font-mono" onClick={focusInput}>
      <CardHeader>
        <CardTitle className="text-primary">Monarch Terminal</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          <div className="space-y-2">
            {outputLines.map((line) => (
              <div key={line.id} className="whitespace-pre-wrap break-words">
                {line.type === 'command' && <span className="text-muted-foreground">{line.text}</span>}
                {line.type === 'response' && <span className="text-foreground">{line.text}</span>}
                {line.type === 'error' && <span className="text-destructive">{line.text}</span>}
                {line.type === 'system' && <span className="text-accent">{line.text}</span>}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <form onSubmit={handleCommandSubmit} className="flex w-full items-center space-x-2">
          <span className="text-primary mr-2">{PROMPT}</span>
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isExited ? "Session exited. Refresh to restart." : "Enter SQL-like command..."}
            className="flex-grow bg-input text-foreground placeholder:text-muted-foreground focus:ring-primary font-mono"
            disabled={isExited}
            aria-label="Command input"
          />
          <Button type="submit" size="icon" variant="ghost" disabled={isExited} aria-label="Submit command">
            <SendHorizontal className="h-5 w-5 text-primary" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
