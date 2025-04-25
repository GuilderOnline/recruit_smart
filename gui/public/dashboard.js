function showTab(tabId) {
  const tabs = document.querySelectorAll(".tab-content");
  tabs.forEach(tab => tab.style.display = "none");
  document.getElementById(tabId).style.display = "block";
}

async function submitResume() {
  console.log("📤 Submitting resume...");

  const resume = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    experience_years: parseInt(document.getElementById("experience").value),
    skills: document.getElementById("skills").value.split(",").map(s => s.trim())
  };

  try {
    const response = await fetch("http://localhost:8080/submit-resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resume)
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text);
    }

    const data = await response.json();
    console.log("✅ Resume submitted:", data);
  } catch (err) {
    console.error("❌ Error submitting resume:", err);
  }
}


async function getTopCandidates() {
  console.log("📤 Getting dummy candidates...");
  try {
    const response = await fetch('http://localhost:8080/get-top-candidates');
    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = await response.json();
    console.log("✅ Top Candidates:", data);

    const list = document.getElementById("top-candidates-list");
    list.innerHTML = ""; // Clear previous list

    if (Array.isArray(data?.scores) && data.scores.length > 0) {
      data.scores.forEach(candidate => {
        const item = document.createElement("li");
        item.textContent = `👤 ${candidate.candidate_name} - ${candidate.match_percentage.toFixed(1)}% match`;
        list.appendChild(item);
      });
    } else {
      const item = document.createElement("li");
      item.textContent = "⚠️ No top candidates found.";
      list.appendChild(item);
    }
  } catch (error) {
    console.error("❌ Error getting candidates:", error);
  }
}


function scheduleInterview() {
  console.log("📤 Scheduling interview...");
}

function cancelInterview() {
  console.log("📤 Cancelling interview...");
}

function startOnboarding() {
  console.log("📤 Starting onboarding...");
}

function checkOnboarding() {
  console.log("📤 Checking onboarding status...");
}
