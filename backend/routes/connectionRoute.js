import express from "express";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import { acceptConnectionRequest, getConnectionsRequest, getConnectionStatus, getUserConnections, rejectConnectionRequest, removeConnection, sendConnectionRequest } from "../controllers/connectionController.js";

const router=express.Router();

router.post('/request/:id',protectedRoute,sendConnectionRequest)
router.put('/accept/:id',protectedRoute,acceptConnectionRequest)
router.put('/reject/:id',protectedRoute,rejectConnectionRequest)
router.get("/requests",protectedRoute,getConnectionsRequest)
router.get("/",protectedRoute,getUserConnections)
router.delete("/:id",protectedRoute,removeConnection)
router.get('/status/:id',protectedRoute,getConnectionStatus)

export default router