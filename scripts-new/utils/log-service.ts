import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';

/**
 * LogService: Managed sitzungsbasiertes Logging für die Nx-Pipeline.
 * Unterstützt strukturierten Kontext (Topic/Subtopic) für maximale Klarheit.
 */
export class LogService {
  private static logFilePath: string | null = null;
  private static debugDir: string;
  private static isInitialized = false;
  private static context = { topic: 'GLOBAL', subtopic: '' };
  private static lineBuffers: Record<string, string> = { 'STDOUT': '', 'STDERR': '' };

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
          // eslint-disable-next-line no-control-regex
          const cleanMessage = message.replace(/\x1B\[[0-9;]*m/g, '');
          const lines = cleanMessage.split('\n').filter(l => l.trim().length > 0);
          lines.forEach(line => {
             fs.appendFileSync(this.logFilePath!, `[${timestamp}] [STDERR] [PARENT] ${line}\n`);
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
            const lines = cleanMessage.split('\n');
            lines.forEach(line => {
              const prefix = `[${timestamp}] [${level}] [${topic}]${subtopic}`;
              fs.appendFileSync(this.logFilePath!, `${prefix} ${line}\n`);
            });
          }
        } catch {
          // Silent fail for logging
        }
      }
    };
  }

  /**
   * Führt einen Shell-Befehl aus und leitet den Output (stdout/stderr) 
   * direkt in den LogService und die Konsole um.
   * @param command Der auszuführende Befehl
   * @param options Spawn-Optionen
   */
  public static async execAndLog(command: string, options: any = {}): Promise<string> {
    let fullOutput = '';
    this.lineBuffers['STDOUT'] = '';
    this.lineBuffers['STDERR'] = '';
    
    return new Promise((resolve, reject) => {
      console.log(`🚀 EXECUTING: ${command}`);
      
      const child = spawn(command, [], { 
        shell: true, 
        stdio: 'pipe', 
        cwd: options.cwd || process.cwd(),
        env: options.env || process.env
      });

      const processChunk = (chunk: Buffer, type: 'STDOUT' | 'STDERR') => {
        const str = chunk.toString();
        if (type === 'STDOUT') fullOutput += str;
        
        // Immediate terminal output
        if (type === 'STDERR') process.stderr.write(chunk);
        else process.stdout.write(chunk);

        // Buffering for log file to avoid partial line prefixing
        this.lineBuffers[type] += str;
        const lastNewlineIndex = this.lineBuffers[type].lastIndexOf('\n');
        
        if (lastNewlineIndex !== -1) {
          const completeLines = this.lineBuffers[type].substring(0, lastNewlineIndex);
          this.lineBuffers[type] = this.lineBuffers[type].substring(lastNewlineIndex + 1);
          
          if (this.logFilePath) {
            try {
              const timestamp = new Date().toLocaleTimeString();
              // eslint-disable-next-line no-control-regex
              const cleanMessage = completeLines.replace(/\x1B\[[0-9;]*m/g, '');
              const lines = cleanMessage.split('\n');
              
              lines.forEach(line => {
                const prefix = `[${timestamp}] [${type}] [${this.context.topic}]${this.context.subtopic ? `[${this.context.subtopic}]` : ''}`;
                fs.appendFileSync(this.logFilePath!, `${prefix} ${line}\n`);
              });
            } catch { /* Silent */ }
          }
        }
      };

      child.stdout.on('data', (data: Buffer) => processChunk(data, 'STDOUT'));
      child.stderr.on('data', (data: Buffer) => processChunk(data, 'STDERR'));

      child.on('close', (code: number) => {
        // Flush remaining buffers
        ['STDOUT', 'STDERR'].forEach((type: any) => {
           if (this.lineBuffers[type]) {
             const timestamp = new Date().toLocaleTimeString();
             // eslint-disable-next-line no-control-regex
             const clean = this.lineBuffers[type].replace(/\x1B\[[0-9;]*m/g, '');
             const prefix = `[${timestamp}] [${type}] [${this.context.topic}]${this.context.subtopic ? `[${this.context.subtopic}]` : ''}`;
             fs.appendFileSync(this.logFilePath!, `${prefix} ${clean}\n`);
           }
        });

        if (code === 0) {
          console.log(`✅ COMMAND SUCCESS (Code ${code})`);
          resolve(fullOutput);
        } else {
          console.error(`❌ COMMAND FAILED (Code ${code}): ${command}`);
          reject(new Error(`Exit Code ${code}`));
        }
      });

      child.on('error', (err: Error) => {
        console.error(`💥 EXECUTION ERROR: ${err.message}`);
        reject(err);
      });
    });
  }
}
