type PendingCallback<T = any> = {
    resolve: (value: T) => void;
    reject: (error: Error) => void;
    timeout: ReturnType<typeof setTimeout>;
};

export class MiniStatelessRPC {
    private connection: { sendStateless: (data: string) => void };
    private pending = new Map<string, PendingCallback>();
    private timeoutMs: number;

    constructor(connection: { sendStateless: (data: string) => void }, timeoutMs = 5000) {
        this.connection = connection;
        this.timeoutMs = timeoutMs;
    }

    send<T = any>(type: string, data: Record<string, any> = {}): Promise<T> {
        const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
        const payload = JSON.stringify({ type, id, ...data });

        return new Promise<T>((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.pending.delete(id);
                reject(new Error(`RPC "${type}" timed out after ${this.timeoutMs}ms`));
            }, this.timeoutMs);

            this.pending.set(id, { resolve, reject, timeout });
            this.connection.sendStateless(payload);
        });
    }

    receiveMessageObject(msg: any) {
        const { id, error, ...rest } = msg;
        if (!id || !this.pending.has(id)) return;
    
        const { resolve, reject, timeout } = this.pending.get(id)!;
        
        clearTimeout(timeout);
        this.pending.delete(id);
    
        if (error) {
            reject(new Error(error));
        } else {
            resolve(rest);
        }
    }
}
