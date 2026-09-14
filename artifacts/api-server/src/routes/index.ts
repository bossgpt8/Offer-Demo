import { Router, type IRouter } from "express";
import healthRouter from "./health";
import giveawayRouter from "./giveaway";

const router: IRouter = Router();

router.use(healthRouter);
router.use(giveawayRouter);

export default router;
