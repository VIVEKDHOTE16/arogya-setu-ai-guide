// Sample disease data for demonstration - will be replaced with Supabase data
export const sampleDiseases = [
  {
    id: "1",
    name: "Common Cold",
    nameHindi: "सामान्य सर्दी",
    category: "Respiratory",
    severity: "Mild" as const,
    description: "A viral infection of the upper respiratory tract that primarily affects the nose and throat. It's one of the most common illnesses, especially during colder months.",
    commonSymptoms: ["Runny nose", "Sneezing", "Cough", "Sore throat", "Mild fever"],
    causes: ["Rhinovirus infection", "Adenovirus", "Coronavirus", "Cold weather exposure", "Weakened immunity"],
    prevention: ["Wash hands frequently", "Avoid close contact with infected people", "Get adequate sleep", "Eat healthy foods", "Stay hydrated"],
    treatment: ["Rest and hydration", "Over-the-counter pain relievers", "Warm salt water gargles", "Honey and ginger tea", "Steam inhalation"],
    whenToSeeDoctor: ["Symptoms persist for more than 10 days", "High fever above 101.3°F", "Severe headache", "Chest pain or difficulty breathing"],
    urgentCare: ["Difficulty breathing", "Chest pain", "High fever with severe symptoms", "Signs of dehydration"],
    prevalence: "Adults get 2-3 colds per year on average",
    relatedDiseases: ["Flu", "Sinusitis", "Bronchitis", "Pneumonia"]
  },
  {
    id: "2",
    name: "Dengue Fever",
    nameHindi: "डेंगू बुखार",
    category: "Infectious",
    severity: "Severe" as const,
    description: "A mosquito-borne tropical disease caused by the dengue virus. It's endemic in over 100 countries, particularly in tropical and subtropical areas.",
    commonSymptoms: ["High fever", "Severe headache", "Muscle and joint pain", "Skin rash", "Nausea and vomiting"],
    causes: ["Aedes aegypti mosquito bite", "Aedes albopictus mosquito bite", "Contact with infected blood", "Dengue virus (DENV-1, DENV-2, DENV-3, DENV-4)"],
    prevention: ["Use mosquito repellent", "Wear long-sleeved clothing", "Remove standing water", "Use mosquito nets", "Keep surroundings clean"],
    treatment: ["Rest and fluid replacement", "Paracetamol for fever", "Avoid aspirin", "Monitor platelet count", "Hospitalization if severe"],
    whenToSeeDoctor: ["High fever with severe headache", "Persistent vomiting", "Bleeding gums or nose", "Severe abdominal pain"],
    urgentCare: ["Severe bleeding", "Difficulty breathing", "Severe drop in blood pressure", "Signs of dengue hemorrhagic fever"],
    prevalence: "50-100 million infections yearly worldwide, common in India during monsoon",
    relatedDiseases: ["Malaria", "Chikungunya", "Zika virus", "Yellow fever"]
  },
  {
    id: "3",
    name: "Type 2 Diabetes",
    nameHindi: "टाइप 2 मधुमेह",
    category: "Endocrine",
    severity: "Moderate" as const,
    description: "A chronic condition that affects the way your body metabolizes sugar (glucose). The body either resists the effects of insulin or doesn't produce enough insulin.",
    commonSymptoms: ["Increased thirst", "Frequent urination", "Unexplained weight loss", "Fatigue", "Blurred vision", "Slow healing wounds"],
    causes: ["Insulin resistance", "Genetic factors", "Obesity", "Sedentary lifestyle", "Poor diet", "Age over 45"],
    prevention: ["Maintain healthy weight", "Regular physical activity", "Healthy diet", "Avoid smoking", "Regular health checkups"],
    treatment: ["Lifestyle modifications", "Metformin", "Insulin therapy", "Blood sugar monitoring", "Regular exercise", "Diabetic diet"],
    whenToSeeDoctor: ["Blood sugar consistently high", "Symptoms of diabetes", "Family history of diabetes", "Regular monitoring needed"],
    urgentCare: ["Diabetic ketoacidosis", "Severe hypoglycemia", "Diabetic coma", "Severe dehydration"],
    prevalence: "77 million people affected in India, 6th leading cause of death globally",
    relatedDiseases: ["Heart disease", "Hypertension", "Kidney disease", "Eye problems", "Nerve damage"]
  },
  {
    id: "4",
    name: "Malaria",
    nameHindi: "मलेरिया",
    category: "Infectious",
    severity: "Severe" as const,
    description: "A life-threatening disease caused by parasites transmitted through the bites of infected female Anopheles mosquitoes. It's preventable and curable if diagnosed early.",
    commonSymptoms: ["High fever with chills", "Sweating", "Headache", "Nausea and vomiting", "Muscle pain", "Fatigue"],
    causes: ["Plasmodium parasites", "Anopheles mosquito bites", "Blood transfusion from infected person", "Sharing needles", "Mother to child transmission"],
    prevention: ["Use insecticide-treated bed nets", "Indoor residual spraying", "Antimalarial drugs", "Eliminate standing water", "Wear protective clothing"],
    treatment: ["Artemisinin-based combination therapies", "Chloroquine", "Quinine", "Hospitalization for severe cases", "Supportive care"],
    whenToSeeDoctor: ["High fever with chills", "Severe headache", "Travel to malaria-endemic area", "Persistent symptoms"],
    urgentCare: ["Cerebral malaria", "Severe anemia", "Kidney failure", "Pulmonary edema", "Hypoglycemia"],
    prevalence: "229 million cases globally in 2019, endemic in parts of India",
    relatedDiseases: ["Dengue", "Chikungunya", "Typhoid", "Yellow fever"]
  },
  {
    id: "5",
    name: "Hypertension",
    nameHindi: "उच्च रक्तचाप",
    category: "Heart",
    severity: "Moderate" as const,
    description: "A condition in which the force of blood against artery walls is too high. Often called the 'silent killer' because it typically has no symptoms until complications develop.",
    commonSymptoms: ["Usually no symptoms", "Headaches", "Shortness of breath", "Nosebleeds", "Dizziness", "Chest pain"],
    causes: ["Genetic factors", "Age", "Obesity", "High salt intake", "Lack of physical activity", "Smoking", "Stress", "Kidney disease"],
    prevention: ["Regular exercise", "Healthy diet low in salt", "Maintain healthy weight", "Limit alcohol", "Don't smoke", "Manage stress"],
    treatment: ["Lifestyle changes", "ACE inhibitors", "Diuretics", "Beta-blockers", "Calcium channel blockers", "Regular monitoring"],
    whenToSeeDoctor: ["Blood pressure consistently above 140/90", "Severe headaches", "Family history of hypertension", "Regular checkups after 40"],
    urgentCare: ["Hypertensive crisis (BP >180/120)", "Chest pain", "Shortness of breath", "Severe headache", "Vision changes"],
    prevalence: "1.13 billion people worldwide, 200+ million in India",
    relatedDiseases: ["Heart disease", "Stroke", "Kidney disease", "Diabetes", "Heart attack"]
  },
  {
    id: "6",
    name: "Tuberculosis",
    nameHindi: "तपेदिक",
    category: "Respiratory",
    severity: "Severe" as const,
    description: "A potentially serious infectious disease that mainly affects the lungs. TB bacteria spread through the air when people with active TB cough, sneeze, or spit.",
    commonSymptoms: ["Persistent cough for 3+ weeks", "Coughing up blood", "Chest pain", "Weight loss", "Night sweats", "Fever", "Fatigue"],
    causes: ["Mycobacterium tuberculosis bacteria", "Airborne transmission", "Weakened immune system", "HIV infection", "Malnutrition", "Close contact with TB patient"],
    prevention: ["BCG vaccination", "Avoid crowded places", "Good ventilation", "Cover mouth when coughing", "Complete treatment if infected", "Improve nutrition"],
    treatment: ["Directly Observed Treatment (DOTS)", "Anti-TB drugs for 6-9 months", "Isoniazid", "Rifampin", "Ethambutol", "Pyrazinamide"],
    whenToSeeDoctor: ["Persistent cough for 3+ weeks", "Coughing up blood", "Unexplained weight loss", "Night sweats", "Contact with TB patient"],
    urgentCare: ["Difficulty breathing", "Coughing up large amounts of blood", "Severe chest pain", "Drug-resistant TB symptoms"],
    prevalence: "2.64 million active cases in India, highest TB burden globally",
    relatedDiseases: ["HIV/AIDS", "Pneumonia", "Lung cancer", "Silicosis"]
  },
  {
    id: "7",
    name: "Depression",
    nameHindi: "अवसाद",
    category: "Mental",
    severity: "Moderate" as const,
    description: "A common and serious medical illness that negatively affects how you feel, think, and act. It causes feelings of sadness and loss of interest in activities.",
    commonSymptoms: ["Persistent sadness", "Loss of interest", "Changes in appetite", "Sleep disturbances", "Fatigue", "Difficulty concentrating", "Feelings of worthlessness"],
    causes: ["Chemical imbalances in brain", "Genetic factors", "Traumatic events", "Chronic stress", "Medical conditions", "Substance abuse", "Social isolation"],
    prevention: ["Regular exercise", "Healthy diet", "Adequate sleep", "Social connections", "Stress management", "Avoid alcohol and drugs", "Seek help early"],
    treatment: ["Psychotherapy", "Antidepressant medications", "Cognitive behavioral therapy", "Lifestyle changes", "Support groups", "Mindfulness practices"],
    whenToSeeDoctor: ["Symptoms persist for 2+ weeks", "Thoughts of self-harm", "Inability to function daily", "Substance abuse", "Severe mood changes"],
    urgentCare: ["Suicidal thoughts", "Self-harm behavior", "Severe depression with psychosis", "Complete inability to care for self"],
    prevalence: "280 million people worldwide, 4.5% of global population",
    relatedDiseases: ["Anxiety disorders", "Bipolar disorder", "PTSD", "Substance use disorders"]
  },
  {
    id: "8",
    name: "Chicken Pox",
    nameHindi: "चिकन पॉक्स",
    category: "Pediatric",
    severity: "Mild" as const,
    description: "A highly contagious disease caused by the varicella-zoster virus. It causes an itchy rash with small, fluid-filled blisters and is most common in children.",
    commonSymptoms: ["Itchy rash with blisters", "Fever", "Headache", "Loss of appetite", "Feeling tired", "Red spots that become blisters"],
    causes: ["Varicella-zoster virus", "Direct contact with infected person", "Respiratory droplets", "Contact with contaminated objects", "Reactivation of dormant virus"],
    prevention: ["Varicella vaccination", "Avoid contact with infected persons", "Good hygiene", "Isolate infected individuals", "Boost immune system"],
    treatment: ["Supportive care", "Calamine lotion for itching", "Antihistamines", "Paracetamol for fever", "Antiviral drugs in severe cases", "Keep fingernails short"],
    whenToSeeDoctor: ["High fever", "Signs of bacterial infection", "Difficulty breathing", "Severe headache", "Adults or immunocompromised individuals"],
    urgentCare: ["Difficulty breathing", "High fever with severe illness", "Signs of encephalitis", "Severe skin infection"],
    prevalence: "Most common in children under 15, highly contagious",
    relatedDiseases: ["Shingles", "Herpes simplex", "Hand-foot-mouth disease", "Measles"]
  }
];

// Categories for filtering
export const diseaseCategories = [
  "Heart", "Respiratory", "Digestive", "Mental", "Infectious", 
  "Musculoskeletal", "Skin", "Endocrine", "Eye & Ear", "Blood", 
  "Pediatric", "Geriatric"
];

// Severity levels
export const severityLevels = ["Mild", "Moderate", "Severe", "Critical"];