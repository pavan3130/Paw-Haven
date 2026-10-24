sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/Dialog",
  "sap/m/Input",
  "sap/m/TextArea",
  "sap/m/Label",
  "sap/m/VBox",
  "sap/m/Button",
  "sap/m/MessageBox",
  "sap/m/MessageToast"
], function (Controller, JSONModel, Dialog, Input, TextArea, Label, VBox, Button, MessageBox, MessageToast) {
  "use strict";

  const API = "/odata/v4/adoption";

  return Controller.extend("com.pawhaven.app.controller.App", {
    onInit: function () {
      this._allAnimals = [];
      this._search = "";
      this._species = "All";
      this._selectedAnimal = null;
      this._model = new JSONModel({
        animals: [], requests: [],
        kpis: { total: 0, available: 0, adopted: 0, requests: 0, pending: 0 },
        messages: { animals: "Loading animal profiles…", loadError: "", hasError: false }
      });
      this.getView().setModel(this._model);
      this._refreshData();
    },

    _request: async function (url, options) {
      const response = await fetch(url, options || {});
      if (!response.ok) {
        let message = `Request failed (${response.status})`;
        try {
          const body = await response.json();
          message = body?.error?.message || message;
        } catch (_e) { /* server may return non-JSON text */ }
        throw new Error(message);
      }
      if (response.status === 204) return null;
      const type = response.headers.get("content-type") || "";
      return type.includes("json") ? response.json() : response.text();
    },

    _asArray: function (payload) {
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.value)) return payload.value;
      if (Array.isArray(payload?.d?.results)) return payload.d.results;
      return [];
    },

    _refreshData: async function () {
      try {
        const [animalPayload, requestPayload] = await Promise.all([
          this._request(`${API}/Animals?$select=ID,name,species,breed,gender,age,arrivalDate,animalStatus,vaccinationStatus,spayedOrNeutered,photo,description&$orderby=name`),
          this._request(`${API}/AdoptionRequests?$expand=animal&$orderby=createdAt desc`).catch(() => ({ value: [] }))
        ]);
        this._allAnimals = this._asArray(animalPayload);
        const requests = this._asArray(requestPayload).map((request) => ({
          ...request,
          animalName: request.animal?.name || "Animal profile",
          applicationDate: request.applicationDate || (request.createdAt ? request.createdAt.slice(0, 10) : "—")
        }));
        this._model.setProperty("/requests", requests);
        this._model.setProperty("/kpis", {
          total: this._allAnimals.length,
          available: this._allAnimals.filter((a) => a.animalStatus === "Available").length,
          adopted: this._allAnimals.filter((a) => a.animalStatus === "Adopted").length,
          requests: requests.length,
          pending: requests.filter((r) => r.status === "Submitted" || r.status === "Under Review").length
        });
        this._model.setProperty("/messages/hasError", false);
        this._model.setProperty("/messages/loadError", "");
        this._applyFilters();
      } catch (error) {
        this._model.setProperty("/messages/animals", "Animal profiles unavailable");
        this._model.setProperty("/messages/loadError", `${error.message}. Confirm CAP is running and the service URL is /odata/v4/adoption.`);
        this._model.setProperty("/messages/hasError", true);
        MessageToast.show("Could not load animal profiles. Check the service connection.");
      }
    },

    _applyFilters: function () {
      const query = this._search.toLowerCase().trim();
      const species = this._species;
      const filtered = this._allAnimals.filter((animal) => {
        const matchesSpecies = species === "All" || animal.species?.toLowerCase() === species.toLowerCase();
        const haystack = [animal.name, animal.breed, animal.species, animal.description].join(" ").toLowerCase();
        return matchesSpecies && (!query || haystack.includes(query));
      });
      this._model.setProperty("/animals", filtered);
      this._model.setProperty("/messages/animals", `${filtered.length} ${filtered.length === 1 ? "friend" : "friends"} to discover`);
    },

    onSearch: function (event) {
      this._search = event.getParameter("newValue");
      if (this._search === undefined) this._search = event.getParameter("query") || "";
      this._applyFilters();
    },

    onSpeciesChange: function (event) {
      this._species = event.getSource().getSelectedKey() || "All";
      this._applyFilters();
    },

    onRefresh: function () { this._refreshData(); },

    onBrowse: function () {
      const page = this.byId("browseSection");
      if (page) page.getDomRef()?.scrollIntoView({ behavior: "smooth", block: "start" });
    },

    onApply: function (event) {
      const animal = event.getSource().getBindingContext().getObject();
      if (!animal || animal.animalStatus !== "Available") return;
      this._selectedAnimal = animal;
      this._openAdoptionDialog(animal);
    },

    _openAdoptionDialog: function (animal) {
      if (this._adoptionDialog) {
        this._adoptionDialog.destroy();
      }
      const nameInput = new Input({ placeholder: "Your full name", required: true, width: "100%" });
      const emailInput = new Input({ placeholder: "you@example.com", type: "Email", required: true, width: "100%" });
      const phoneInput = new Input({ placeholder: "Phone number (optional)", width: "100%" });
      const housingInput = new Input({ placeholder: "e.g. Apartment, house with yard", width: "100%" });
      const reasonInput = new TextArea({ placeholder: "Tell the shelter why you'd love to adopt this animal", rows: 4, growing: true, maxLength: 1000, width: "100%" });
      const content = new VBox({ width: "100%", items: [
        new Label({ text: `Applying to meet ${animal.name}`, design: "Bold" }),
        new Label({ text: "Full name", labelFor: nameInput }), nameInput,
        new Label({ text: "Email address", labelFor: emailInput }), emailInput,
        new Label({ text: "Phone", labelFor: phoneInput }), phoneInput,
        new Label({ text: "Home environment", labelFor: housingInput }), housingInput,
        new Label({ text: "Why would you be a good match?", labelFor: reasonInput }), reasonInput
      ]}).addStyleClass("adoptionForm");
      this._adoptionDialog = new Dialog({
        title: "Start an adoption request",
        contentWidth: "34rem",
        stretchOnPhone: true,
        verticalScrolling: true,
        content: [content],
        beginButton: new Button({ text: "Submit request", type: "Emphasized", press: async () => {
          const applicantName = nameInput.getValue().trim();
          const applicantEmail = emailInput.getValue().trim();
          const reason = reasonInput.getValue().trim();
          if (!applicantName || !applicantEmail || !reason) {
            MessageBox.warning("Please enter your name, email, and a short adoption reason.");
            return;
          }
          await this._submitAdoption({
            animalID: animal.ID,
            applicantName,
            applicantEmail,
            phone: phoneInput.getValue(),
            housing: housingInput.getValue(),
            reason
          });
        }}),
        endButton: new Button({ text: "Cancel", press: () => this._adoptionDialog.close() })
      });
      this.getView().addDependent(this._adoptionDialog);
      this._adoptionDialog.open();
    },

    _submitAdoption: async function (payload) {
      const dialog = this._adoptionDialog;
      const submitButton = dialog.getBeginButton();
      submitButton.setEnabled(false);
      submitButton.setText("Submitting…");
      try {
        const result = await this._request(`${API}/submitAdoption`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(payload)
        });
        dialog.close();
        MessageBox.success(typeof result === "string" ? result : (result?.value || "Your request was submitted. The shelter team will review it soon."));
        await this._refreshData();
      } catch (error) {
        MessageBox.error(`We couldn't submit the request: ${error.message}`);
      } finally {
        submitButton.setEnabled(true);
        submitButton.setText("Submit request");
      }
    },

    onApprove: function (event) { this._updateStatus(event, "Approved"); },
    onReject: function (event) { this._updateStatus(event, "Rejected"); },

    _updateStatus: async function (event, status) {
      const request = event.getSource().getBindingContext().getObject();
      if (!request?.ID) return;
      try {
        await this._request(`${API}/AdoptionRequests(ID=${request.ID})`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({ status })
        });
        MessageToast.show(`Application ${status.toLowerCase()}.`);
        await this._refreshData();
      } catch (error) {
        MessageBox.error(`Could not update this request: ${error.message}`);
      }
    }
  });
});