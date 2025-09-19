## Comprehensive Medical Data Generator (v0.2)

A complete synthetic data pipeline that generates realistic, interconnected CSV datasets for a medical system. It models users, providers, vitals, appointments, records, notifications, messages, documents, triggers, and calendar events with consistent foreign keys and plausible distributions.

### Table of Contents
- Overview
- Quick Start
- Configuration
- Data Generation Flow
- What Gets Generated (Datasets)
- Vital Sign Definitions and Ranges
- Generation Logic and Factors
  - Global Factors
  - Per-Table Logic
  - Per-Vital Logic
- Tables, Fields, and Example Rows
- Linkages and Data Integrity
- File Outputs
- Notes and Best Practices
- Reproducibility
- Adjusting Volumes and Bias
- Changelog

## Overview
Script: `reportsandtable/generate_medical_data_v.0.2.py`
- Language: Python
- Output: CSV files (schema-aligned) in an output directory
- Default scale: 1000 rows per table, except `AppointmentTable` (3000)
- Population: By default, about 70% of users are generated with at least one condition (hypertension, diabetes, or another chronic condition)

Use cases: demo data, frontend mocking, analytics prototypes, QA/testing, and data model validation.

## Quick Start
```bash
python reportsandtable/generate_medical_data_v.0.2.py --output-dir dataTables
```
- The command prints per-table export summaries and the destination path.
- Seeds are fixed for reproducibility.

## Configuration
- `--output-dir`: Directory for CSV exports. Defaults to `dataTables` beside the script.
- `--allow-global`: Include non-US data (names, phones, addresses) by setting `us_only=False`. Default is US-only.

Defaults baked into code (change in the class if needed):
- Sickness bias: `self.sickness_bias = 0.7` (≈70% users nudged to have at least one condition)
- Appointments volume in `generate_all_data`: `self.generate_appointments(3000)`

## Data Generation Flow
Executed in `generate_all_data()`:
1) `generate_user_details(1000)` → Users & user table
2) `generate_providers(1000)` → Providers
3) `generate_vital_table()` → Master vitals
4) `generate_medical_records()` → Anthropometry, vitals, history
5) `generate_appointments(3000)` → Weekday/business-hour appointments
6) `update_last_appointments()` → Set `MedicalRecordTable.last_appointment_id` to most recent appointment per user
7) `generate_vital_records(1000)` → Context-aware vital readings
8) `generate_vital_triggers(1000)` → Thresholds
9) `generate_notifications(1000)` → Alerts/reminders/system
10) `generate_messages(1000)` → Patient/provider messages
11) `generate_documents(1000)` → Clinical documents
12) `generate_calendar_events(1000)` → Calendar entries
13) `generate_add_providers(1000)` → Onboarding applications
14) `export_to_csv()` → Schema-aligned CSV files

## What Gets Generated (Datasets)
- `UserTable.csv`: Basic demographics and contact
- `UserDetailsTable.csv`: Lifestyle and extended attributes
- `ProviderTable.csv`: Clinician identities and specialties
- `VitalTable.csv`: Master vital definitions and normal ranges
- `MedicalRecordTable.csv`: Demographics, anthropometry, baseline vitals, history
- `AppointmentTable.csv`: Business-hours appointments with events, notes, payments (3000 rows)
- `VitalRecordTable.csv`: Time-stamped vital measurements per user
- `VitalTriggerTable.csv`: Notification thresholds per vital
- `NotificationTable.csv`: Alert/reminder/system messages
- `MessageTable.csv`: Patient-provider messages
- `UserDocumentTable.csv`: Uploaded/linked clinical documents
- `CalendarEventTable.csv`: Calendar entries linked to appointments/providers
- `AddProviderTable.csv`: Provider onboarding applications

All CSVs use a schema whitelist; extra/internal fields are ignored on export.

## Vital Sign Definitions and Ranges
From `VitalTable` master data:

| Code | Name | Unit | Normal Min | Normal Max |
|---|---|---|---:|---:|
| HR | Heart Rate | bpm | 60 | 100 |
| SBP | Systolic Blood Pressure | mmHg | 90 | 140 |
| DBP | Diastolic Blood Pressure | mmHg | 60 | 90 |
| TEMP | Body Temperature | °F | 97.0 | 99.5 |
| RR | Respiratory Rate | bpm | 12 | 20 |
| SPO2 | Oxygen Saturation | % | 95 | 100 |
| BMI | Body Mass Index | kg/m² | 18.5 | 25 |
| WEIGHT | Weight | lbs | 100 | 300 |
| HEIGHT | Height | in | 58 | 78 |
| GLUCOSE | Blood Glucose | mg/dL | 70 | 140 |

Notes:
- The generator may yield values outside “normal” to simulate illness or context (e.g., hypertension, COPD, fever).
- Vital triggers default to ~80% of min and/or 120% of max where applicable.

## Generation Logic and Factors

### Global Factors
- Age (18–90) and Gender: affect heart rate, blood pressure, and BMI distributions.
- BMI: derived from weight/height; influences BP, HR, waist/neck.
- Sickness Bias (~70%): increases probability of conditions and ensures at least one condition if otherwise none.
- Smoking/COPD: reduces SpO2, especially in older adults.
- Locale: US by default for names, phones, and addresses; global option available.
- Appointments: weekdays only (Mon–Fri), business hours (08:00–18:00), 15-minute grid.
- Randomness: normal and uniform sampling; fixed seeds for reproducibility.

### Per-Table Logic (Highlights)
- UserDetails + UserTable: realistic names, contact, lifestyle; sickness bias subtly increases smoking/substance probabilities.
- ProviderTable: specialties, license numbers, and US phone formats.
- MedicalRecordTable: anthropometry (height, BMI, waist/neck) and baseline vitals (HR, SBP/DBP, TEMP, SpO2) adjusted by age/gender/BMI and conditions.
- AppointmentTable: weekday/business-hours scheduling, durations by type, embedded check-in and vitals events.
- VitalRecordTable: per-reading values adjusted by age, BMI, smoking, and conditions (HTN, DM, COPD).
- VitalTriggerTable: thresholds around 0.8×min and/or 1.2×max; random enablement and recipients.
- NotificationTable: alert/reminder/system messages with realistic statuses and timestamps.
- MessageTable: realistic medical conversations; optional appointment linkage.
- UserDocumentTable: clinical categories (labs, imaging, prescriptions, notes) with realistic filenames and types.
- CalendarEventTable: appointments/follow-ups/labs/reminders with plausible locations.
- AddProviderTable: applications with status, docs, and optional approval links.

### Per-Vital Logic (Selected)
- HR: base by age (+small female adjustment), clamped 45–120; +1–6 bpm if BMI ≥35.
- BP: SBP ≈ 110 + age_factor + bmi_factor ± noise; DBP ≈ 70 + age_factor*0.3 + bmi_factor*0.5; elevated further if hypertensive.
- TEMP: around 98.6°F with modest noise; clamped 96.0–102.0.
- SpO2: typical 98±1; lower (~94±2) for COPD/older smokers; age >70 biases slightly lower.
- GLUCOSE: diabetics 150–280; otherwise ~95±15 with occasional 120–180 in older adults.

## Tables, Fields, and Example Rows
Below are the exported CSV fields with a compact example row for each table.

### UserTable.csv
| Field | Example |
|---|---|
| user_id | 8f8a1c58-3f5b-4c76-9b1e-1e7a1a1d9b22 |
| first_name | John |
| last_name | Smith |
| date_of_birth | 1975-04-23 |
| email | john.smith257@gmail.com |
| phone | (415) 862-3498 |
| address | 123 Main St, Denver, CO 80203 |
| created_at | 2025-06-18T10:21:00 |
| updated_at | 2025-09-05T14:12:00 |

### UserDetailsTable.csv
| Field | Example |
|---|---|
| user_id | 8f8a1c58-3f5b-4c76-9b1e-1e7a1a1d9b22 |
| smoker | True |
| snoring | False |
| neck_size | Medium |
| substance_abuse | False |
| marijuana | True |
| vaping | False |
| alcohol | True |
| alcohol_frequency | Weekly |
| medical_record_id | 8f8a1c58-3f5b-4c76-9b1e-1e7a1a1d9b22 |
| created_at | 2025-02-11T09:13:00 |
| updated_at | 2025-08-30T16:50:00 |

### ProviderTable.csv
| Field | Example |
|---|---|
| id | 6b1c4e91-8a43-41a0-8c52-2f3ac7d4f2e0 |
| username | sarah.lee412 |
| email | sarah.lee@example.com |
| prefix | Dr. |
| first_name | Sarah |
| last_name | Lee |
| specialization | Cardiology |
| description | Experienced Cardiology specialist with over 15 years of practice. |
| status | active |
| profile_picture | `https://example.com/profiles/6b1c...f2e0.jpg` |
| license_number | MD543210 |
| phone | (312) 555-9734 |
| created_at | 2024-07-21T13:22:00 |
| updated_at | 2025-08-29T11:45:00 |

### VitalTable.csv
| Field | Example |
|---|---|
| code | SBP |
| name | Systolic Blood Pressure |
| description | Systolic pressure |
| category | Cardiovascular |
| unit | mmHg |
| normal_range_min | 90 |
| normal_range_max | 140 |
| created_at | 2024-03-10T10:00:00 |
| updated_at | 2025-08-31T12:00:00 |

### MedicalRecordTable.csv
| Field | Example |
|---|---|
| user_id | 8f8a1c58-3f5b-4c76-9b1e-1e7a1a1d9b22 |
| demographics | {"gender":"Male","age":52} |
| anthropometry | {"bmi":31.2,"height":70,"weight":218,"waist_circumference":40.5,"neck_circumference":16.2} |
| vitals | {"heart_rate":78,"systolic_bp":142,"diastolic_bp":92,"temperature":98.6,"oxygen_saturation":96} |
| sleep_metrics | {"sleep_duration":6.8,"ess_score":8,"snoring":true,"sleep_quality_index":6} |
| lifestyle | {"smoking_status":"Former","alcohol_consumption":"Moderate","physical_activity_level":"Light","diet_type":"Standard"} |
| medical_history | {"hypertension":true,"diabetes":false,"family_history":"Heart Disease","allergies":["None"],"chronic_conditions":["Arthritis"],"medications":["Lisinopril 10mg daily"]} |
| mental_health | {"depression_score":3,"anxiety_score":4,"stress_levels":"Moderate","energy_levels":6} |
| holistic_factors | {"ayurvedic_dosha_type":"Pitta","overall_wellness_index":62,"spiritual_wellness":"Good"} |
| care_planning | {"treatment_goals":["Blood Pressure Control"],"next_steps":"Follow up in 3 months"} |
| primary_provider_id | 6b1c4e91-8a43-41a0-8c52-2f3ac7d4f2e0 |
| last_appointment_id | 0b7c3b21-9b5f-4f8f-9a90-2b3a88a31e74 |
| created_at | 2025-05-03T12:44:00 |
| updated_at | 2025-09-10T08:10:00 |

### AppointmentTable.csv
| Field | Example |
|---|---|
| id | 0b7c3b21-9b5f-4f8f-9a90-2b3a88a31e74 |
| start_time | 1758185400 |
| time_slot | {"start":1758185400,"end":1758187200} |
| notes | Follow-up appointment to monitor treatment progress |
| provider_notes | Patient responding well to current treatment plan |
| events | [{"timestamp":"2025-09-18T09:00:00","type":"check_in","description":"Patient checked in","performer":"reception"},{"timestamp":"2025-09-18T09:05:00","type":"vitals","description":"Vital signs taken","performer":"nurse"}] |
| status | completed |
| payment_status | paid |
| messages | [] |
| user_id | 8f8a1c58-3f5b-4c76-9b1e-1e7a1a1d9b22 |
| provider_id | 6b1c4e91-8a43-41a0-8c52-2f3ac7d4f2e0 |
| payment_method | insurance |
| stripe_price_id | price_456789 |
| follow_up_appointment_id | 2a8f6a2c-1a4d-4bda-8d6b-2d8a0a1ae9f1 |
| appointment_type | follow_up |
| duration_minutes | 30 |
| created_at | 2025-08-15T10:40:00 |
| updated_at | 2025-09-18T11:10:00 |

### VitalRecordTable.csv
| Field | Example |
|---|---|
| composite_key | SBP#2025-09-12T13:25:00.000000 |
| vital_code | SBP |
| user_id | 8f8a1c58-3f5b-4c76-9b1e-1e7a1a1d9b22 |
| value | 148 |
| recorded_at | 2025-09-12T13:25:00 |
| recorded_by | device_monitor |
| notes | Slightly elevated |
| device_id | device_7342 |
| location | clinic |
| appointment_id | 0b7c3b21-9b5f-4f8f-9a90-2b3a88a31e74 |
| created_at | 2025-09-12T13:25:00 |
| updated_at | 2025-09-12T13:25:00 |

### VitalTriggerTable.csv
| Field | Example |
|---|---|
| id | 5a2e4f73-96ad-4402-8c3d-df4e0f7b0c21 |
| user_id | 8f8a1c58-3f5b-4c76-9b1e-1e7a1a1d9b22 |
| vital_code | SBP |
| min_value | 72.0 |
| max_value | 168.0 |
| trigger_type | ["email","sms"] |
| enabled | True |
| notify_to | dr.cardiology@example.com |
| provider_id | 6b1c4e91-8a43-41a0-8c52-2f3ac7d4f2e0 |
| created_at | 2025-06-20T09:00:00 |
| updated_at | 2025-09-01T10:15:00 |

### NotificationTable.csv
| Field | Example |
|---|---|
| id | 4f6a8a1b-3a1d-491f-9e2f-1b2b3c4d5e6f |
| message_type | vital_alert |
| message | Your blood pressure reading is outside normal range. Please contact your provider. |
| status | delivered |
| user_id | 8f8a1c58-3f5b-4c76-9b1e-1e7a1a1d9b22 |
| provider_id | 6b1c4e91-8a43-41a0-8c52-2f3ac7d4f2e0 |
| appointment_id | 0b7c3b21-9b5f-4f8f-9a90-2b3a88a31e74 |
| vital_trigger_id | 5a2e4f73-96ad-4402-8c3d-df4e0f7b0c21 |
| sent_at | 2025-09-12T13:26:00 |
| read_at | 2025-09-12T14:05:00 |
| created_at | 2025-09-12T13:26:00 |
| updated_at | 2025-09-12T14:05:30 |

### MessageTable.csv
| Field | Example |
|---|---|
| message_id | 7a4b9c12-58c3-4f52-b7e1-9e7beed11f20 |
| sender_id | 8f8a1c58-3f5b-4c76-9b1e-1e7a1a1d9b22 |
| receiver_id | 6b1c4e91-8a43-41a0-8c52-2f3ac7d4f2e0 |
| message | Dr. Lee, my home BP today was 145/95. |
| is_read | True |
| previous_message_id |  |
| next_message_id |  |
| appointment_id | 0b7c3b21-9b5f-4f8f-9a90-2b3a88a31e74 |
| thread_id | 1e2d3c4b-5a6f-7e8d-9c01-2b3a4d5e6f70 |
| created_at | 2025-09-12T13:40:00 |
| updated_at | 2025-09-12T13:55:00 |

### UserDocumentTable.csv
| Field | Example |
|---|---|
| identifier | 8e9d1a34-5f6b-4c32-8b11-1f2e3a4b5c6d |
| document_name | Hemoglobin_A1C_20250901.pdf |
| document_type | lab_result |
| uploaded_by | 6b1c4e91-8a43-41a0-8c52-2f3ac7d4f2e0 |
| description | Medical document for patient 8f8a1c58 |
| messages | [] |
| user_id | 8f8a1c58-3f5b-4c76-9b1e-1e7a1a1d9b22 |
| access | ["6b1c4e91-8a43-41a0-8c52-2f3ac7d4f2e0"] |
| file_url | `https://storage.example.com/documents/2f3e...c9a2.pdf` |
| file_size | 264381 |
| appointment_id | 0b7c3b21-9b5f-4f8f-9a90-2b3a88a31e74 |
| created_at | 2025-09-01T10:20:00 |
| updated_at | 2025-09-10T08:11:00 |

### CalendarEventTable.csv
| Field | Example |
|---|---|
| id | 3e1a2b4c-5d6e-7f81-92a3-b4c5d6e7f890 |
| user_id | 8f8a1c58-3f5b-4c76-9b1e-1e7a1a1d9b22 |
| title | Follow Up Event |
| start | 2025-09-18T09:00:00 |
| end | 2025-09-18T10:00:00 |
| type | follow_up |
| appointment_id | 0b7c3b21-9b5f-4f8f-9a90-2b3a88a31e74 |
| linked_user_id |  |
| provider_id | 6b1c4e91-8a43-41a0-8c52-2f3ac7d4f2e0 |
| description | Calendar event for follow_up |
| location | Main Clinic |
| created_at | 2025-08-29T15:30:00 |
| updated_at | 2025-09-05T11:00:00 |

### AddProviderTable.csv
| Field | Example |
|---|---|
| id | 9b8c7a6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d |
| email | cardiology.applicant@example.com |
| prefix | MD |
| first_name | Michael |
| last_name | Brown |
| specialization | Cardiology |
| description | Seeking to join as a Cardiology specialist |
| profile_picture | `https://example.com/applications/0d1e...f3a4.jpg` |
| documents | ["license_4821.pdf","cv_7350.pdf"] |
| status | pending_approval |
| license_number | LIC384920 |
| phone | (617) 345-2299 |
| reviewed_by | admin_001 |
| review_notes | Under review |
| approved_provider_id |  |
| created_at | 2025-07-20T14:10:00 |
| updated_at | 2025-08-05T11:10:00 |

## Linkages and Data Integrity
- Foreign keys:
  - `MedicalRecordTable.user_id` → `UserTable.user_id`
  - `AppointmentTable.user_id` → `UserTable.user_id`
  - `AppointmentTable.provider_id` → `ProviderTable.id`
  - `VitalRecordTable.user_id` → `UserTable.user_id`
  - `VitalRecordTable.vital_code` → `VitalTable.code`
  - `VitalTriggerTable.user_id` → `UserTable.user_id`
  - `VitalTriggerTable.vital_code` → `VitalTable.code`
  - `NotificationTable.vital_trigger_id` → `VitalTriggerTable.id`
  - `UserDocumentTable.appointment_id` → `AppointmentTable.id`
  - `CalendarEventTable.appointment_id` → `AppointmentTable.id`
- Last appointment linkage: `MedicalRecordTable.last_appointment_id` is set to the latest appointment per user (by `start_time`).
- JSON fields: several columns store JSON strings (time slots, events, vitals, anthropometry, histories). Parse them explicitly when loading into databases/BI tools.

## File Outputs
- Default output directory: `reportsandtable/dataTables/` (or custom via `--output-dir`).
- The script prints table-wise row counts and the destination path after export.

## Notes and Best Practices
- Synthetic data only. Not actual PHI. Safe for development, demos, and testing.
- Locale realism: use `--allow-global` for broader diversity.
- Business rules: appointments on weekdays within business hours; durations by type.
- Performance: scale up row counts in code carefully based on memory/disk.

## Reproducibility
- `random.seed(42)` and `Faker.seed(42)` provide deterministic runs.
- Changing seeds will change the exact values but preserve distributions.

## Adjusting Volumes and Bias
- Sickness prevalence: change `self.sickness_bias` in `MedicalDataGenerator.__init__` (e.g., `0.7` → `0.8`).
- Appointment volume: change `self.generate_appointments(3000)` in `generate_all_data()`.
- Other counts: increase `generate_*` counts similarly (e.g., vitals, triggers, messages).

## Changelog
- v0.2
  - Default sickness bias (~70%) without CLI flag
  - Removed sick-rate/high-risk CLI/options
  - Appointments increased to 3000
  - `last_appointment_id` set based on latest appointment per user
  - Expanded documentation with tables, fields, and examples

## Dependencies and Setup

- **Python**: 3.9+ recommended
- **Packages**: `faker`

Install dependencies:

```bash
pip install faker
```

Optional (recommended) virtual environment:

```bash
python -m venv .venv
.\u200b.venv\Scripts\Activate.ps1   # Windows PowerShell
pip install faker
```

## CLI Usage

- **Basic** (writes beside the script by default):

```bash
python reportsandtable/generate_medical_data_v.0.2.py
```

- **Custom output directory**:

```bash
python reportsandtable/generate_medical_data_v.0.2.py --output-dir reportsandtable/dataTables
```

- **Allow global (non-US) locales** for names, phones, addresses:

```bash
python reportsandtable/generate_medical_data_v.0.2.py --allow-global
```

Notes:
- `--allow-global` flips `us_only=False` inside the generator.
- Output directory is created if it does not exist.

## Directory Structure

Example after a run with `--output-dir reportsandtable/dataTables`:

```text
reportsandtable/
  generate_medical_data_v.0.2.py
  dataTables/
    AddProviderTable.csv
    AppointmentTable.csv
    CalendarEventTable.csv
    MedicalRecordTable.csv
    MessageTable.csv
    NotificationTable.csv
    ProviderTable.csv
    UserDetailsTable.csv
    UserDocumentTable.csv
    UserTable.csv
    VitalRecordTable.csv
    VitalTable.csv
    VitalTriggerTable.csv
```

## Schema Whitelist and JSON Columns

Exports are strictly constrained to a schema whitelist aligned with `reportsandtable/model.py`. Only columns in `MODEL_COLUMNS` are written; any extra/internal fields are ignored during CSV export. This guarantees stable schemas for downstream tools.

JSON string columns (parse explicitly when loading):
- **MedicalRecordTable.csv**: `demographics`, `anthropometry`, `vitals`, `sleep_metrics`, `lifestyle`, `medical_history`, `mental_health`, `holistic_factors`, `care_planning`
- **AppointmentTable.csv**: `time_slot`, `events`, `messages`
- **VitalTriggerTable.csv**: `trigger_type`
- **UserDocumentTable.csv**: `messages`, `access`

## Identifiers, Keys, and Time Formats

- All entity IDs are UUIDv4 strings (e.g., `user_id`, `id`, `appointment_id`, etc.).
- `VitalRecordTable.csv` includes a `composite_key = {vital_code}#{recorded_at}` for convenient uniqueness by vital/time.
- Epoch seconds are used for `AppointmentTable.start_time` and inside `time_slot.start`/`time_slot.end`.
- Timestamps elsewhere use ISO-8601 strings from `datetime.isoformat()` (e.g., `created_at`, `updated_at`, `recorded_at`).

## Business Rules and Realism

- **Appointments**: weekdays only (Mon–Fri), business hours (08:00–18:00), 15-minute grid; durations vary by appointment type.
- **Vitals**: heart rate/BP/SpO2/temperature distributions influenced by age, gender, BMI, and conditions (HTN/DM/COPD).
- **Sickness bias**: ~70% of users are nudged to have at least one condition; influences chronic conditions and vitals.
- **Linkages**: `MedicalRecordTable.last_appointment_id` is set to the most recent appointment (by `start_time`) per user.

## Tuning and Extensibility

- Volumes: edit counts in `generate_all_data()` (e.g., `generate_appointments(3000)`), or call `generate_*` with custom counts.
- Prevalence: update `self.sickness_bias` in `MedicalDataGenerator.__init__`.
- Locales: run with `--allow-global` or set `us_only=False` when constructing `MedicalDataGenerator`.
- Add a new vital: extend `_create_vital_definitions()` and regenerate. If you introduce a new CSV/table, add its columns to `MODEL_COLUMNS` and include it in `export_to_csv()`.

## Performance Tips

- Use SSD-backed output directories for faster writes.
- Keep Python 64-bit for large volumes.
- Scale row counts gradually; monitor RAM and disk usage.

## Validation and QA

- Schemas are enforced via the whitelist at export time.
- For downstream validation/combination, use your project utilities (e.g., `reportsandtable/validate_and_combine.py`) if applicable.
- Spot-check JSON columns by loading samples and decoding with your preferred language/tool.

## Troubleshooting

- `ModuleNotFoundError: No module named 'faker'` → run `pip install faker` in the active environment.
- Permission/path issues on Windows → prefer absolute `--output-dir` paths and ensure the directory is writeable.
- Non-UTF8 viewers: CSVs are written with `encoding='utf-8'`.

## FAQ

- **Can I regenerate with the same values?** Seeds (`random.seed(42)`, `Faker.seed(42)`) make runs deterministic. Change seeds to vary exact values.
- **Are values always in the normal range?** No; distributions intentionally produce realistic outliers, especially when conditions apply.
- **How do I link records across tables?** Use UUIDs and foreign keys described in the “Linkages and Data Integrity” section above.
