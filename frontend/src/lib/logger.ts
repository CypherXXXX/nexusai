type LogLevel = "info" | "warn" | "error" | "debug";

class Logger {
    private isDev = process.env.NODE_ENV === "development";

    log(level: LogLevel, message: string, ...args: any[]) {
        if (!this.isDev && level === "debug") return;

        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}]:`;

        switch (level) {
            case "info":
                console.log(prefix, message, ...args);
                break;
            case "warn":
                console.warn(prefix, message, ...args);
                break;
            case "error":
                console.error(prefix, message, ...args);
                break;
            case "debug":
                console.debug(prefix, message, ...args);
                break;
        }
    }

    info(message: string, ...args: any[]) { this.log("info", message, ...args); }
    warn(message: string, ...args: any[]) { this.log("warn", message, ...args); }
    error(message: string, ...args: any[]) { this.log("error", message, ...args); }
    debug(message: string, ...args: any[]) { this.log("debug", message, ...args); }
}

export const logger = new Logger();
