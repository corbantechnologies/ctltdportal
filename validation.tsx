import * as Yup from "yup";


const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string()
    .min(5, "Password cannot be less than 5 characters")
    .required("This field is required"),
});

const ResetPasswordSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  code: Yup.string().required("Code is required"),
  password: Yup.string()
    .min(5, "Password cannot be less than 5 characters")
    .required("This field is required")
    .matches(
      /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
      "Password must contain at least 5 characters, one uppercase, one number and one special case character"
    ),
  confirmPassword: Yup.string()
    .required("Confirm Password is required")
    .oneOf([Yup.ref("password")], "Confirm Password does not match"),
});

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
});

const DivisionSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  is_active: Yup.boolean().default(true),
});

const COASchema = Yup.object().shape({
  code: Yup.string().required("Code is required"),
  name: Yup.string().required("Name is required"),
  normal_balance: Yup.string()
    .oneOf(["DEBIT", "CREDIT"], "Must be DEBIT or CREDIT")
    .required("Normal balance is required"),
  order: Yup.number().required("Order is required"),
  report_role: Yup.string()
    .oneOf(
      [
        "ASSET",
        "LIABILITY",
        "EQUITY",
        "REVENUE",
        "EXPENSE",
        "COGS",
        "OTHER_INCOME",
        "NON_OPERATING_EXPENSE",
        "CAPITAL_EXPENDITURE",
        "NONE",
      ],
      "Invalid report role"
    )
    .required("Report role is required"),
  is_active: Yup.boolean().default(true),
});

const BookSchema = Yup.object().shape({
  code: Yup.string().required("Code is required"),
  name: Yup.string().required("Name is required"),
  account_type: Yup.string().required("Account type is required"),
  is_active: Yup.boolean().default(true),
  is_bank: Yup.boolean().default(false),
  is_tax: Yup.boolean().default(false),
  is_cash: Yup.boolean().default(false),
  is_current: Yup.boolean().default(true),
  description: Yup.string(),
});

const PartnerTypeSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  description: Yup.string(),
  is_active: Yup.boolean().default(true),
});

const PartnerSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  phone: Yup.string(),
  email: Yup.string().email("Invalid email"),
  tax_pin: Yup.string(),
  currency: Yup.string().default("KES"),
  wht_rate: Yup.number().min(0).max(100),
  payment_terms: Yup.string(),
  is_active: Yup.boolean().default(true),
  partner_type: Yup.string().required("Partner type is required"),
  division: Yup.string(),
});

const JournalTypeSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  description: Yup.string(),
  is_active: Yup.boolean().default(true),
});

const JournalSchema = Yup.object().shape({
  financial_year: Yup.string().required("Financial year is required"),
  journal_type: Yup.string().required("Journal type is required"),
  date: Yup.date().required("Date is required"),
  description: Yup.string().required("Description is required"),
  currency: Yup.string().required("Currency is required"),
});

const JournalEntrySchema = Yup.object().shape({
  journal: Yup.string().required("Journal batch is required"),
  book: Yup.string().required("Account book is required"),
  partner: Yup.string().nullable(),
  division: Yup.string().required("Division is required"),

  // Debit depends on credit
  debit: Yup.number()
    .min(0, "Debit cannot be negative")
    .when("credit", {
      is: (val: number) => Number(val) > 0,
      then: (schema) =>
        schema
          .max(0, "Cannot enter both debit and credit")
          .test(
            "debit-required-if-no-credit",
            "Enter debit or credit amount",
            function (value) {
              return Number(value) > 0 || Number(this.parent.credit) > 0;
            }
          ),
      otherwise: (schema) =>
        schema
          .required("Enter debit or credit amount")
          .test(
            "debit-required-if-no-credit",
            "Enter debit or credit amount",
            function (value) {
              return Number(value) > 0 || Number(this.parent.credit) > 0;
            }
          ),
    }),

  credit: Yup.number().min(0, "Credit cannot be negative").default(0),

  currency: Yup.string().required("Currency is required"),
  exchange_rate: Yup.number().min(0).default(1),
  foreign_debit: Yup.number().min(0).default(0),
  foreign_credit: Yup.number().min(0).default(0),
  payment_method: Yup.string().required("Payment method is required"),
  is_intercompany: Yup.boolean().default(false),
  source_document: Yup.string().nullable(),
  document_number: Yup.string().nullable(),
  notes: Yup.string().nullable(),
  project: Yup.string().nullable(),
});

const CreateMemberSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
});

const ActivateAccountSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, "Password cannot be less than 8 characters")
    .required("Password is required")
    .matches(
      /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
      "Password must contain at least 8 characters, one uppercase, one number and one special case character"
    ),
  password_confirmation: Yup.string()
    .required("Password Confirmation is required")
    .oneOf([Yup.ref("password")], "Passwords must match"),
});

export {
  LoginSchema,
  ResetPasswordSchema,
  ForgotPasswordSchema,
  DivisionSchema,
  COASchema,
  BookSchema,
  PartnerTypeSchema,
  PartnerSchema,
  JournalTypeSchema,
  JournalSchema,
  JournalEntrySchema,
  CreateMemberSchema,
  ActivateAccountSchema,
};
