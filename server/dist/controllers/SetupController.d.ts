import { Request, Response } from 'express';
export declare class SetupController {
    static getSetupStatus(req: Request, res: Response): Promise<void>;
    static getAuthProviders(req: Request, res: Response): Promise<void>;
    static getProjectTemplates(req: Request, res: Response): Promise<void>;
    static createAdminUser(req: Request, res: Response): Promise<void>;
    static createFirstProject(req: Request, res: Response): Promise<void>;
    static completeSetup(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=SetupController.d.ts.map