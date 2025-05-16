import React from "react";
import "./CountrySelectorModal.css";

const countryRegions = {
  "UK & Ireland": ["UK", "Ireland"],
  Europe: [
    "Belgium", "Netherlands", "France", "Spain", "Portugal",
    "Germany", "Poland", "Italy", "Switzerland", "Croatia"
  ],
  America: ["USA", "Canada"],
  "South America": ["Brazil", "Argentina", "Chile"],
  Asia: ["China", "Japan", "India", "Singapore"],
  UAE: ["United Arab Emirates"],
};

export default function CountrySelectorModal({ selected, onSave, onClose }) {
  const toggleCountry = (country) => {
    if (selected.includes(country)) {
      onSave(selected.filter((c) => c !== country));
    } else {
      onSave([...selected, country]);
    }
  };

  return (
    <div className="country-modal-overlay">
      <div className="country-modal">
        <h3>Select Countries</h3>
        <div className="country-groups">
          {Object.entries(countryRegions).map(([region, countries]) => (
            <div key={region} className="country-group">
              <h4>{region}</h4>
              <div className="country-list">
                {countries.map((country) => (
                  <label key={country} className="country-item">
                    <input
                      type="checkbox"
                      checked={selected.includes(country)}
                      onChange={() => toggleCountry(country)}
                    />
                    {country}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="country-modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={() => onClose(true)}>Done</button>
        </div>
      </div>
    </div>
  );
}
