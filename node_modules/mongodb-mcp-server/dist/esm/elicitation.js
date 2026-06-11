const ELICITATION_TIMEOUT_MS = 300000; // 5 minutes for user interaction
export class Elicitation {
    constructor({ server }) {
        this.server = server;
    }
    /**
     * Checks if the client supports elicitation capabilities.
     * @returns True if the client supports elicitation, false otherwise.
     */
    supportsElicitation() {
        const clientCapabilities = this.server.getClientCapabilities();
        return clientCapabilities?.elicitation !== undefined;
    }
    /**
     * Requests a boolean confirmation from the user.
     * @param message - The message to display to the user.
     * @returns True if the user confirms the action or the client does not support elicitation, false otherwise.
     */
    async requestConfirmation(message) {
        if (!this.supportsElicitation()) {
            return true;
        }
        const result = await this.server.elicitInput({
            mode: "form",
            message,
            requestedSchema: Elicitation.CONFIRMATION_SCHEMA,
        }, { timeout: ELICITATION_TIMEOUT_MS });
        return result.action === "accept" && result.content?.confirmation === "Yes";
    }
    /**
     * Requests structured input from the user via a form.
     * Returns the accepted fields, or { accepted: false } if the client doesn't
     * support elicitation or the user declined.
     *
     * @param message - The message/title to display in the form.
     * @param schema - A JSON Schema describing the fields to collect.
     * @returns The user-provided values keyed by field name, or null if declined/unsupported.
     */
    async requestInput(message, schema) {
        if (!this.supportsElicitation()) {
            return { accepted: false };
        }
        const result = await this.server.elicitInput({
            mode: "form",
            message,
            requestedSchema: schema,
        }, { timeout: ELICITATION_TIMEOUT_MS });
        if (result.action !== "accept" || !result.content) {
            return { accepted: false };
        }
        const fields = {};
        for (const [key, value] of Object.entries(result.content)) {
            if (typeof value === "string") {
                fields[key] = value;
            }
        }
        return { accepted: true, fields };
    }
}
/**
 * The schema for the confirmation question.
 * TODO: In the future would be good to use Zod 4's toJSONSchema() to generate the schema.
 */
Elicitation.CONFIRMATION_SCHEMA = {
    type: "object",
    properties: {
        confirmation: {
            type: "string",
            title: "Would you like to confirm?",
            description: "Would you like to confirm?",
            enum: ["Yes", "No"],
            enumNames: ["Yes, I confirm", "No, I do not confirm"],
        },
    },
    required: ["confirmation"],
};
//# sourceMappingURL=elicitation.js.map