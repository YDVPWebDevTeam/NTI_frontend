export interface CreateOrganizationRequest {
  name: string;
  ico: string;
  sector: string;
  description: string;
  website: string;
  logoUrl?: string;
}

export interface OrganizationResponse {
  id: string;
  name: string;
  ico: string;
  sector: string;
  description: string;
  website: string;
  logoUrl?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
