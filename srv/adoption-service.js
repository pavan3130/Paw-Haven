import cds from "@sap/cds";

const { SELECT, INSERT } = cds.ql;

export default class AdoptionService extends cds.ApplicationService {
  async init() {
    const { Animals, AdoptionRequests } = this.entities;

    this.on("submitAdoption", async (req) => {
      const { animalID, applicantName, applicantEmail, phone, reason, housing } = req.data;
      if (!animalID || !applicantName?.trim() || !applicantEmail?.trim() || !reason?.trim()) {
        return req.reject(400, "Animal, name, email, and adoption reason are required.");
      }

      const animal = await SELECT.one.from(Animals).where({ ID: animalID });
      if (!animal) return req.reject(404, "This animal could not be found.");
      if (animal.animalStatus !== "Available") {
        return req.reject(409, "This animal is not available for adoption right now.");
      }

      await INSERT.into(AdoptionRequests).entries({
        animal_ID: animalID,
        applicantName: applicantName.trim(),
        applicantEmail: applicantEmail.trim().toLowerCase(),
        phone: phone?.trim() || null,
        applicationDate: new Date().toISOString().slice(0, 10),
        reason: reason.trim(),
        housing: housing?.trim() || null,
        status: "Submitted"
      });
      return `Thanks, ${applicantName.trim()}! Your adoption request has been submitted.`;
    });

    return super.init();
  }
}
