import { MessagePayload, MessagePayloadSchema } from './schemas';
import { MessagePayloadHandler } from './handlers/base.handler';

class MessagePayloadRegistry {
    // Internally we store handlers with proper typing
    private readonly handlers: Record<string, MessagePayloadHandler<MessagePayload>> = {};

    // Register a handler with strong typing - only allows valid types
    register<T extends MessagePayload['type']>(
        type: T,
        handler: MessagePayloadHandler<Extract<MessagePayload, { type: T }>>
    ): void {
        // The typing ensures that only handlers compatible with T are accepted
        this.handlers[type] = handler;
    }

    // Get the handler - simple lookup
    getHandler<T extends MessagePayload>(payload: T): MessagePayloadHandler<T> {
        const handler = this.handlers[payload.type];

        if (!handler) {
            throw new Error(`No handler registered for payload type: ${payload.type}`);
        }

        return handler as MessagePayloadHandler<T>;
    }

    // Method for always strict and consistent validation
    validate<T extends MessagePayload>(payload: unknown): T | null {
        try {
            // Basic structure verification
            if (!payload || typeof payload !== 'object' || !('type' in payload)) {
                return null;
            }

            const payloadWithType = payload as { type: string };
            const type = payloadWithType.type;

            // If we have a handler for the type, we check if it supports the payload
            const handler = this.handlers[type];
            if (!handler) {
                return null;
            }

            // Always strict validation with Zod for total consistency
            try {
                MessagePayloadSchema.parse(payload);
            } catch (error) {
                return null;
            }

            // Additional validation with the specific handler
            if (handler.validate(payload)) {
                return payload as T;
            }

            return null;
        } catch (error) {
            return null;
        }
    }

    // Utility methods that encapsulate common operations
    getCharacterCount<T extends MessagePayload>(payload: T): number {
        return this.getHandler(payload).getCharacterCount(payload);
    }

    getPrimaryTextFields<T extends MessagePayload>(payload: T): Record<string, string> {
        return this.getHandler(payload).getPrimaryTextFields(payload);
    }

    calculateTypingDelay<T extends MessagePayload>(payload: T, typingSpeed?: number): number {
        return this.getHandler(payload).calculateTypingDelay(payload, typingSpeed);
    }

    parseVariables<T extends MessagePayload>(payload: T, variables: Record<string, string>, pattern?: string): T {
        return this.getHandler(payload).parseVariables(payload, variables, pattern);
    }

    hasVariable<T extends MessagePayload>(payload: T, variable: string, pattern?: string): boolean {
        return this.getHandler(payload).hasVariable(payload, variable, pattern);
    }
}

// Export a singleton instance of the registry
export const payloadRegistry = new MessagePayloadRegistry();
