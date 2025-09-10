# Provider Patient Profile Implementation

## Overview
This implementation provides a comprehensive patient profile system for healthcare providers, built as a React component that integrates with the existing Vitals7 frontend architecture. It mirrors the functionality of the HTML report while providing an interactive, data-driven experience.

## Features Implemented

### 1. Data Integration
- **CSV Data Loading**: Uses the existing `loadCSVWithFallback` utility to load patient data from:
  - `UserTable.csv` - Basic patient demographics
  - `UserDetailsTable.csv` - Additional patient details
  - `MedicalRecordTable.csv` - Comprehensive medical records with JSON fields
  - `VitalRecordTable.csv` - Vital signs measurements
  - `VitalTable.csv` - Vital types and normal ranges
  - `AppointmentTable.csv` - Patient appointment history
  - `ProviderTable.csv` - Provider information
- **Data Processing**: Processes and joins data from multiple tables, including JSON field parsing

### 2. Patient Search & Selection
- **Real-time Search**: Search patients by name, email, or patient ID
- **Patient Dropdown**: Select specific patients from filtered results
- **Dynamic Loading**: Patient data loads based on selection

### 3. Patient Statistics Dashboard
- **Total Patients**: Count of all patients in the system
- **Active Patients**: Patients with recent appointments
- **With Vital Records**: Patients who have vital signs data
- **With Medical Records**: Patients with complete medical records

### 4. Comprehensive Patient Profile

#### Patient Header
- **Patient Avatar**: Initials-based avatar with patient name
- **Demographics**: Age, gender, patient ID
- **Status Badge**: Active/inactive status indicator
- **Last Visit**: Most recent appointment date

#### Demographics Card
- Date of birth and calculated age
- Gender information
- Contact details (phone, email, address)
- Patient identification

#### Current Vital Signs Card
- **Real-time Vitals**: Heart rate, blood pressure, temperature, BMI
- **Alert Indicators**: Color-coded status badges (normal, medium, high)
- **Interactive Chart**: Vital signs trends over time using Chart.js
- **Historical Data**: Integration with vital records

#### Medical History Card
- Hypertension and diabetes status
- Family history information
- Allergies and chronic conditions
- Current medications

#### Lifestyle Factors Card
- Smoking and alcohol consumption status
- Physical activity levels
- Diet type and sleep metrics
- Sleep quality indicators

#### Mental Health & Wellness Card
- Depression and anxiety scores
- Stress levels and energy levels
- Overall wellness index
- Spiritual wellness indicators

### 5. Interactive Components

#### Vital Signs Chart
- **Chart.js Integration**: Interactive line chart showing vital trends
- **Multi-metric Display**: Systolic/diastolic BP, heart rate
- **Time-based Data**: Last 8 months of vital records
- **Responsive Design**: Adapts to container size

#### Patient Timeline
- **Vital Records Timeline**: Chronological display of vital measurements
- **Detailed Information**: Values, normal ranges, and notes
- **Visual Timeline**: Dot-based timeline with connecting lines
- **Contextual Data**: Recorded by, timestamps, and descriptions

### 6. Recent Appointments Table
- **Appointment History**: Last 5 appointments for selected patient
- **Provider Information**: Linked provider details
- **Status Tracking**: Appointment status with color coding
- **Action Buttons**: View appointment details

### 7. Action Buttons
- **Schedule Appointment**: Direct appointment scheduling
- **Send Message**: Patient communication
- **Update Medical Record**: Record modification
- **Print Report**: Report generation

## Technical Implementation

### Components Created
1. **ProviderPatientProfile.jsx** - Main page component
2. **VitalSignsChart.jsx** - Chart.js integration for vital trends
3. **PatientTimeline.jsx** - Timeline component for vital records

### Data Processing
1. **JSON Field Parsing**: Safely parses JSON fields from medical records
2. **Data Joining**: Combines data from multiple CSV sources
3. **Age Calculation**: Computes patient age from date of birth
4. **Vital Processing**: Groups and averages vital records by time periods
5. **Appointment Linking**: Connects appointments with provider information

### Integration Points
- **Routing**: Added to `App.jsx` with admin-only access
- **Navigation**: Added to sidebar in `Sidebar.jsx` with user icon
- **Styling**: Consistent with existing Vitals7 design system
- **Data**: Uses existing CSV loading utilities and data structure

## Usage

### Accessing the Page
1. Navigate to `/provider-patient-profile` in the application
2. Requires admin role (bypassed in current implementation)
3. Available in the sidebar navigation under "Patient Profile"

### Using Patient Search
1. Type in the search box to filter patients by name, email, or ID
2. Select a patient from the dropdown menu
3. Patient profile loads automatically with all data

### Viewing Patient Data
- **Statistics**: Overview cards show patient counts
- **Profile**: Comprehensive patient information in organized cards
- **Charts**: Interactive vital signs trends
- **Timeline**: Chronological vital records
- **Appointments**: Recent appointment history

## Data Structure

### Patient Data Fields Used
- **UserTable**: `user_id`, `first_name`, `last_name`, `date_of_birth`, `email`, `phone`, `address`
- **UserDetailsTable**: Additional lifestyle and health details
- **MedicalRecordTable**: JSON fields for comprehensive medical data
- **VitalRecordTable**: `vital_code`, `value`, `recorded_at`, `recorded_by`, `notes`
- **VitalTable**: `name`, `code`, `unit`, `description`
- **AppointmentTable**: `start_time`, `status`, `appointment_type`, `notes`, `provider_id`

### JSON Field Processing
The system safely parses JSON fields from medical records:
- `demographics`: Gender, age calculations
- `anthropometry`: BMI, weight, height
- `vitals`: Current vital signs
- `sleep_metrics`: Sleep duration and quality
- `lifestyle`: Smoking, alcohol, activity, diet
- `medical_history`: Conditions, allergies, medications
- `mental_health`: Depression, anxiety, stress scores
- `holistic_factors`: Wellness indices and spiritual wellness
- `care_planning`: Treatment goals and next steps

## Alert System
- **Color-coded Alerts**: Normal (green), medium (yellow), high (red)
- **Vital Range Checking**: Automatic assessment against normal ranges
- **Contextual Information**: Range explanations and recommendations

## Responsive Design
- **Mobile-first**: Works on all device sizes
- **Grid Layouts**: Responsive card grids
- **Touch-friendly**: Optimized for mobile interactions
- **Consistent Styling**: Matches existing Vitals7 design system

## Future Enhancements
- Add patient creation/editing functionality
- Implement real-time vital monitoring
- Add medication management
- Include lab results integration
- Add patient communication features
- Implement care plan management
- Add patient photo upload
- Include family member information
- Add insurance and billing information
- Implement patient portal integration

## Error Handling
- **Graceful JSON Parsing**: Handles malformed JSON gracefully
- **Missing Data**: Shows "Unknown" or "N/A" for missing information
- **Loading States**: Shows loading spinner during data fetch
- **Empty States**: Appropriate messages when no data is available
- **Search Feedback**: Clear indication when no patients match search

## Performance Considerations
- **Efficient Data Processing**: Uses useMemo for expensive calculations
- **Component Optimization**: Prevents unnecessary re-renders
- **Chart Performance**: Proper chart cleanup and memory management
- **Search Optimization**: Debounced search for better performance
