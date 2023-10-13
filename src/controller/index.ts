import { Request, Response } from 'express';

// THIS IS WERE THE LOGIC FOR EACH END POINTS GO

export const indexcontroller = async (req: Request, res: Response) => {
	res.send('Working');
};
