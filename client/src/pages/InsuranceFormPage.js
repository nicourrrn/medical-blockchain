import React, { useState } from "react";
import { Box, TextField, Button } from "@mui/material";
import apiService from "../services/apiService";

const InsuranceFormPage = () => {
  const [userInfo, setUserInfo] = useState({
    address: "",
    contract: "",
    mail: "",
    name: "",
    age: 0,
    sex: "male",
    bmi: 0,
    children: 0,
    smoker: false,
    region: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({
      ...userInfo,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Make API call to submit user information
    try {
      const token = localStorage.getItem("token");
      await apiService.postUserInfo(userInfo, token);
      alert("User information saved successfully!");
    } catch (err) {
      alert("Error saving user information");
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: "0 auto", padding: 2 }}>
      <h2>User Information Form</h2>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          name="name"
          value={userInfo.name}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Email"
          name="mail"
          value={userInfo.mail}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        {/* Add other fields similarly */}
        <Button type="submit" variant="contained" color="primary">
          Submit
        </Button>
      </form>
    </Box>
  );
};

export default InsuranceFormPage;
