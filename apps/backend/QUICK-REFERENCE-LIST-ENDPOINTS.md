# Guía Rápida: Endpoints de Lista (Classrooms & Teachers)

## 🎯 Endpoints Disponibles

### 1. Listar Aulas (Classrooms)

```http
GET /api/v1/admin/classrooms/list
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Query Params (todos opcionales):**
```
?search=Matemáticas    # Filtrar por nombre
&limit=50              # Límite de resultados (default: 50, max: 100)
&schoolId=uuid         # Filtrar por tenant/escuela
```

**Response 200:**
```json
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440020",
    "name": "Matemáticas 3A",
    "grade": "8",
    "section": "A",
    "student_count": 25
  }
]
```

---

### 2. Listar Profesores (Teachers)

```http
GET /api/v1/admin/teachers/list
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Query Params (todos opcionales):**
```
?search=Juan           # Filtrar por nombre o email
&limit=50              # Límite de resultados (default: 50, max: 100)
&schoolId=uuid         # Filtrar por tenant/escuela
```

**Response 200:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440005",
    "display_name": "Juan Pérez González",
    "email": "juan.perez@escuela.edu",
    "role": "admin_teacher"
  }
]
```

---

## 💻 Ejemplos de Uso (Frontend)

### React/TypeScript

```typescript
// types.ts
export interface ClassroomListItem {
  id: string;
  name: string;
  grade?: string;
  section?: string;
  school_name?: string;
  student_count: number;
}

export interface TeacherListItem {
  id: string;
  display_name: string;
  email: string;
  role: string;
}

// api.ts
import { apiClient } from '@/services/api/apiClient';

export const classroomTeacherApi = {
  // Listar aulas
  listClassrooms: async (params?: {
    search?: string;
    limit?: number;
    schoolId?: string;
  }): Promise<ClassroomListItem[]> => {
    const { data } = await apiClient.get('/admin/classrooms/list', { params });
    return data;
  },

  // Listar profesores
  listTeachers: async (params?: {
    search?: string;
    limit?: number;
    schoolId?: string;
  }): Promise<TeacherListItem[]> => {
    const { data } = await apiClient.get('/admin/teachers/list', { params });
    return data;
  },
};

// Component usage
import { useState, useEffect } from 'react';

function AdminClassroomTeacherPage() {
  const [classrooms, setClassrooms] = useState<ClassroomListItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherListItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [classroomsData, teachersData] = await Promise.all([
        classroomTeacherApi.listClassrooms(),
        classroomTeacherApi.listTeachers(),
      ]);
      setClassrooms(classroomsData);
      setTeachers(teachersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Dropdown de aulas */}
      <select>
        {classrooms.map(classroom => (
          <option key={classroom.id} value={classroom.id}>
            {classroom.name} {classroom.grade && `- ${classroom.grade}`}
            {classroom.section && classroom.section}
            ({classroom.student_count} estudiantes)
          </option>
        ))}
      </select>

      {/* Dropdown de profesores */}
      <select>
        {teachers.map(teacher => (
          <option key={teacher.id} value={teacher.id}>
            {teacher.display_name} ({teacher.email})
          </option>
        ))}
      </select>
    </div>
  );
}
```

---

### React Hook Personalizado

```typescript
// useClassroomTeacherLists.ts
import { useState, useEffect } from 'react';
import { classroomTeacherApi } from '@/services/api/admin/classroomTeacherApi';
import type { ClassroomListItem, TeacherListItem } from './types';

export function useClassroomTeacherLists() {
  const [classrooms, setClassrooms] = useState<ClassroomListItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadClassrooms = async (search = '') => {
    setLoading(true);
    try {
      const data = await classroomTeacherApi.listClassrooms({ search, limit: 50 });
      setClassrooms(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeachers = async (search = '') => {
    setLoading(true);
    try {
      const data = await classroomTeacherApi.listTeachers({ search, limit: 50 });
      setTeachers(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClassrooms();
    loadTeachers();
  }, []);

  return {
    classrooms,
    teachers,
    loading,
    error,
    refreshClassrooms: loadClassrooms,
    refreshTeachers: loadTeachers,
  };
}

// Uso en componente
function MyComponent() {
  const { classrooms, teachers, loading } = useClassroomTeacherLists();

  if (loading) return <Spinner />;

  return (
    <div>
      {/* Usar classrooms y teachers */}
    </div>
  );
}
```

---

### Con Select Component de Shadcn/UI

```typescript
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function ClassroomTeacherAssignment() {
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const { classrooms, teachers } = useClassroomTeacherLists();

  return (
    <div className="space-y-4">
      {/* Select Classroom */}
      <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
        <SelectTrigger>
          <SelectValue placeholder="Seleccionar aula" />
        </SelectTrigger>
        <SelectContent>
          {classrooms.map((classroom) => (
            <SelectItem key={classroom.id} value={classroom.id}>
              {classroom.name}
              {classroom.grade && ` - ${classroom.grade}${classroom.section || ''}`}
              <span className="text-muted-foreground ml-2">
                ({classroom.student_count} estudiantes)
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Select Teacher */}
      <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
        <SelectTrigger>
          <SelectValue placeholder="Seleccionar profesor" />
        </SelectTrigger>
        <SelectContent>
          {teachers.map((teacher) => (
            <SelectItem key={teacher.id} value={teacher.id}>
              {teacher.display_name}
              <span className="text-muted-foreground ml-2">
                ({teacher.email})
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
```

---

### Con Búsqueda Dinámica (Debounced)

```typescript
import { useState, useCallback } from 'react';
import debounce from 'lodash/debounce';

function SearchableClassroomSelect() {
  const [classrooms, setClassrooms] = useState<ClassroomListItem[]>([]);
  const [search, setSearch] = useState('');

  const searchClassrooms = useCallback(
    debounce(async (searchTerm: string) => {
      const results = await classroomTeacherApi.listClassrooms({
        search: searchTerm,
        limit: 20,
      });
      setClassrooms(results);
    }, 300),
    []
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    searchClassrooms(value);
  };

  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        placeholder="Buscar aula..."
      />
      <ul>
        {classrooms.map((classroom) => (
          <li key={classroom.id}>{classroom.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 🧪 Testing con cURL

```bash
# Listar todas las aulas
curl -X GET "http://localhost:3000/api/v1/admin/classrooms/list" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Buscar aulas por nombre
curl -X GET "http://localhost:3000/api/v1/admin/classrooms/list?search=Mat" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Listar aulas con límite
curl -X GET "http://localhost:3000/api/v1/admin/classrooms/list?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Listar todos los profesores
curl -X GET "http://localhost:3000/api/v1/admin/teachers/list" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Buscar profesores por nombre
curl -X GET "http://localhost:3000/api/v1/admin/teachers/list?search=Juan" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📋 Notas Importantes

1. **Autenticación Requerida:** Todos los endpoints requieren JWT token válido
2. **Permisos:** Solo usuarios con rol admin pueden acceder
3. **Límite por defecto:** 50 resultados
4. **Límite máximo:** 100 resultados
5. **Ordenamiento:** Alfabético por nombre (classrooms) o full_name (teachers)
6. **Solo activos:** Solo retorna aulas activas (`is_active = true`)
7. **Roles de profesores:** Solo `admin_teacher` y `super_admin`

---

## 🔗 Documentación Swagger

Accede a la documentación interactiva completa en:
```
http://localhost:3000/api/docs
```

Busca la sección: **Admin - Classroom Teachers (REST)**

---

## 📞 Soporte

- **Reporte completo:** `IMPLEMENTATION-REPORT-LIST-ENDPOINTS-2025-11-25.md`
- **Script de testing:** `scripts/test-list-endpoints.sh`
- **Frontend issues:** Contactar al equipo de Backend
