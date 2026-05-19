import { api } from 'lib/api/base-client';

import { studentProfileEndpoints } from './endpoints';
import type {
  CompleteStudentProfileRequest,
  GetMyStudentProfileResponse,
  StudentProfileUpdateResponse,
  UpdateAcademicInformationRequest,
  UpdateProfessionalSkillsRequest,
} from './types';

export const studentProfileService = {
  getMyProfile() {
    return api.get<GetMyStudentProfileResponse>(studentProfileEndpoints.getMyProfile);
  },

  updateProfessionalSkills(payload: UpdateProfessionalSkillsRequest) {
    return api.patch<StudentProfileUpdateResponse | void, UpdateProfessionalSkillsRequest>(
      studentProfileEndpoints.updateProfessionalSkills,
      payload,
    );
  },

  updateAcademicInformation(payload: UpdateAcademicInformationRequest) {
    return api.patch<StudentProfileUpdateResponse | void, UpdateAcademicInformationRequest>(
      studentProfileEndpoints.updateAcademicInformation,
      payload,
    );
  },

  completeProfile(payload: CompleteStudentProfileRequest) {
    return api.post<StudentProfileUpdateResponse, CompleteStudentProfileRequest>(
      studentProfileEndpoints.complete,
      payload,
    );
  },
};
