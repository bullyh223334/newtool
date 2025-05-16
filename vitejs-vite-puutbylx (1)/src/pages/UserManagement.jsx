import React, { useState } from "react";
import { useQuotes } from "../context/QuotesContext";
import CountrySelectorModal from "../components/CountrySelectorModal";
import "./UserManagement.css";

export default function UserManagement() {
  const {
    users, setUsers,
    companies, setCompanies,
    currentUser,
  } = useQuotes();

  const [userSearch, setUserSearch] = useState("");
  const [companySearch, setCompanySearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [isEditingCompany, setIsEditingCompany] = useState(false);

  const canAccess = currentUser?.userType === "Synguard" && currentUser?.role === "Admin";
  if (!canAccess) return <div className="no-access">Access Denied</div>;

  const filteredUsers = users.filter((user) =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.company?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(companySearch.toLowerCase())
  );

  const openAddUser = () => {
    setSelectedUser({
      firstName: "",
      lastName: "",
      email: "",
      userType: "Synguard",
      role: "Sales",
      company: companies[0]?.name || "",
      countriesManaged: [],
    });
    setIsEditingUser(false);
    setShowModal(true);
  };

  const openEditUser = (user) => {
    setSelectedUser({ ...user });
    setIsEditingUser(true);
    setShowModal(true);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm("Delete this user?")) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    }
  };

  const openAddCompany = () => {
    setSelectedCompany({ name: "", countries: [] });
    setIsEditingCompany(false);
    setShowCompanyModal(true);
  };

  const openEditCompany = (company) => {
    setSelectedCompany({ ...company });
    setIsEditingCompany(true);
    setShowCompanyModal(true);
  };

  const handleDeleteCompany = (companyName) => {
    if (window.confirm(`Delete company "${companyName}"?`)) {
      setCompanies((prev) => prev.filter((c) => c.name !== companyName));
    }
  };

  const handleSaveUser = () => {
    const isValid = selectedUser.firstName && selectedUser.lastName &&
                    selectedUser.email && selectedUser.userType && selectedUser.company;

    if (!isValid) return alert("All required fields must be filled.");

    if (
      selectedUser.userType === "Synguard" &&
      !["Sales", "Product", "Admin"].includes(selectedUser.role)
    ) return alert("Invalid role selected.");

    setUsers((prev) =>
      isEditingUser
        ? prev.map((u) => (u.id === selectedUser.id ? selectedUser : u))
        : [...prev, { ...selectedUser, id: crypto.randomUUID() }]
    );
    setShowModal(false);
  };

  const handleSaveCompany = () => {
    if (!selectedCompany.name || selectedCompany.countries.length === 0) {
      alert("Company name and country selection is required.");
      return;
    }

    setCompanies((prev) =>
      isEditingCompany
        ? prev.map((c) => (c.name === selectedCompany.name ? selectedCompany : c))
        : [...prev, selectedCompany]
    );
    setShowCompanyModal(false);
  };

  return (
    <div className="user-management-page">
      {/* USERS BLOCK */}
      <div className="gold-accent-container">
        <div className="section-header">
          <h2>Users</h2>
          <button className="add-user-btn" onClick={openAddUser}>+ Add User</button>
        </div>
        <input
          type="text"
          placeholder="Search users or company..."
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
        />
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>User Type</th>
              <th>Role</th>
              <th>Company</th>
              <th>Countries</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.email}</td>
                <td>{user.userType}</td>
                <td>{user.userType === "Synguard" ? user.role : "-"}</td>
                <td>{user.company}</td>
                <td>{(user.countriesManaged || []).join(", ")}</td>
                <td>
                  <button onClick={() => openEditUser(user)}>Edit</button>
                  <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* COMPANIES BLOCK */}
      <div className="gold-accent-container">
        <div className="section-header">
          <h2>Companies</h2>
          <button className="add-company-btn" onClick={openAddCompany}>+ Add Company</button>
        </div>
        <input
          type="text"
          placeholder="Search companies..."
          value={companySearch}
          onChange={(e) => setCompanySearch(e.target.value)}
        />
        <table className="user-table">
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Countries</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.map((company) => (
              <tr key={company.name}>
                <td>{company.name}</td>
                <td>{(company.countries || []).join(", ")}</td>
                <td>
                  <button onClick={() => openEditCompany(company)}>Edit</button>
                  <button onClick={() => handleDeleteCompany(company.name)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{isEditingUser ? "Edit User" : "Add User"}</h3>
            <input
              placeholder="First Name"
              value={selectedUser.firstName}
              onChange={(e) => setSelectedUser({ ...selectedUser, firstName: e.target.value })}
            />
            <input
              placeholder="Last Name"
              value={selectedUser.lastName}
              onChange={(e) => setSelectedUser({ ...selectedUser, lastName: e.target.value })}
            />
            <input
              placeholder="Email"
              value={selectedUser.email}
              onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
            />
            <select
              value={selectedUser.userType}
              onChange={(e) => {
                const userType = e.target.value;
                setSelectedUser({
                  ...selectedUser,
                  userType,
                  role: userType === "Synguard" ? "Sales" : undefined,
                  countriesManaged: userType === "Synguard" ? [] : [],
                });
              }}
            >
              <option value="Synguard">Synguard</option>
              <option value="Partner">Partner</option>
            </select>
            {selectedUser.userType === "Synguard" && (
              <>
                <select
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                >
                  <option value="Sales">Sales</option>
                  <option value="Product">Product</option>
                  <option value="Admin">Admin</option>
                </select>
                <button
                  className="select-countries-btn"
                  onClick={() => setShowCountryModal("user")}
                >
                  Select Countries ({selectedUser.countriesManaged.length})
                </button>
              </>
            )}
            <select
              value={selectedUser.company}
              onChange={(e) => setSelectedUser({ ...selectedUser, company: e.target.value })}
            >
              <option value="">Select a Company</option>
              {companies.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
            <div className="modal-actions">
              <button onClick={handleSaveUser}>Save</button>
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Country Selector Modal */}
      {showCountryModal && (
        <CountrySelectorModal
          selected={
            showCountryModal === "user"
              ? selectedUser?.countriesManaged || []
              : selectedCompany?.countries || []
          }
          onSave={(selected) => {
            if (showCountryModal === "user") {
              setSelectedUser({ ...selectedUser, countriesManaged: selected });
            } else {
              setSelectedCompany({ ...selectedCompany, countries: selected });
            }
          }}
          onClose={() => setShowCountryModal(false)}
        />
      )}

      {/* Company Modal */}
      {showCompanyModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{isEditingCompany ? "Edit Company" : "Add Company"}</h3>
            <input
              placeholder="Company Name"
              value={selectedCompany.name}
              onChange={(e) => setSelectedCompany({ ...selectedCompany, name: e.target.value })}
            />
            <button
              className="select-countries-btn"
              onClick={() => setShowCountryModal("company")}
            >
              {selectedCompany.countries?.length
                ? `Countries: ${selectedCompany.countries.join(", ")}`
                : "Select Countries"}
            </button>
            <div className="modal-actions">
              <button onClick={handleSaveCompany}>Save</button>
              <button className="cancel-btn" onClick={() => setShowCompanyModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
