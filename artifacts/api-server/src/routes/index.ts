import { Router, type IRouter } from "express";
import healthRouter from "./health";
import pollsRouter from "./polls";
import profilesRouter from "./profiles";
import rankingsRouter from "./rankings";
import categoriesRouter from "./categories";

const router: IRouter = Router();

router.use(healthRouter);
router.use(pollsRouter);
router.use(profilesRouter);
router.use(rankingsRouter);
router.use(categoriesRouter);

export default router;
