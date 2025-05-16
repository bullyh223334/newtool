const [showControllerModal, setShowControllerModal] = useState(false);
const handleControllerSave = (selections) => {
  // Update controllers based on selections
  setShowControllerModal(false);
};
// In render:
{showControllerModal && (
  <ControllerSelectionModal
    initialSelections={}
    onSave={handleControllerSave}
    onClose={() => setShowControllerModal(false)}
  />
)}