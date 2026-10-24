namespace pawhaven;

using { cuid, managed } from '@sap/cds/common';

entity Animals : cuid, managed {
  name              : String(100) not null;
  species           : String(30) not null;
  breed             : String(100);
  gender            : String(20);
  age               : Integer;
  arrivalDate       : Date;
  animalStatus      : String(30) default 'Available';
  vaccinationStatus : String(100);
  spayedOrNeutered  : String(20);
  photo             : String(500);
  description       : String(1000);
}

entity AdoptionRequests : cuid, managed {
  animal          : Association to Animals not null;
  applicantName   : String(120) not null;
  applicantEmail  : String(255) not null;
  phone           : String(30);
  applicationDate : Date;
  reason          : String(1000) not null;
  housing         : String(250);
  status          : String(30) default 'Submitted';
  adminNotes      : String(1000);
}
