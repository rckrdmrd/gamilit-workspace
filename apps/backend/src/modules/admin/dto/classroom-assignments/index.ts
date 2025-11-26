/**
 * Classroom Assignments DTOs - Barrel Export
 *
 * @description DTOs for admin classroom assignment operations
 * @module admin/dto/classroom-assignments
 */

// Original DTOs (legacy controller)
export { AssignClassroomDto } from './assign-classroom.dto';
export { BulkAssignClassroomsDto } from './bulk-assign-classrooms.dto';
export { RemoveAssignmentDto } from './remove-assignment.dto';
export { ReassignClassroomDto } from './reassign-classroom.dto';
export { AvailableClassroomsFiltersDto } from './available-classrooms-filters.dto';
export { ClassroomAssignmentResponseDto } from './classroom-assignment-response.dto';
export { AssignmentHistoryResponseDto } from './assignment-history-response.dto';

// REST Controller DTOs (US-AE-007 - NEW)
export { AssignTeacherToClassroomRestDto } from './assign-teacher-rest.dto';
export { AssignClassroomsToTeacherRestDto } from './assign-classrooms-rest.dto';
export { ListAllAssignmentsQueryDto } from './list-all-assignments-query.dto';
export { BulkAssignRestDto, AssignmentPairDto } from './bulk-assign-rest.dto';
export {
  ClassroomWithTeachersDto,
  ClassroomInfoDto,
  TeacherInfoDto,
} from './classroom-with-teachers.dto';
export {
  TeacherWithClassroomsDto,
  TeacherBasicInfoDto,
  ClassroomWithAssignmentDto,
} from './teacher-with-classrooms.dto';

// List endpoints DTOs (NEW - Dropdown/Select support)
export { ClassroomListItemDto } from './classroom-list-item.dto';
export { TeacherListItemDto } from './teacher-list-item.dto';
export { ListClassroomsQueryDto } from './list-classrooms-query.dto';
export { ListTeachersQueryDto } from './list-teachers-query.dto';
