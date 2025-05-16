import React, { useState } from "react";
import "./AddUserModal.css";

const allCountries = [
  "United Kingdom", "Ireland", "France", "Germany", "Netherlands", "Belgium",
  "Spain", "Italy", "United Arab Emirates", "Saudi Arabia", "United States",
  "Canada", "Brazil", "China", "Japan", "India"
];

export default function AddUserModal({ onClose, onSave }) {
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    userType: "Partner",
    countries: [],
  });

  const [domainMismatch, setDomainMismatch] = useState(false);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));

    if (name === "email" || name === "company") {
      const domain = value.split("@")[1]?.split(".")[0]?.toLowerCase();
      const companyCheck = user.company.toLowerCase().replace(/\s+/g, "");
      setDomainMismatch(domain && companyCheck && !domain.includes(companyCheck));
    }
  };

  const toggleCountry = (country) => {
    setUser((prev) => ({
      ...prev,
      countries: prev.countries.includes(country)
        ? prev.countries.filter(c => c !== country)
        : [...prev.countries, country],
    }));
  };

  const handleSubmit = () => {
    onSave(user);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Add New User</h2>

        <label>First Name</label>
        <input name="firstName" value={user.firstName} onChange={handleInput} />

        <label>Last Name</label>
        <input name="lastName" value={user.lastName} onChange={handleInput} />

        <label>Email</label>
        <input name="email" value={user.email} onChange={handleInput} />

        <label>Company</label>
        <input name="company" value={user.company} onChange={handleInput} />

        {domainMismatch && (
          <div className="warning">
            Email domain does not match company name. Please check!
          </div>
        )}

        <label>User Type</label>
        <select name="userType" value={user.userType} onChange={handleInput}>
          <option value="Partner">Partner</option>
          <option value="Synguard">Synguard</option>
        </select>

        {user.userType === "Synguard" && (
          <>
            <label>Assign Countries</label>
            <div className="country-select">
              {allCountries.map((country) => (
                <button
                  key={country}
                  className={user.countries.includes(country) ? "selected" : ""}
                  onClick={() => toggleCountry(country)}
                  type="button"
                >
                  {country}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="modal-actions">
          <button onClick={handleSubmit}>Save</button>
          <button className="cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
