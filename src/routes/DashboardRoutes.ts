import { Router } from "express";
import DashboardController from "../controllers/DasboardController";
import { verifyUser } from "../middlewares/authUser";

const router = Router();

console.log(" till here ")

router.get('/stats', (req, res, next) => {
  Promise.resolve(DashboardController.getDashboardStats(req, res, next)).catch(next);
});




export default router;