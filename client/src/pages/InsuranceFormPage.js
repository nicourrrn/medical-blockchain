import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Container,
  Paper,
  Typography,
  Divider,
  Grid,
  Card,
  CardContent
} from "@mui/material";
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
      navigate('/payment', { 
        state: { 
            premium: response.payment 
        }
    }); // Redirect to PaymentPage with payment info
    } catch (err) {
      alert(err.response?.data?.detail || "Error saving user information");
    }
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          py: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 3
        }}
      >
        <Paper 
          elevation={3}
          sx={{
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              p: 3,
              textAlign: 'center'
            }}
          >
            <Typography variant="h4" component="h1">
              Insurance Application
            </Typography>
            <Typography variant="subtitle1" sx={{ mt: 1 }}>
              Please fill in your information
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={3}>
                {/* Personal Information Section */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Personal Information
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Email"
                        name="mail"
                        value={userInfo.mail}
                        onChange={handleInputChange}
                        error={!!errors.mail}
                        helperText={errors.mail}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Name"
                        name="name"
                        value={userInfo.name}
                        onChange={handleInputChange}
                        error={!!errors.name}
                        helperText={errors.name}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* Health Information Section */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Health Information
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Age"
                        name="age"
                        type="number"
                        value={userInfo.age}
                        onChange={handleInputChange}
                        error={!!errors.age}
                        helperText={errors.age}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
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
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="BMI"
                        name="bmi"
                        type="number"
                        value={userInfo.bmi}
                        onChange={handleInputChange}
                        error={!!errors.bmi}
                        helperText={errors.bmi}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* Additional Information Section */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Additional Information
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Children"
                        name="children"
                        type="number"
                        value={userInfo.children}
                        onChange={handleInputChange}
                        error={!!errors.children}
                        helperText={errors.children}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
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
                    </Grid>
                    <Grid item xs={12} md={4}>
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
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  sx={{ 
                    minWidth: 200,
                    py: 1.5
                  }}
                >
                  Submit Application
                </Button>
              </Box>
            </CardContent>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default InsuranceFormPage;
