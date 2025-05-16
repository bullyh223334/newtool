import React, { useState } from "react";
import { SOFTWARE } from "../softwareMatrix.js";
import "./SoftwareModal.css";

export default function SoftwareModal({ isCloud, initialSelections = {}, onSave, onClose }) {
  const [selections, setSelections] = useState(
    SOFTWARE.map((item) => ({
      ...item,
      selected: !!initialSelections[item.type],
      quantity: initialSelections[item.type]?.quantity || (item.qty ? 1 : 0),
    }))
  );

  const handleToggle = (index) => {
    setSelections((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleQuantityChange = (index, value) => {
    setSelections((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, quantity: Math.max(0, parseInt(value) || 0) } : item
      )
    );
  };

  const handleSave = () => {
    const selectedItems = selections
      .filter((item) => item.selected)
      .map((item) => ({
        name: item.type,
        quantity: item.qty ? item.quantity : undefined,
      }));
    onSave(selectedItems);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Select Software</h2>
        {SOFTWARE.reduce((acc, item) => {
          const category = acc.find((c) => c.name === item.cat);
          if (!category) {
            acc.push({ name: item.cat, items: [item] });
          } else {
            category.items.push(item);
          }
          return acc;
        }, []).map((category) => (
          <div key={category.name} className="software-category">
            <h4>{category.name}</h4>
            {category.items.map((item, index) => {
              const globalIndex = selections.findIndex((s) => s.type === item.type);
              return (
                <div key={item.type} className="software-option">
                  <label>
                    <input
                      type="checkbox"
                      checked={selections[globalIndex].selected}
                      onChange={() => handleToggle(globalIndex)}
                    />
                    {item.type}
                  </label>
                  {item.qty && selections[globalIndex].selected && (
                    <label>
                      Quantity:
                      <input
                        type="number"
                        min="0"
                        value={selections[globalIndex].quantity}
                        onChange={(e) => handleQuantityChange(globalIndex, e.target.value)}
                      />
                    </label>
                  )}
                  <p>{item.tip}</p>
                </div>
              );
            })}
          </div>
        ))}
        <div className="modal-actions">
          <button onClick={handleSave}>Save Selections</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}