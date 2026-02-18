import * as fs from 'fs';
import * as path from 'path';

/**
 * LogService: Managed sitzungsbasiertes Logging für die Nx-Pipeline.
 * Unterstützt strukturierten Kontext (Topic/Subtopic) für maximale Klarheit.
 */
export class LogService {
  private static logFilePath: string | null = null;
  private static debugDir: string;
  private static isInitialized = false;
  private static context = { topic: 'GLOBAL', subtopic: '' };

  /**
   * Initialisiert den Logging-Service mit optionalem Kontext.
   * @param topic Das Hauptthema (z.B. 'HEALTH', 'ACTION', 'GUARD')
   * @param subtopic Das Unterthema (z.B. 'BREVO', 'WIPE', 'ENV')
   */
  public static init(topic = 'GLOBAL', subtopic = '') {
    this.context = { topic, subtopic };
    
    if (this.isInitialized) return;

    const rootDir = path.resolve(__dirname, '../../');
    this.debugDir = path.join(rootDir, 'apps/company-website/debug');

    if (!fs.existsSync(this.debugDir)) {
      fs.mkdirSync(this.debugDir, { recursive: true });
    }

    this.setupLogging();
    this.setupGlobalErrorHandlers();
    this.isInitialized = true;
  }

  private static setupGlobalErrorHandlers() {
    process.on('uncaughtException', (error) => {
      console.error('💥 FATAL: Uncaught Exception detected!');
      console.error(error.stack || error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason) => {
      console.error('💥 FATAL: Unhandled Promise Rejection detected!');
      console.error(reason instanceof Error ? reason.stack : reason);
      process.exit(1);
    });
  }

  private static setupLogging() {
    // Erkennt --new-session oder Nx-Argument {args.new-session} welches als "true" ankommt
    const isNewSession = process.argv.includes('--new-session') || process.argv.includes('true');
    
    if (isNewSession) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
      const rawTargetName = process.env.NX_TASK_TARGET_TARGET || 'session';
      const targetName = rawTargetName.replace(/:/g, '-');
      this.logFilePath = path.join(this.debugDir, `${targetName}_${timestamp}.log`);
    } else {
      const files = fs.readdirSync(this.debugDir)
        .filter(f => f.endsWith('.log') && !f.startsWith('fallback'))
        .map(f => ({ name: f, time: fs.statSync(path.join(this.debugDir, f)).mtime.getTime() }))
        .sort((a, b) => b.time - a.time);

      if (files.length > 0) {
        this.logFilePath = path.join(this.debugDir, files[0].name);
      } else {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
        this.logFilePath = path.join(this.debugDir, `session_${timestamp}.log`);
      }
    }

    this.hookConsole('log');
    this.hookConsole('error');
    this.hookConsole('warn');
    this.hookConsole('info');
    this.hookStderr();
  }

  private static hookStderr() {
    const originalWrite = process.stderr.write.bind(process.stderr);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (process.stderr as any).write = (chunk: string | Uint8Array, ...args: any[]) => {
      const message = typeof chunk === 'string' ? chunk : new TextDecoder().decode(chunk);
      if (this.logFilePath) {
        try {
          const timestamp = new Date().toLocaleTimeString();
          // Clean ANSI codes
          const cleanMessage = message.replace(/\x1B\[[0-9;]*m/g, '');
          const lines = cleanMessage.split('\n').filter(l => l.trim().length > 0);
          lines.forEach(line => {
             fs.appendFileSync(this.logFilePath!, `[${timestamp}] [STDERR] ${line}\n`);
          });
        } catch { /* Silent */ }
      }
      return originalWrite(chunk, ...args);
    };
  }

  private static hookConsole(method: keyof Console) {
    const original = console[method] as (...args: unknown[]) => void;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (console as any)[method] = (...args: unknown[]) => {
      // 1. Original Konsole bedienen
      original.apply(console, args);

      // 2. In Datei schreiben
      if (this.logFilePath) {
        try {
          const timestamp = new Date().toLocaleTimeString();
          const level = method.toUpperCase();
          const topic = this.context.topic;
          const subtopic = this.context.subtopic ? `[${this.context.subtopic}]` : '';

          const rawMessage = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ');
          
          // eslint-disable-next-line no-control-regex
          const cleanMessage = rawMessage.replace(/\x1B\[[0-9;]*m/g, '');
          
          if (this.logFilePath) {
            const path = this.logFilePath;
            const lines = cleanMessage.split('\n');
            lines.forEach(line => {
              const prefix = `[${timestamp}] [${level}] [${topic}]${subtopic}`;
              fs.appendFileSync(path, `${prefix} ${line}\n`);
            });
          }
        } catch {
          // Silent fail for logging
        }
      }
    };
  }
}
