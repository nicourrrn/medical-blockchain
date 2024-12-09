import React, { useState } from "react";
import apiService from "../services/apiService";

const InsuranceForm = ({ walletAddress }) => {
  const [formData, setFormData] = useState({
    age: "",
    sex: "",
    bmi: "",
    smoker: "",
    region: "",
    children: "",
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await apiService.createInsurance({ ...formData, walletAddress });
      setResult(response.data);
    } catch (error) {
      console.error("Error creating insurance:", error);
      alert("Failed to create insurance. Please try again.");
    }
  };

  return (
    <div>
      <h2>Insurance Creation Form</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Age:
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Sex:
          <select name="sex" value={formData.sex} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>
        <label>
          BMI:
          <input
            type="number"
            step="0.01"
            name="bmi"
            value={formData.bmi}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Smoker:
          <select name="smoker" value={formData.smoker} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>
        <label>
          Region:
          <select name="region" value={formData.region} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="northeast">Northeast</option>
            <option value="southeast">Southeast</option>
            <option value="northwest">Northwest</option>
            <option value="southwest">Southwest</option>
          </select>
        </label>
        <label>
          Children:
          <input
            type="number"
            name="children"
            value={formData.children}
            onChange={handleChange}
            required
          />
        </label>
        <button type="submit">Submit</button>
      </form>

      {result && (
        <div>
          <h3>Insurance Details</h3>
          <p>Estimated Charges: ${result.charges.toFixed(2)}</p>
          <p>Policy ID: {result.policyId}</p>
        </div>
      )}
    </div>
  );
};

export default InsuranceForm;
