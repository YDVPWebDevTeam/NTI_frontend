import { type AttachApplicationDocumentDtoDocumentType } from 'lib/api';

export interface DocumentTemplate {
  documentType: AttachApplicationDocumentDtoDocumentType;
  /** Human-readable name shown to the user. */
  label: string;
  /** Suggested download filename. */
  filename: string;
  /** Public R2 URL of the .docx file. */
  url: string;
}

const TEMPLATE_BASE_URL = 'https://pub-c2dde2bec4a145498f7109ddb8e72d94.r2.dev/templates/program-a';

function template(
  documentType: AttachApplicationDocumentDtoDocumentType,
  slug: string,
  label: string,
): DocumentTemplate {
  return {
    documentType,
    label,
    filename: `${slug}.docx`,
    url: `${TEMPLATE_BASE_URL}/${slug}.docx`,
  };
}

export const PROGRAM_A_TEMPLATES: Partial<
  Record<AttachApplicationDocumentDtoDocumentType, DocumentTemplate>
> = {
  EXECUTIVE_SUMMARY: template('EXECUTIVE_SUMMARY', 'executive-summary', 'Executive Summary'),
  TECHNICAL_ARCHITECTURE: template(
    'TECHNICAL_ARCHITECTURE',
    'technical-architecture',
    'Technical Architecture (Technical Specification)',
  ),
  ROADMAP: template('ROADMAP', 'roadmap', 'Roadmap'),
  BUDGET: template('BUDGET', 'budget', 'Budget'),
  RISK_ANALYSIS: template('RISK_ANALYSIS', 'risk-analysis', 'Risk Analysis'),
  MONETIZATION_MODEL: template('MONETIZATION_MODEL', 'monetization-model', 'Monetization Model'),
  SOLUTION_PROPOSAL: template('SOLUTION_PROPOSAL', 'solution-proposal', 'Solution Proposal'),
  MOTIVATION_LETTER: template('MOTIVATION_LETTER', 'motivation-letter', 'Motivation Letter'),
};

/** Templates in display order — for listing them all in a single card. */
export const PROGRAM_A_TEMPLATE_LIST: DocumentTemplate[] = Object.values(PROGRAM_A_TEMPLATES);

export function getTemplateForDocumentType(
  documentType: AttachApplicationDocumentDtoDocumentType,
): DocumentTemplate | undefined {
  return PROGRAM_A_TEMPLATES[documentType];
}
