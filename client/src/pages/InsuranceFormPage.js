import React, { useState } from "react";
import { Box, TextField, Button, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel } from "@mui/material";
import { useNavigate } from "react-router-dom";
import apiService from "../services/apiService";

const InsuranceFormPage = () => {
  const [userInfo, setUserInfo] = useState({
    mail: "",
    name: "",
    age: 0,
    sex: "male",
    bmi: 0.0,
    children: 0,
    smoker: false,
    region: "southwest",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!userInfo.mail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.mail)) {
      newErrors.mail = "Please enter a valid email address.";
    }
    if (!userInfo.name || userInfo.name.trim() === "") {
      newErrors.name = "Name is required.";
    }
    if (userInfo.age <= 0 || userInfo.age > 120) {
      newErrors.age = "Please enter a valid age (1-120).";
    }
    if (userInfo.bmi <= 0 || userInfo.bmi > 100) {
      newErrors.bmi = "Please enter a valid BMI (greater than 0 and realistic).";
    }
    if (userInfo.children < 0 || userInfo.children > 20) {
      newErrors.children = "Please enter a valid number of children (0-20).";
    }
    if (!userInfo.region) {
      newErrors.region = "Region is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({
      ...userInfo,
      [name]: name === "age" || name === "bmi" || name === "children" ? parseFloat(value) : value,
    });
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setUserInfo({
      ...userInfo,
      [name]: checked,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return; // Exit if the form is invalid
    }

    const payload = {
      ...userInfo,
      sex: userInfo.sex === "male" ? 1 : 2, // Convert sex to numeric representation
    };

    try {
      const token = localStorage.getItem("token");
      const response = await apiService.postUserInfo(payload, token); // API call to post user info
      navigate("/payment", { state: { payment: response.payment } }); // Redirect to PaymentPage with payment info
    } catch (err) {
      alert(err.response?.data?.detail || "Error saving user information");
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: "0 auto", padding: 2 }}>
      <h2>User Information Form</h2>
      <form onSubmit={handleSubmit}>
        {/* Form Fields with validation */}
        <TextField
          label="Email"
          name="mail"
          value={userInfo.mail}
          onChange={handleInputChange}
          error={!!errors.mail}
          helperText={errors.mail}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Name"
          name="name"
          value={userInfo.name}
          onChange={handleInputChange}
          error={!!errors.name}
          helperText={errors.name}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Age"
          name="age"
          type="number"
          value={userInfo.age}
          onChange={handleInputChange}
          error={!!errors.age}
          helperText={errors.age}
          fullWidth
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Sex</InputLabel>
          <Select
            name="sex"
            value={userInfo.sex}
            onChange={handleInputChange}
          >
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="BMI"
          name="bmi"
          type="number"
          value={userInfo.bmi}
          onChange={handleInputChange}
          error={!!errors.bmi}
          helperText={errors.bmi}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Children"
          name="children"
          type="number"
          value={userInfo.children}
          onChange={handleInputChange}
          error={!!errors.children}
          helperText={errors.children}
          fullWidth
          margin="normal"
        />
        <FormControlLabel
          control={
            <Switch
              name="smoker"
              checked={userInfo.smoker}
              onChange={handleSwitchChange}
            />
          }
          label="Smoker"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Region</InputLabel>
          <Select
            name="region"
            value={userInfo.region}
            onChange={handleInputChange}
            error={!!errors.region}
          >
            <MenuItem value="southwest">Southwest</MenuItem>
            <MenuItem value="southeast">Southeast</MenuItem>
            <MenuItem value="northwest">Northwest</MenuItem>
            <MenuItem value="northeast">Northeast</MenuItem>
          </Select>
        </FormControl>
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Submit
        </Button>
      </form>
    </Box>
  );
};

export default InsuranceFormPage;
