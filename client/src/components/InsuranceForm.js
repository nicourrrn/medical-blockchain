import React, { useState } from "react";
import { Box, TextField, Button, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel } from "@mui/material";
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
          label="Address"
          name="address"
          value={userInfo.address}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Contract"
          name="contract"
          value={userInfo.contract}
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
        <TextField
          label="Name"
          name="name"
          value={userInfo.name}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Age"
          name="age"
          type="number"
          value={userInfo.age}
          onChange={handleInputChange}
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
          fullWidth
          margin="normal"
        />
        <TextField
          label="Children"
          name="children"
          type="number"
          value={userInfo.children}
          onChange={handleInputChange}
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
        <TextField
          label="Region"
          name="region"
          value={userInfo.region}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Submit
        </Button>
      </form>
    </Box>
  );
};

export default InsuranceFormPage;