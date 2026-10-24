using { pawhaven as db } from '../db/schema';

@path: 'adoption'
service AdoptionService {
  entity Animals as projection on db.Animals;
  entity AdoptionRequests as projection on db.AdoptionRequests;

  action submitAdoption(
    animalID       : UUID,
    applicantName  : String(120),
    applicantEmail : String(255),
    phone          : String(30),
    reason         : String(1000),
    housing        : String(250)
  ) returns String;
}
