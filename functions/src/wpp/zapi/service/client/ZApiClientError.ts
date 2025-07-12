/*
* Error class for ZApi Client errors.
*/
export class ZApiClientError extends Error {
    public readonly type: string;
    public readonly context: string;
    public readonly status: number | null;
    public readonly data: any;

    constructor(context: string, message: string, status: number | null = null, data: any = null) {
        super(message);
        this.name = 'ZApiClientError';
        this.type = 'ZApiClientError';
        this.context = context;
        this.status = status;
        this.data = data;

        // Captura o stack trace corretamente
        Error.captureStackTrace(this, this.constructor);
    }

    // Method to convert the error to a string
    toString(): string {
        const baseInfo = [
            `[${this.name}]`,
            `Context: ${this.context}`,
            `Status: ${this.status ?? 'unknown'}`,
            `Message: ${this.message}`,
        ].join(' ');

        const dataInfo = this.data
            ? `Data: ${JSON.stringify(this.data, null, 2)}` // Formata o JSON com indentação para legibilidade
            : 'No additional data provided.';

        const stackInfo = this.stack
            ? `\nStack Trace:\n${this.stack}`
            : 'No stack trace available.';

        return `${baseInfo}\n${dataInfo}\n${stackInfo}`;
    }
}
