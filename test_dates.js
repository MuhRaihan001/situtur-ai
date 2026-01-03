require('dotenv').config();
const Database = require('./handler/database');
const Works = require('./handler/work');

const db = new Database();
const works = new Works();

async function test() {
    console.log("Starting test...");
    
    try {
        const projectId = 101;
        const deadline = '2026-12-31';

        // 1. Create a pending task
        console.log("\n1. Creating pending task...");
        const addResult = await works.addWork({
            work_name: "Test Date Logic",
            deadline: deadline,
            id_Proyek: projectId,
            status: 'pending',
            progress: 0
        });
        
        const [task] = await db.query("SELECT * FROM work WHERE work_name = 'Test Date Logic' ORDER BY id DESC LIMIT 1");
        console.log("Task created:", {
            id: task.id,
            status: task.status,
            progress: task.progress,
            started_at: task.started_at,
            deadline: task.deadline
        });

        if (task.started_at === null) {
            console.log("✅ SUCCESS: started_at is NULL for pending task.");
        } else {
            console.error("❌ FAILED: started_at should be NULL.");
        }

        // 2. Update progress to 1%
        console.log("\n2. Updating progress to 1%...");
        await works.updateWork(task.id, { progress: 1 });
        const [task2] = await db.query("SELECT * FROM work WHERE id = ?", [task.id]);
        console.log("Task updated:", {
            status: task2.status,
            progress: task2.progress,
            started_at: task2.started_at
        });

        if (task2.started_at !== null) {
            console.log("✅ SUCCESS: started_at is set after progress starts.");
        } else {
            console.error("❌ FAILED: started_at should be set.");
        }

        // 3. Test validation (started_at > deadline)
        console.log("\n3. Testing validation (started_at > deadline)...");
        const invalidDeadline = '2020-01-01'; // Past date
        const updateResult = await works.updateWork(task.id, { deadline: invalidDeadline });
        
        if (updateResult.status === 400) {
            console.log("✅ SUCCESS: Correctly rejected invalid deadline.");
            console.log("Message:", updateResult.message);
        } else {
            console.error("❌ FAILED: Should have rejected invalid deadline.");
        }

        // Cleanup
        await db.query("DELETE FROM work WHERE id = ?", [task.id]);
        console.log("\nCleanup done.");

    } catch (error) {
        console.error("Test failed with error:", error);
    } finally {
        process.exit();
    }
}

test();
