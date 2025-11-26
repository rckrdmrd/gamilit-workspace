/**
 * useGrading Hook - Usage Examples
 *
 * Demonstrates how to use the updated useGrading hook with pagination support.
 */

import React from 'react';
import { useGrading } from './useGrading';

// ============================================================================
// EXAMPLE 1: Basic Usage - Get All Pending Submissions
// ============================================================================

export function PendingSubmissionsExample() {
  const { submissions, total, page, loading, error } = useGrading({ status: 'pending' });

  if (loading) return <div>Loading submissions...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Pending Submissions ({total})</h2>
      <p>
        Showing page {page}, {submissions.length} of {total} total
      </p>

      <ul>
        {submissions.map((sub) => (
          <li key={sub.id}>
            {sub.student_name} - {sub.exercise_title} - Score: {sub.score}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: Pagination Support
// ============================================================================

export function PaginatedSubmissionsExample() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;

  const { submissions, total, page, limit, loading } = useGrading({
    status: 'pending',
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
  });

  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return (
    <div>
      <h2>Submissions with Pagination</h2>

      {/* Results info */}
      <div className="mb-4">
        <p>
          Showing {submissions.length} of {total} submissions (Page {page} of {totalPages})
        </p>
      </div>

      {/* Submissions list */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {submissions.map((sub) => (
            <li key={sub.id}>
              {sub.student_name} - {sub.exercise_title}
            </li>
          ))}
        </ul>
      )}

      {/* Pagination controls */}
      <div className="mt-4 flex gap-2">
        <button onClick={() => setCurrentPage((p) => p - 1)} disabled={!hasPrevPage || loading}>
          Previous
        </button>

        <span>
          Page {currentPage} of {totalPages}
        </span>

        <button onClick={() => setCurrentPage((p) => p + 1)} disabled={!hasNextPage || loading}>
          Next
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: Grading Workflow
// ============================================================================

export function GradingWorkflowExample() {
  const { submissions, total, pendingCount, getSubmissionDetail, grade, loading } = useGrading({
    status: 'pending',
  });

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [grading, setGrading] = React.useState(false);

  const handleGrade = async (submissionId: string) => {
    setGrading(true);
    try {
      // Get full details
      const detail = await getSubmissionDetail(submissionId);
      console.log('Grading submission:', detail);

      // Submit grade
      await grade(submissionId, {
        score: 85,
        max_score: 100,
        feedback: 'Great work! Consider adding more examples.',
        grade: 'B',
        is_approved: true,
      });

      alert('Submission graded successfully!');
      setSelectedId(null);
    } catch (error) {
      console.error('Grading failed:', error);
      alert('Failed to grade submission');
    } finally {
      setGrading(false);
    }
  };

  return (
    <div>
      <h2>Grading Workflow</h2>
      <p>
        {pendingCount} pending submissions of {total} total
      </p>

      {loading ? (
        <div>Loading submissions...</div>
      ) : (
        <div>
          {submissions.map((sub) => (
            <div key={sub.id} className="mb-2 border p-4">
              <h3>{sub.student_name}</h3>
              <p>{sub.exercise_title}</p>
              <p>
                Score: {sub.score}/{sub.max_score}
              </p>

              <button onClick={() => setSelectedId(sub.id)} disabled={grading}>
                View Details
              </button>

              {selectedId === sub.id && (
                <button onClick={() => handleGrade(sub.id)} disabled={grading}>
                  {grading ? 'Grading...' : 'Submit Grade'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Filtered Submissions by Classroom and Date Range
// ============================================================================

export function FilteredSubmissionsExample() {
  const [classroomId, setClassroomId] = React.useState<string>('');
  const [startDate, setStartDate] = React.useState<string>('2025-01-01');
  const [endDate, setEndDate] = React.useState<string>('2025-01-31');

  const { submissions, total, page, limit, loading, refresh } = useGrading({
    classroom_id: classroomId || undefined,
    start_date: startDate,
    end_date: endDate,
    status: 'graded',
  });

  return (
    <div>
      <h2>Filter Submissions</h2>

      {/* Filters */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Classroom ID"
          value={classroomId}
          onChange={(e) => setClassroomId(e.target.value)}
        />

        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />

        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

        <button onClick={refresh} disabled={loading}>
          Refresh
        </button>
      </div>

      {/* Results */}
      <p>Found {total} graded submissions</p>
      <p>
        Showing page {page}, displaying {submissions.length} of {limit} per page
      </p>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {submissions.map((sub) => (
            <li key={sub.id}>
              {sub.student_name} - {sub.exercise_title} - Grade: {sub.grade}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: Bulk Grading
// ============================================================================

export function BulkGradingExample() {
  const { submissions, total, bulkGrade, loading } = useGrading({ status: 'pending' });

  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [bulkGrading, setBulkGrading] = React.useState(false);

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const handleBulkGrade = async () => {
    setBulkGrading(true);
    try {
      await bulkGrade({
        submissions: Array.from(selected).map((id) => ({
          submission_id: id,
          score: 80,
          feedback: 'Good work!',
          grade: 'B',
        })),
      });

      alert(`Graded ${selected.size} submissions!`);
      setSelected(new Set());
    } catch (error) {
      console.error('Bulk grading failed:', error);
      alert('Failed to grade submissions');
    } finally {
      setBulkGrading(false);
    }
  };

  return (
    <div>
      <h2>Bulk Grading</h2>
      <p>{total} pending submissions</p>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="mb-4">
            <p>Selected: {selected.size} submissions</p>
            <button onClick={handleBulkGrade} disabled={selected.size === 0 || bulkGrading}>
              {bulkGrading ? 'Grading...' : `Grade ${selected.size} Selected`}
            </button>
          </div>

          <ul>
            {submissions.map((sub) => (
              <li key={sub.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={selected.has(sub.id)}
                    onChange={() => toggleSelection(sub.id)}
                  />
                  {sub.student_name} - {sub.exercise_title}
                </label>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 6: Real-time Pending Count
// ============================================================================

export function PendingCountBadgeExample() {
  const { pendingCount, loading } = useGrading({ status: 'pending' });

  if (loading) {
    return <span className="badge">Loading...</span>;
  }

  return (
    <div className="navigation-item">
      <span>Pending Submissions</span>
      {pendingCount > 0 && <span className="badge badge-danger">{pendingCount}</span>}
    </div>
  );
}
