import type { FormSchema } from '../types/form.types';

export const employeeSchema: FormSchema = {
  title: "Employee Onboarding Form",
  description: "Provide the necessary details to onboard the new team member.",
  fields: [
    {
      type: "text",
      name: "employeeName",
      label: "Full Name",
      placeholder: "e.g. Jane Doe",
      required: true,
      validation: {
        minLength: 3,
        maxLength: 50
      }
    },
    {
      type: "email",
      name: "email",
      label: "Work Email Address",
      placeholder: "jane.doe@company.com",
      required: true
    },
    {
      type: "select",
      name: "department",
      label: "Department",
      required: true,
      options: [
        "Engineering",
        "Product",
        "Design",
        "Human Resources",
        "Finance",
        "Marketing"
      ]
    },
    {
      type: "date",
      name: "startDate",
      label: "Start Date",
      required: true,
      validation: {
        min: "2026-01-01"
      }
    }
  ]
};
