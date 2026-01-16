"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const meetingController_1 = require("../controllers/meetingController");
const router = (0, express_1.Router)();
router.get('/', meetingController_1.getMeetings);
router.patch('/:id/cancel', meetingController_1.cancelMeeting);
exports.default = router;
