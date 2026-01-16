"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const availabilityController_1 = require("../controllers/availabilityController");
const router = (0, express_1.Router)();
router.get('/', availabilityController_1.getAvailability);
router.put('/', availabilityController_1.updateAvailability);
exports.default = router;
