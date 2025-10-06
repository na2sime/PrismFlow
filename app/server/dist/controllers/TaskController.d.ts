import { Request, Response } from 'express';
export declare class TaskController {
    static getByProject(req: Request, res: Response): Promise<void>;
    static getById(req: Request, res: Response): Promise<void>;
    static create(req: Request, res: Response): Promise<void>;
    static update(req: Request, res: Response): Promise<void>;
    static delete(req: Request, res: Response): Promise<void>;
    static move(req: Request, res: Response): Promise<void>;
    static updatePositions(req: Request, res: Response): Promise<void>;
    static getByStatus(req: Request, res: Response): Promise<void>;
    static getStats(req: Request, res: Response): Promise<void>;
    static getMyTasks(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=TaskController.d.ts.map