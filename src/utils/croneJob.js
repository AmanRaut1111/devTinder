const { status } = require("express/lib/response");
const conectionRequest = require("../model/connectionRequest");
const crone = require("node-cron");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const { request } = require("express");
const { sendLoginEmail } = require("../service/sendEmail");

crone.schedule("9 * 9* *", async () => {
  try {
    console.log("Sceduling The Task", new Date());
    const yesterday = subDays(new Date(), 1);
    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);
    console.log(yesterday);

    const pendingRequest = await conectionRequest
      .find({
        status: "interested",
        createdAt: {
          $gte: yesterdayStart,
          $lte: yesterdayEnd,
        },
      })
      .populate("fromUserId toUserId");
    const listOfEmails = [
      ...new Set(pendingRequest.map((request) => request.toUserId.emailId)),
    ];

    console.log(listOfEmails);

    for (email of listOfEmails) {
      await sendLoginEmail("amanraut1111@gmail.com");
    }

    console.log(pendingRequest);
  } catch (error) {
    console.log(error);
  }
});
