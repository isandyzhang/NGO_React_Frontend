export interface BasicInfo {
  childName: string;
  birthDate: string;
  gender: 'male' | 'female' | 'other';
  address: string;
}

export interface FamilyInfo {
  familyMembers: number;
  housingType: string;
  familyRelationship: string;
}

export interface FinanceInfo {
  monthlyIncome: number;
  financialSupport: string[];
  expenses: {
    category: string;
    amount: number;
  }[];
}

export interface HealthInfo {
  physicalHealth: string;
  mentalHealth: string;
  medicalHistory: string[];
}

export interface AcademicInfo {
  schoolName: string;
  grade: string;
  performance: {
    subject: string;
    score: number;
  }[];
}

export interface EmotionalInfo {
  emotionalStability: number;
  socialSkills: number;
  stressManagement: number;
}

export interface FinalEvaluation {
  fqScore: number;
  hqScore: number;
  iqScore: number;
  eqScore: number;
  evaluatorSignature: string;
  evaluationDate: string;
}

export interface CaseFormData {
  basicInfo: BasicInfo;
  familyInfo: FamilyInfo;
  financeInfo: FinanceInfo;
  healthInfo: HealthInfo;
  academicInfo: AcademicInfo;
  emotionalInfo: EmotionalInfo;
  finalEvaluation: FinalEvaluation;
} 