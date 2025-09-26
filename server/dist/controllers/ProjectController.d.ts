import { Request, Response } from 'express';
export declare class ProjectController {
    static getAll(req: Request, res: Response): Promise<void>;
    static getById(req: Request, res: Response): Promise<void>;
    static create(req: Request, res: Response): Promise<void>;
    static update(req: Request, res: Response): Promise<void>;
    static delete(req: Request, res: Response): Promise<void>;
    static addMember(req: Request, res: Response): Promise<void>;
    static removeMember(req: Request, res: Response): Promise<void>;
    static getMembers(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=ProjectController.d.ts.map