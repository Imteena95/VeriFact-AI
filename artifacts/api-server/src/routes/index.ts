import { Router, type IRouter } from "express";
import healthRouter from "./health";
import factsRouter from "./facts";
import postsRouter from "./posts";
import pipelineRouter from "./pipeline";

const router: IRouter = Router();

router.use(healthRouter);
router.use(factsRouter);
router.use(postsRouter);
router.use(pipelineRouter);

export default router;
