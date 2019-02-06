import { Request, Response } from 'express';
export declare class NodeUtils {
    static okOptions: (req: Request, res: Response) => void;
    static writeResponse: (res: Response, code?: number) => (val: any) => void;
    static writeError: (res: Response) => (val: any) => void;
    static writeForbidden: (res: Response) => (val: any) => void;
}
//# sourceMappingURL=NodeUtils.d.ts.map