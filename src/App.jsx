import React, { useState, useEffect } from 'react';
import { Trash2, X, Search, Edit, UserPlus, Save } from 'lucide-react'; 

// --- MOCK DATA FOR DEMONSTRATION (unchanged) ---
const initialEmployees = [
  { id: 'E1001', empId: 'E1001', type: 'Staff', idNo: '12345', title: 'Mr.', name: 'Alice Johnson', designation: 'Software Engineer', directory: 'DIT', division: 'Development', dateOfJoin: '2020-05-15', dateOfPost: '2022-01-01', qualification: 'B.Tech', discipline: 'Computer Science', sex: 'Male', bloodGroup: 'A+', phone: '9876543210', address: '123 Tech Lane', permanentAddress: '123 Tech Lane', dob: '1995-10-20' },
  { id: 'E1002', empId: 'E1002', type: 'Contract', idNo: '67890', title: 'Ms.', name: 'Bob Smith', designation: 'Director', directory: 'DOI', division: 'Networking', dateOfJoin: '2018-08-20', dateOfPost: '2023-03-10', qualification: 'M.Sc', discipline: 'Statistics', sex: 'Female', bloodGroup: 'O-', phone: '9988776655', address: '456 Data Street', permanentAddress: '456 Data Street', dob: '1990-04-05' },
];

// --- Custom Alert/Modal Component (unchanged) ---
const AppAlert = ({ message, type, onConfirm, onCancel }) => {
  if (!message) return null;

  const baseClasses = "fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300";
  const modalClasses = "bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full transform transition-transform duration-300 scale-100";
  const headerClasses = type === 'error' ? "text-red-600" : type === 'confirm' ? "text-amber-600" : "text-indigo-600";
  const headerText = type === 'error' ? "Error" : type === 'confirm' ? "Confirm Action" : "Success";

  return (
    <div className={`${baseClasses} bg-gray-900 bg-opacity-70 backdrop-blur-sm`}>
      <div className={modalClasses}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-xl font-bold ${headerClasses}`}>{headerText}</h3>
          {(type !== 'confirm' && onCancel) && (
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition">
              <X size={20} />
            </button>
          )}
        </div>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          {type === 'confirm' && (
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition shadow-sm"
            >
              Cancel
            </button>
          )}
          <button
            onClick={type === 'confirm' ? onConfirm : onCancel}
            className={`px-4 py-2 text-white font-medium rounded-lg transition shadow-md ${
              type === 'error'
                ? "bg-red-500 hover:bg-red-600"
                : type === 'confirm'
                ? "bg-amber-500 hover:bg-amber-600"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {type === 'confirm' ? "Proceed" : "OK"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Employee Dashboard Component ---
const EmployeeDashboard = ({
  employees, setEmployees, alertState, setAlertState
}) => {
  // Re-added state for the form
  const emptyForm = {
    empId: "", type: "", idNo: "", title: "", name: "", designation: "",
    directory: "", division: "", dateOfJoin: "", dateOfPost: "",
    qualification: "", discipline: "", sex: "", bloodGroup: "", phone: "",
    address: "", permanentAddress: "", dob: ""
  };
  
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const showAlert = (message, type = 'success', onConfirm = null, onCancel = null) => {
    setAlertState({ message, type, onConfirm, onCancel });
  };

  const closeAlert = () => {
    setAlertState({ message: null, type: null, onConfirm: null, onCancel: null });
  };
  
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validateForm = () => {
    if (!form.name.trim()) return showAlert("Full Name is required", 'error');
    if (!form.empId.trim()) return showAlert("Employee ID is required", 'error');
    if (!form.phone.match(/^[0-9]{10}$/)) return showAlert("Enter a valid 10-digit phone number", 'error');
    if (!form.dateOfJoin || !form.dob) return showAlert("Please fill date fields properly", 'error');
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (alertState.message) return;
    if (!validateForm()) return;
    
    // Simulate API save
    if (editId) {
      setEmployees(employees.map(emp => emp.id === editId ? { ...form, id: editId } : emp));
      showAlert("Employee updated successfully!");
    } else {
      const newId = `E${Math.floor(Math.random() * 10000) + 2000}`;
      // Ensure empId is set in the data if the form field was edited
      setEmployees([...employees, { ...form, id: newId, empId: form.empId || newId }]);
      showAlert("Employee added successfully!");
    }

    setForm(emptyForm);
    setEditId(null);
  };

  const handleEdit = (id) => {
    const emp = employees.find(e => e.id === id);
    setForm(emp);
    setEditId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  const handleDelete = (id) => {
    showAlert(
      "Are you sure you want to delete this employee record? This action cannot be undone.",
      'confirm',
      () => {
        setEmployees(employees.filter(emp => emp.id !== id));
        // If the deleted employee was the one being edited, reset the form
        if (editId === id) {
            setForm(emptyForm);
            setEditId(null);
        }
        showAlert("Employee deleted.");
      },
      closeAlert
    );
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.division.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fields array remains the same for table mapping
  const fields = [
    { key: "empId", label: "Employee ID", type: "text", required: true },
    { key: "type", label: "Type", type: "select", options: ["Staff", "Contract"], required: true },
    { key: "idNo", label: "ID Number", type: "text", required: true },
    { key: "title", label: "Title", type: "select", options: ["Mr.", "Ms.", "Mrs.", "Dr."], required: true },
    { key: "name", label: "Full Name", type: "text", required: true },
    { key: "designation", label: "Designation", type: "select", options: ["Software Engineer", "Director", "Group Director", "Intern"], required: true },
    { key: "directory", label: "Directory", type: "select", options: ["DIT", "DOI", "DOVI"], required: true },
    { key: "division", label: "Division", type: "select", options: ["Development", "SDD", "CND", "Networking"], required: true },
    { key: "dateOfJoin", label: "Date of Joining", type: "date", required: true },
    { key: "dateOfPost", label: "Date of Posting", type: "date", required: false },
    { key: "qualification", label: "Qualification", type: "text", required: false },
    { key: "discipline", label: "Discipline", type: "select", options: ["Computer Science", "Statistics"], required: false },
    { key: "sex", label: "Sex", type: "select", options: ["Male", "Female", "Other"], required: true },
    { key: "bloodGroup", label: "Blood Group", type: "text", required: false },
    { key: "phone", label: "Phone (10 digits)", type: "tel", required: true },
    { key: "address", label: "Address (Current)", type: "text", required: true },
    { key: "permanentAddress", label: "Permanent Address", type: "text", required: true },
    { key: "dob", label: "Date of Birth", type: "date", required: true }
  ];

  return (
    <div className="max-w-8xl mx-auto my-8 p-6 lg:p-10 bg-white rounded-3xl shadow-2xl shadow-indigo-100/50">
      
      {/* Overall Application Heading - COLOR CHANGED TO INDIGO-700 */}
      <h1 className="text-4xl font-extrabold text-indigo-700 text-center mb-12">
        Employee Dashboard
      </h1>

      {/* Employee Form Card - HEADING INSIDE FORM REMOVED */}
      <form
        className="mb-12 bg-gray-50 p-6 rounded-2xl border border-indigo-100 shadow-xl shadow-indigo-200/50"
        onSubmit={handleSubmit}
      >
        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map(field => (
            <div key={field.key} className="flex flex-col">
              <label className="font-semibold mb-1.5 text-sm text-gray-700" htmlFor={field.key}>
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              {field.type === 'select' ? (
                <select
                  id={field.key}
                  name={field.key}
                  value={form[field.key]}
                  onChange={handleChange}
                  required={field.required}
                  className="p-3 rounded-lg border border-gray-300 bg-white text-sm transition-all duration-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none shadow-inner"
                >
                  <option value="">-- Select {field.label} --</option>
                  {field.options.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              ) : (
                <input
                  id={field.key}
                  type={field.type}
                  name={field.key}
                  value={form[field.key]}
                  onChange={handleChange}
                  required={field.required}
                  placeholder={`Enter ${field.label}`}
                  disabled={field.key === 'empId' && editId} 
                  className={`p-3 rounded-lg border border-gray-300 bg-white text-sm transition-all duration-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-inner ${field.key === 'empId' && editId ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                />
              )}
            </div>
          ))}
        </div>
        
        {/* Submit Button - Retained professional styling and shading */}
        <div className="mt-8 pt-6 border-t border-indigo-200 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
                type="submit"
                className="w-full sm:w-1/3 flex items-center justify-center py-3 text-lg font-semibold rounded-xl text-white cursor-pointer transition-all duration-300 
                           bg-gradient-to-r from-indigo-700 to-purple-700 hover:from-indigo-800 hover:to-purple-800 
                           shadow-xl shadow-indigo-400/50 transform hover:scale-[1.01] hover:-translate-y-0.5"
            >
                {editId ? <><Save size={20} className='mr-2' /> Update Record</> : <><UserPlus size={20} className='mr-2' /> Save Record</>}
            </button>
            {editId && (
              <button
                type="button"
                onClick={() => { setForm(emptyForm); setEditId(null); }}
                className="w-full sm:w-1/3 flex items-center justify-center py-3 text-lg font-semibold rounded-xl text-gray-700 bg-gray-200 hover:bg-gray-300 transition-all duration-300 shadow-md transform hover:scale-[1.01] hover:-translate-y-0.5"
              >
                <X size={20} className='mr-2' /> Cancel Edit
              </button>
            )}
        </div>
      </form>

      {/* Search Bar Area - Retained clean styling and shadow */}
      <div className="flex justify-center mb-10">
        <div className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
                type="text"
                className="w-full p-4 pl-12 rounded-xl border border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 shadow-lg transition-shadow"
                placeholder="Search by Name, ID, Designation, or Division..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
      </div>


      {/* Employee Table - Retained Indigo Header and Border */}
      <h3 className="text-3xl font-bold text-indigo-700 mb-6 border-l-4 border-indigo-500 pl-4 py-1">
        Employee List ({filteredEmployees.length} Found)
      </h3>
      
      <div className="overflow-x-auto rounded-xl shadow-2xl shadow-indigo-200/50 border border-indigo-100">
        <table className="w-full border-collapse min-w-[1800px] text-left">
          <thead>
            <tr className="bg-indigo-700 text-white shadow-md">
              {fields.map(field => (
                <th key={field.key} className="p-4 text-sm font-bold uppercase tracking-wider border-r border-indigo-600 last:border-r-0">
                  {field.label}
                </th>
              ))}
              <th className="p-4 text-sm font-bold uppercase tracking-wider w-40 text-center"> 
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length ? filteredEmployees.map((emp, index) => (
              <tr 
                key={emp.id} 
                className={`text-sm ${index % 2 === 0 ? 'bg-white' : 'bg-indigo-50'} hover:bg-indigo-200 transition-colors duration-200 cursor-pointer`}
              >
                {fields.map(field => (
                  <td key={field.key} className="p-3.5 text-gray-800 border-r border-gray-200 last:border-r-0 whitespace-nowrap">
                    {emp[field.key]}
                  </td>
                ))}
                <td className="p-3.5 text-center whitespace-nowrap">
                  {/* Edit button - Retained hover/shadow effects */}
                  <button
                    className="py-2 px-3 m-1 rounded-lg font-medium text-xs transition-all duration-300 bg-indigo-500 text-white hover:bg-indigo-600 shadow-md transform hover:-translate-y-0.5"
                    onClick={() => handleEdit(emp.id)}
                    aria-label={`Edit ${emp.name}`}
                  >
                    <Edit size={14} />
                  </button>
                  {/* Delete button - Retained hover/shadow effects */}
                  <button
                    className="py-2 px-3 m-1 rounded-lg font-medium text-xs transition-all duration-300 bg-red-500 text-white hover:bg-red-600 shadow-md transform hover:-translate-y-0.5"
                    onClick={() => handleDelete(emp.id)}
                    aria-label={`Delete ${emp.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            )) : <tr>
              <td colSpan={fields.length + 1} className="text-center p-8 text-indigo-600 font-semibold bg-white">
                No employees found matching the search criteria. Try a different query.
              </td>
            </tr>}
          </tbody>
        </table>
      </div>

      {/* Render Alert/Confirmation Modal */}
      <AppAlert 
        message={alertState.message} 
        type={alertState.type}
        onConfirm={alertState.onConfirm}
        onCancel={closeAlert}
      />
    </div>
  );
};

// --- App Wrapper to hold Global State and Styles ---
const App = () => {
  const [employees, setEmployees] = useState(initialEmployees);
  const [alertState, setAlertState] = useState({ message: null, type: null, onConfirm: null, onCancel: null });

  return (
    // Global body styles applied here
    <div className="min-h-screen bg-gray-100 font-sans text-gray-700 pb-16">
      <EmployeeDashboard 
        employees={employees} 
        setEmployees={setEmployees} 
        alertState={alertState}
        setAlertState={setAlertState}
      />
    </div>
  );
};

export default App;
