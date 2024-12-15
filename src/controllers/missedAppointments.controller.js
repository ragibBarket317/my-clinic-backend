import { updateMissedAppointments } from "../db/missedAptCron.js";
import { MissedAppointment } from "../models/missedAppointment.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getmissedApts = asyncHandler(async (req, res) => {
  const data = await MissedAppointment.aggregate([
    {
      $addFields: {
        sortOrder: {
          $switch: {
            branches: [
              { case: { $eq: ["$clinic", "dm"] }, then: 1 },
              { case: { $eq: ["$clinic", "dew"] }, then: 2 },
              { case: { $eq: ["$clinic", "ww"] }, then: 3 },
              { case: { $eq: ["$clinic", "rb"] }, then: 4 },
            ],
            default: 5,
          },
        },
      },
    },
    { $sort: { sortOrder: 1 } },
    { $project: { sortOrder: 0 } },
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      missedApts: data,
    })
  );
});

const getmissedAptsManually = asyncHandler(async (req, res) => {
  await updateMissedAppointments();
  // const data = await MissedAppointment.find();

  const data = await MissedAppointment.aggregate([
    {
      $addFields: {
        sortOrder: {
          $switch: {
            branches: [
              { case: { $eq: ["$clinic", "dm"] }, then: 1 },
              { case: { $eq: ["$clinic", "dew"] }, then: 2 },
              { case: { $eq: ["$clinic", "ww"] }, then: 3 },
              { case: { $eq: ["$clinic", "rb"] }, then: 4 },
            ],
            default: 5,
          },
        },
      },
    },
    { $sort: { sortOrder: 1 } },
    { $project: { sortOrder: 0 } },
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      missedApts: data,
    })
  );
});

export { getmissedApts, getmissedAptsManually };
