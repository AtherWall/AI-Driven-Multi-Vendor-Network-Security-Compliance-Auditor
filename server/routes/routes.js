import express from "express";

import { signup, login, logout, getCurrentUser } from "../controllers/authController.js";
import { uploadConfiguration, getConfigurations, getConfiguration, deleteConfiguration } from "../controllers/configurationController.js";
import { createAudit } from "../controllers/auditController.js";

import { protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import { getGraph } from "../controllers/graphController.js";

const Router = express.Router();

Router.post("/signup", signup);
Router.post("/login", login);
Router.post("/logout", logout);
Router.get("/me", protect, getCurrentUser);

Router.post("/api/upload", protect, upload.single("file"), uploadConfiguration);
Router.get("/api/configurations", protect, getConfigurations);
Router.get("/api/configurations/:file_id", protect, getConfiguration);
Router.delete("/api/configurations/:file_id", protect, deleteConfiguration);

Router.post("/api/audit", protect, createAudit);

Router.get("/api/graph/:audit_id", protect, getGraph);

export default Router;