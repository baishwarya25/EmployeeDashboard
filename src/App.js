import React, { useState, useEffect } from "react";
import "./EmployeeDashboard.css";

export default function EmployeeDashboard() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    empId: "", type: "", idNo: "", title: "", name: "", designation: "",
    directory: "", division: "", dateOfJoin: "", dateOfPost: "",
    qualification: "", discipline: "", sex: "", bloodGroup: "", phone: "",
    address: "", permanentAddress: "", dob: ""
  });
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => { fetchEmployees(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validateForm = () => {
    if (!form.name.trim()) return alert("Name is required");
    if (!form.empId.trim()) return alert("Employee ID is required");
    if (!form.phone.match(/^[0-9]{10}$/)) return alert("Enter a valid 10-digit phone number");
    if (!form.dateOfJoin || !form.dob) return alert("Please fill date fields properly");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const url = editId 
        ? `http://localhost:5000/api/employees/${editId}`
        : "http://localhost:5000/api/employees";
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.error) alert("Error: " + data.error);
      else alert(data.message || (editId ? "Employee updated!" : "Employee added!"));

      setForm({
        empId: "", type: "", idNo: "", title: "", name: "", designation: "",
        directory: "", division: "", dateOfJoin: "", dateOfPost: "",
        qualification: "", discipline: "", sex: "", bloodGroup: "", phone: "",
        address: "", permanentAddress: "", dob: ""
      });
      setEditId(null);
      fetchEmployees();
    } catch (err) { console.error(err); alert("Failed to save employee"); }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/employees");
      const data = await res.json();
      setEmployees(data.map(row => ({
        id: row.ID, empId: row.EMP_ID, type: row.TYPE, idNo: row.ID_NO,
        title: row.TITLE, name: row.NAME, designation: row.DESIGNATION,
        directory: row.DIRECTORY, division: row.DIVISION,
        dateOfJoin: row.DATE_OF_JOIN ? row.DATE_OF_JOIN.split("T")[0] : "",
        dateOfPost: row.DATE_OF_POST ? row.DATE_OF_POST.split("T")[0] : "",
        qualification: row.QUALIFICATION, discipline: row.DISCIPLINE,
        sex: row.SEX, bloodGroup: row.BLOOD_GROUP, phone: row.PHONE,
        address: row.ADDRESS, permanentAddress: row.PERMANENT_ADDRESS,
        dob: row.DOB ? row.DOB.split("T")[0] : ""
      })));
    } catch (err) { console.error(err); }
  };

  const handleEdit = (id) => {
    const emp = employees.find(e => e.id === id);
    setForm(emp);
    setEditId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this employee?")) {
      try {
        await fetch(`http://localhost:5000/api/employees/${id}`, { method: "DELETE" });
        fetchEmployees();
      } catch (err) { console.error(err); }
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <h2>Employee Dashboard</h2>

      <form className="employee-form" onSubmit={handleSubmit}>
        {["empId","type","idNo","name","qualification","bloodGroup","phone","address","permanentAddress"].map(k => (
          <input key={k} name={k} value={form[k]} onChange={handleChange} placeholder={k.replace(/([A-Z])/g," $1")} required />
        ))}

        <select name="title" value={form.title} onChange={handleChange} required>
          <option value="">Select Title</option>
          {["Mr.","Ms.","Mrs.","Dr."].map(v => <option key={v}>{v}</option>)}
        </select>

        <select name="designation" value={form.designation} onChange={handleChange} required>
          <option value="">Select Designation</option>
          {["Software Engineer","Director","Group Director","Intern"].map(v => <option key={v}>{v}</option>)}
        </select>

        <select name="directory" value={form.directory} onChange={handleChange} required>
          <option value="">Select Directory</option>
          {["DIT","DOI","DOVI"].map(v => <option key={v}>{v}</option>)}
        </select>

        <select name="division" value={form.division} onChange={handleChange} required>
          <option value="">Select Division</option>
          {["Development","SDD","CND","Networking"].map(v => <option key={v}>{v}</option>)}
        </select>

        <select name="discipline" value={form.discipline} onChange={handleChange}>
          <option value="">Select Discipline</option>
          {["Computer Science","Statistics"].map(v => <option key={v}>{v}</option>)}
        </select>

        <select name="sex" value={form.sex} onChange={handleChange} required>
          <option value="">Select Sex</option>
          {["Male","Female","Other"].map(v => <option key={v}>{v}</option>)}
        </select>

        <label>Date of Joining:<input type="date" name="dateOfJoin" value={form.dateOfJoin} onChange={handleChange} required /></label>
        <label>Date of Posting:<input type="date" name="dateOfPost" value={form.dateOfPost} onChange={handleChange} /></label>
        <label>Date of Birth:<input type="date" name="dob" value={form.dob} onChange={handleChange} required /></label>

        <button type="submit" className="submit-btn">{editId ? "Update Employee" : "Add Employee"}</button>
      </form>

      <input type="text" className="search-bar" placeholder="Search by Name, ID, or Designation" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              {Object.keys(form).map(k => <th key={k}>{k.replace(/([A-Z])/g," $1")}</th>)}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(emp => (
              <tr key={emp.id}>
                {Object.keys(form).map(k => <td key={k}>{emp[k]}</td>)}
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(emp.id)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(emp.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
