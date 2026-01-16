"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookingController_1 = require("../controllers/bookingController");
const router = (0, express_1.Router)();
router.get('/event/:slug', bookingController_1.getEventBySlug);
router.get('/event/:slug/slots', bookingController_1.getAvailableSlots);
router.post('/event/:slug/book', bookingController_1.bookMeeting);
exports.default = router;
