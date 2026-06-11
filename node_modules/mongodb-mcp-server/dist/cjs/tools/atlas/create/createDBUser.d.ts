import { z } from "zod";
import type { ToolArgs, OperationType } from "../../tool.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { AtlasToolBase } from "../atlasTool.js";
export declare const CreateDBUserArgs: {
    projectId: z.ZodString;
    username: z.ZodString;
    password: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    roles: z.ZodArray<z.ZodObject<{
        roleName: z.ZodString;
        databaseName: z.ZodDefault<z.ZodString>;
        collectionName: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    clusters: z.ZodOptional<z.ZodArray<z.ZodString>>;
};
export declare class CreateDBUserTool extends AtlasToolBase {
    static toolName: string;
    description: string;
    static operationType: OperationType;
    argsShape: {
        projectId: z.ZodString;
        username: z.ZodString;
        password: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        roles: z.ZodArray<z.ZodObject<{
            roleName: z.ZodString;
            databaseName: z.ZodDefault<z.ZodString>;
            collectionName: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
        clusters: z.ZodOptional<z.ZodArray<z.ZodString>>;
    };
    protected execute({ projectId, username, password, roles, clusters, }: ToolArgs<typeof this.argsShape>): Promise<CallToolResult>;
    protected getConfirmationMessage({ projectId, username, password, roles, clusters, }: ToolArgs<typeof this.argsShape>): string;
}
//# sourceMappingURL=createDBUser.d.ts.map