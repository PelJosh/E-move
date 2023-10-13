import express from 'express';
import { indexcontroller } from '../controller/index';
const router = express.Router();

/* GET home page. */
router.get('/', indexcontroller);

export default router;
