import cron from "node-cron";
import { MissedAppointment } from "../models/missedAppointment.model.js";
import { Patient } from "../models/patient.model.js";
import PatientExam from "../models/patientExam.models.js";

// check apt is due or not for a patient
export const updateMissedAppointments = async () => {
  const patientExams = await PatientExam.find({});
  const missedApts = await MissedAppointment.find({});

  if (missedApts.length > 0) {
    await MissedAppointment.deleteMany();
  }

  // get todays date
  const today = new Date();
  // console.log(patientExams);

  if (patientExams.length > 0) {
    for (const patientExam of patientExams) {
      const patientInfo = await Patient.findById(patientExam.patientId);

      let aweDate;
      let acceDate;
      let eyeDate;
      let footDate;
      if (patientExam.aweDate) {
        aweDate = new Date(patientExam.aweDate);
      } else {
        aweDate = new Date();
      }

      if (patientExam.acceDate) {
        acceDate = new Date(patientExam.acceDate);
      } else {
        acceDate = new Date();
      }
      if (patientExam.eyeDate) {
        eyeDate = new Date(patientExam.eyeDate);
      } else {
        eyeDate = new Date();
      }
      if (patientExam.footDate) {
        footDate = new Date(patientExam.footDate);
      } else {
        footDate = new Date();
      }

      // console.log(patientExam);
      // check for awe exam date
      if (patientExam.aweStatus === "Scheduled" && aweDate < today) {
        // Perform your task here
        await new MissedAppointment({
          patientId: patientInfo._id,
          patientName: `${patientInfo.firstName} ${patientInfo.lastName}`,
          dob: patientInfo.dob,
          clinic: patientInfo.clinic,
          appointmentFor: "AWE",
          appointmentDueDate: patientExam?.aweDate,
        }).save();
      }

      // check for acce exam date
      if (patientExam.acceStatus === "Scheduled" && acceDate < today) {
        // Perform your task here
        await new MissedAppointment({
          patientId: patientInfo._id,
          patientName: `${patientInfo.firstName} ${patientInfo.lastName}`,
          dob: patientInfo.dob,
          clinic: patientInfo.clinic,
          appointmentFor: "ACCE",
          appointmentDueDate: patientExam.acceDate,
        }).save();
      }

      // check for eye exam date
      if (patientExam.eyeStatus === "Scheduled" && eyeDate < today) {
        // Perform your task here
        await new MissedAppointment({
          patientId: patientInfo._id,
          patientName: `${patientInfo.firstName} ${patientInfo.lastName}`,
          dob: patientInfo.dob,
          clinic: patientInfo.clinic,
          appointmentFor: "EYE",
          appointmentDueDate: patientExam.eyeDate,
        }).save();
      }

      // check for foot exam date
      if (patientExam.footStatus === "Scheduled" && footDate < today) {
        // Perform your task here
        await new MissedAppointment({
          patientId: patientInfo._id,
          patientName: `${patientInfo.firstName} ${patientInfo.lastName}`,
          dob: patientInfo.dob,
          clinic: patientInfo.clinic,
          appointmentFor: "FOOT",
          appointmentDueDate: patientExam.footDate,
        }).save();
      }
    }
  }
  //   console.log("Saving");
};

// cron.schedule("0 0 * * *", updateMissedAppointments );
cron.schedule("0 */12 * * *", updateMissedAppointments); // 12 hours
// cron.schedule("*/5 * * * * *", updateMissedAppointments );
