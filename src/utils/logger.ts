import * as fs from 'fs';
import * as path from 'path';

class Logger {
  private logStream: fs.WriteStream | null = null;
  private errorStream: fs.WriteStream | null = null;
  private isStdioMode: boolean = false;

  constructor() {
    // Check if running in stdio mode
    this.isStdioMode = !process.argv.includes('--sse') && !process.argv.includes('--streamable');
    
    if (this.isStdioMode) {
      this.initializeLogFiles();
    }
  }

  private initializeLogFiles() {
    const logDir = path.join(process.cwd(), 'logs');
    
    // Ensure log directory exists
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFile = path.join(logDir, `server-${timestamp}.log`);
    const errorFile = path.join(logDir, `error-${timestamp}.log`);

    try {
      this.logStream = fs.createWriteStream(logFile, { flags: 'a' });
      this.errorStream = fs.createWriteStream(errorFile, { flags: 'a' });

      // Write log file header
      const header = `=== Log started at ${new Date().toISOString()} ===\n`;
      this.logStream.write(header);
      this.errorStream.write(header);

      // Redirect console output to files in stdio mode
      if (this.isStdioMode) {
        // Store original console methods
        const originalConsoleLog = console.log;
        const originalConsoleError = console.error;
        const originalConsoleWarn = console.warn;

        // Override console methods
        console.log = (...args: unknown[]) => {
          const message = this.formatMessage('INFO', args[0], ...args.slice(1));
          this.logStream?.write(message);
        };

        console.error = (...args: unknown[]) => {
          const message = this.formatMessage('ERROR', args[0], ...args.slice(1));
          this.errorStream?.write(message);
        };

        console.warn = (...args: unknown[]) => {
          const message = this.formatMessage('WARN', args[0], ...args.slice(1));
          this.logStream?.write(message);
        };

        // Store original methods for cleanup
        this.originalConsole = {
          log: originalConsoleLog,
          error: originalConsoleError,
          warn: originalConsoleWarn
        };
      }
    } catch (error) {
      // Fallback to console output if log files cannot be created
      console.error('Failed to initialize log files:', error);
      this.isStdioMode = false;
    }
  }

  private originalConsole: {
    log: typeof console.log;
    error: typeof console.error;
    warn: typeof console.warn;
  } | null = null;

  private formatMessage(level: string, message: any, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    
    return `[${timestamp}] [${level}] ${message} ${formattedArgs}\n`;
  }

  log(message: any, ...args: any[]): void {
    const formattedMessage = this.formatMessage('INFO', message, ...args);
    
    if (this.isStdioMode && this.logStream) {
      this.logStream.write(formattedMessage);
    } else {
      console.log(message, ...args);
    }
  }

  error(message: any, ...args: any[]): void {
    const formattedMessage = this.formatMessage('ERROR', message, ...args);
    
    if (this.isStdioMode && this.errorStream) {
      this.errorStream.write(formattedMessage);
    } else {
      console.error(message, ...args);
    }
  }

  warn(message: any, ...args: any[]): void {
    const formattedMessage = this.formatMessage('WARN', message, ...args);
    
    if (this.isStdioMode && this.logStream) {
      this.logStream.write(formattedMessage);
    } else {
      console.warn(message, ...args);
    }
  }

  async close(): Promise<void> {
    // Restore original console methods
    if (this.originalConsole) {
      console.log = this.originalConsole.log;
      console.error = this.originalConsole.error;
      console.warn = this.originalConsole.warn;
    }

    // Close log streams
    if (this.logStream) {
      await new Promise<void>((resolve) => {
        this.logStream!.end(() => resolve());
      });
    }
    if (this.errorStream) {
      await new Promise<void>((resolve) => {
        this.errorStream!.end(() => resolve());
      });
    }
  }
}

// Create singleton instance
export const logger = new Logger(); 