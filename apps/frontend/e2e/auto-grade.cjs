const { Client } = require('pg');

const client = new Client({
  user: 'gamilit_user',
  host: 'localhost',
  database: 'gamilit_platform',
  password: 'gamilit_dev_2026',
  port: 5432,
});

async function approvePendingSubmissions() {
  try {
    await client.connect();
    console.log('Connected to DB');

    const email = 'rckrdmrd@gmail.com';

    // Check for command line arguments
    const mode = process.argv[2];

    if (mode === 'check') {
      console.log('Checking progress...');
      const userRes = await client.query("SELECT id FROM auth.users WHERE email = $1", [email]);
      if (userRes.rows.length === 0) {
        console.log('User not found');
        return;
      }
      const userId = userRes.rows[0].id;
      
      const subs = await client.query(`
        SELECT status, count(*) 
        FROM progress_tracking.exercise_submissions 
        WHERE user_id = $1 
        GROUP BY status
      `, [userId]);
      
      console.log('Submissions by status:', subs.rows);
      return;
    }

    if (mode === 'insert_all') {
      console.log('Inserting all submissions...');
      const userRes = await client.query("SELECT id FROM auth.users WHERE email = $1", [email]);
      if (userRes.rows.length === 0) return;
      const userId = userRes.rows[0].id;

      // Get Profile ID
      const profileRes = await client.query("SELECT id FROM auth_management.profiles WHERE user_id = $1", [userId]);
      if (profileRes.rows.length === 0) {
        console.log('Profile not found for user');
        return;
      }
      const profileId = profileRes.rows[0].id;

      // Get all exercises for modules 1, 2, 3
      const exercises = await client.query(`
        SELECT e.id, e.title 
        FROM educational_content.exercises e
        JOIN educational_content.modules m ON e.module_id = m.id
        WHERE m.module_code IN ('MOD-01-LITERAL', 'MOD-02-INFERENCIAL', 'MOD-03-CRITICA')
      `);

      console.log(`Found ${exercises.rows.length} exercises.`);

      for (const ex of exercises.rows) {
        // Check if exists
        const check = await client.query(
          "SELECT id FROM progress_tracking.exercise_submissions WHERE user_id = $1 AND exercise_id = $2",
          [profileId, ex.id]
        );

        if (check.rows.length === 0) {
          await client.query(`
            INSERT INTO progress_tracking.exercise_submissions 
                (id, user_id, exercise_id, status, score, attempt_number, submitted_at, graded_at, feedback, answer_data)
                VALUES 
                (gen_random_uuid(), $1, $2, 'graded', 100, 1, NOW(), NOW(), 'Auto-inserted', '{}')
          `, [profileId, ex.id]);
          console.log(`Inserted submission for ${ex.title}`);
        } else {
           // Update if exists
               await client.query(`
                UPDATE progress_tracking.exercise_submissions 
                SET status = 'graded', score = 100, graded_at = NOW()
                WHERE id = $1
               `, [check.rows[0].id]);
        }
      }
      return;
    }

    const userRes = await client.query("SELECT id, email, created_at FROM auth.users WHERE email = $1", [email]);
    
    if (mode === 'delete') {
      console.log('Deleting user...');
      if (userRes.rows.length > 0) {
        const userId = userRes.rows[0].id;
        console.log('Found auth user ID:', userId);

        // Get Profile ID
        const profileRes = await client.query("SELECT id FROM auth_management.profiles WHERE user_id = $1", [userId]);
        let profileId = null;
        if (profileRes.rows.length > 0) {
           profileId = profileRes.rows[0].id;
           console.log('Found profile ID:', profileId);
           
           // Delete dependencies using profileId
           // Check if audit logs use profileId or userId (usually profileId in this system)
           await client.query("DELETE FROM audit_logging.audit_logs WHERE actor_id = $1", [profileId]);
           
           await client.query("DELETE FROM progress_tracking.exercise_submissions WHERE user_id = $1", [profileId]);
           await client.query("DELETE FROM gamification_system.user_stats WHERE user_id = $1", [profileId]);
           await client.query("DELETE FROM gamification_system.user_ranks WHERE user_id = $1", [profileId]);
           await client.query("DELETE FROM auth_management.user_roles WHERE user_id = $1", [profileId]);
           
           await client.query("DELETE FROM auth_management.profiles WHERE id = $1", [profileId]);
        }
        
        // Also delete from tables that might use auth userId directly if any (e.g. sessions)
        await client.query("DELETE FROM auth.users WHERE id = $1", [userId]);
        console.log('User deleted.');
      } else {
        console.log('User not found, nothing to delete.');
      }
      return;
    }

    if (userRes.rows.length === 0) {
      console.log('User not found');
    } else {
      console.log('User found:', userRes.rows[0]);
    }
    return;

  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

approvePendingSubmissions();
