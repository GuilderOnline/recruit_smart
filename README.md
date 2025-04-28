# Recruit_Smart
### Student Name: **Niall O Laoghaire (Software Development)**
### Student ID: **x24144878**  
### Project Name: **Recruit_Smart - Distributed gRPC System**

---

## Domain Description

Recruit_Smart is a distributed recruitment platform using **gRPC microservices** to automate candidate screening, interview scheduling, and onboarding. It simulates a realistic hiring process using Node.js, Express, gRPC, and a web-based GUI.

### Core Services:

- **CandidateService**
  - Handles resume submission, scores candidates, streams candidate matches.
- **SchedulerService**
  - Schedules and cancels interviews for shortlisted candidates.
- **OnboardingService**
  - Initiates and checks onboarding status for hired candidates.

Each service **registers dynamically** with a **RegistryService** (naming service) and communicates securely via **API Key Authentication**.

---

## Service Definitions and RPCs

Each service has a `.proto` file and uses different types of gRPC invocations:

- **CandidateService:**
  - `SubmitResume(Resume) returns (Score)` (Unary RPC)
  - `StreamCandidateMatches(MatchRequest) returns (stream Candidate)` (Server Streaming RPC)
  - `UploadResumes(stream Resume) returns (UploadSummary)` (Client Streaming RPC)
  - `Chat(stream ChatMessage) returns (stream ChatMessage)` (Bi-directional Streaming RPC)

- **SchedulerService:**
  - `ScheduleInterview(InterviewRequest) returns (InterviewResponse)` (Unary RPC)
  - `CancelInterview(InterviewId) returns (InterviewStatus)` (Unary RPC)

- **OnboardingService:**
  - `StartOnboarding(OnboardingRequest) returns (OnboardingStatus)` (Unary RPC)
  - `CheckOnboardingStatus(OnboardingRequest) returns (OnboardingStatus)` (Unary RPC)

---
## Terminal -> Recruit_Smart -> node gui/server.js & go to http://localhost:8080/ in the browser
## Chat client (node chatClient.js) must be run manually after services are running.

## Message Formats

Each service uses structured ProtoBuf messages for data exchange.

| Service | Request Message | Response Message | Notes |
|:--------|:----------------|:-----------------|:------|
| CandidateService | Resume | Score | Submit resume and receive match score. (Unary) |
| CandidateService | MatchRequest | stream Candidate | Stream matching candidates based on skill. (Server Streaming) |
| CandidateService | stream Resume | UploadSummary | Upload multiple resumes at once. (Client Streaming) |
| CandidateService | stream ChatMessage | stream ChatMessage | Real-time chat simulation. (Bi-directional Streaming) |
| SchedulerService | InterviewRequest | InterviewResponse | Schedule interviews for candidates. (Unary) |
| SchedulerService | InterviewId | InterviewStatus | Cancel previously scheduled interview. (Unary) |
| OnboardingService | OnboardingRequest | OnboardingStatus | Start or check onboarding process. (Unary) |

---

### 📜 Example Proto Messages:

// Resume
message Resume {
  string name = 1;
  string email = 2;
  repeated string skills = 3;
  int32 experience_years = 4;
}

// Score
message Score {
  string candidate_name = 1;
  float match_percentage = 2;
}

// MatchRequest
message MatchRequest {
  string skill = 1;
}

// Candidate
message Candidate {
  string name = 1;
  repeated string skills = 2;
  int32 experience_years = 3;
}

// UploadSummary
message UploadSummary {
  int32 total_received = 1;
  string message = 2;
}

// ChatMessage
message ChatMessage {
  string sender = 1;
  string message = 2;
}

// InterviewRequest
message InterviewRequest {
  string candidate_email = 1;
  repeated string available_times = 2;
}

// InterviewResponse
message InterviewResponse {
  string scheduled_time = 1;
  string interview_id = 2;
  string status = 3;
}

// InterviewId
message InterviewId {
  string interview_id = 1;
}

// InterviewStatus
message InterviewStatus {
  string status = 1;
}

// OnboardingRequest
message OnboardingRequest {
  string candidate_email = 1;
}

// OnboardingStatus
message OnboardingStatus {
  string candidate_email = 1;
  string status = 2;
}


