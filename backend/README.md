# MSME AI Business Manager API

Production-ready Express backend for an AI-powered MSME assistant. It ingests sales CSVs, computes deterministic analytics, runs a rule engine, and orchestrates Gemini for conversational guidance.

## Tech Stack
- Node.js 18+
- Express.js
- Firebase Auth + Firestore
- Google Gemini API (`@google/generative-ai`)
- Multer + `csv-parse` for CSV ingestion
- Ready for Google Cloud Run deployment

## Project Structure
```
backend/
├── package.json
├── .env
├── README.md
└── src
    ├── app.js
    ├── server.js
    ├── config/
    │   ├── env.js
    │   ├── firebase.js
    │   └── gemini.js
    ├── controllers/
    │   ├── aiController.js
    │   ├── authController.js
    │   └── salesController.js
    ├── middleware/
    │   ├── authMiddleware.js
    │   └── errorMiddleware.js
    ├── routes/
    │   ├── aiRoutes.js
    │   ├── authRoutes.js
    │   └── salesRoutes.js
    └── utils/
        ├── analytics.js
        ├── csvParser.js
        ├── promptBuilder.js
        ├── ruleEngine.js
        └── salesRepository.js
```

## Prerequisites
- Node.js 18.18 or later
- Firebase project with Firestore + Auth enabled
- Google AI Studio or Cloud project with Gemini API access
- Service account JSON for Firebase Admin SDK

## Environment Variables
Copy `.env` and replace placeholder values:
```
NODE_ENV=development
PORT=8080
ALLOWED_ORIGINS=http://localhost:3000
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-1.5-pro
GCP_REGION=asia-south1
```
Remember to keep newline escape sequences (`\n`) inside the private key.

## Install & Run
```bash
cd backend
npm install
npm run dev      # nodemon
# or
npm start        # production-style
```

## CSV Schema
Upload via `POST /api/sales/upload` (multipart form field `file`). Required headers:
```
productName, quantity, costPrice, sellingPrice, date
```
- `date` must be ISO-8601 or any parsable date string
- Numbers are validated; invalid rows fail fast

## Authentication Flow
1. Frontend signs users in with Firebase Auth and obtains ID token
2. Send token in `Authorization: Bearer <idToken>` header
3. Backend middleware verifies token and attaches `req.user`

## API Contracts
| Method | Route | Body | Description |
| --- | --- | --- | --- |
| POST | `/api/sales/upload` | multipart `file` | Upload CSV rows for the authenticated user |
| GET | `/api/sales/all` | – | Fetch normalized sales documents |
| GET | `/api/sales/summary` | – | Deterministic analytics (KPIs, trends, top products) |
| GET | `/api/auth/me` | – | Returns Firebase user profile |
| POST | `/api/ai/chat` | `{ query, role, language?, inventorySnapshot?, ruleConfig?, region? }` | Generates MSME-friendly recommendations using Gemini |

### Sample `/api/ai/chat` Body
```json
{
  "query": "Profit dipped last week, what should I do?",
  "role": "profitAnalyst",
  "language": "Hinglish",
  "inventorySnapshot": {
    "Red Saree": 8,
    "Blue Kurta": 40
  },
  "ruleConfig": {
    "lowStockThreshold": 10
  },
  "region": "Delhi NCR"
}
```
Response includes `reply` (Gemini), plus `analyticsSummary` and `ruleSignals` for UI reuse.

## AI Agent Behavior
- Centralized prompt builder in [backend/src/utils/promptBuilder.js](backend/src/utils/promptBuilder.js) enforces MSME-specific system context, role templates, and the mandatory `Answer / Why / What Next` format.
- Controller logic in [backend/src/controllers/aiController.js](backend/src/controllers/aiController.js) normalizes roles (`profitAnalyst`, `inventoryManager`, `marketingAdvisor`), strips any `[Role]` prefix from user queries, and injects analytics + rule signals into Gemini.
- If `role` is omitted, the API falls back to Profit Analyst but frontend clients should send it explicitly for clarity.
- Rule engine alerts are translated into conversational hints (no internal names) so the AI talks like a store manager, not a dashboard.

### Response Format (always enforced)
```
Answer: direct reply with numbers if available
Why: short reason in plain words
What Next: single actionable next step
```

### Sample Gemini Call (server-side)
```javascript
const model = getChatModel();
const prompt = buildAiPrompt({
  query: 'मेरी profit क्यूँ घट रही है?',
  analyticsSummary,
  ruleSignals,
  language: 'Hindi',
  userContext: { name: 'Anita', region: 'Delhi' },
  role: 'profitAnalyst'
});
const result = await model.generateContent(prompt);
const reply = result.response.text();
```

### Example Inputs & Outputs

**Hindi query**
Input:
```json
{
  "query": "आज profit कम है, reason batao",
  "role": "profitAnalyst",
  "language": "Hindi"
}
```
Output:
```
Answer:
आज का profit करीब INR 12,400 रहा, पिछले हफ्ते से थोड़ा कम है.
Why:
Snacks की demand steady थी लेकिन oil cost और wastage बढ़ गया.
What Next:
कल तेल का order 10% कम करें और तले हुए snacks पर ₹5 बढ़ाकर देखें.
```

**English query**
Input:
```json
{
  "query": "Stock for biscuits is dropping, what should I buy?",
  "role": "inventoryManager",
  "language": "English"
}
```
Output:
```
Answer:
Biscuits will run out in about two days at the current sales pace.
Why:
Daily sales are 26 packs while shelf stock is under 60, so cover is short.
What Next:
Place a 120-pack refill today and keep 20 packs aside for the weekend rush.
```

**Hinglish query**
Input:
```json
{
  "query": "Weekend ke liye koi offer idea?",
  "role": "marketingAdvisor",
  "language": "Hinglish"
}
```
Output:
```
Answer:
Weekend traffic ko pull karne ke liye combo offer Rakhi set + bangles INR 299 rakho.
Why:
High-performing fashion items already contribute 35% revenue, bundle se ticket size badhega.
What Next:
WhatsApp pe 5 line ka poster bhejo aur Saturday subah se shelf ke front par combo display rakho.
```

## Rule Engine Signals
- **lowStock**: alerts when inventory falls below threshold
- **fallingProfit**: compares last vs previous window (default 7 days)
- **highPerformers**: flags products contributing >= 25% of revenue
Signals return machine-readable status + payloads for the AI prompt and frontend alerts.

## Deployment (Cloud Run)
1. Enable Firestore, Auth, and Gemini APIs in GCP
2. Configure service account with `roles/firebase.admin`, `roles/aiplatform.user`
3. Build container:
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT_ID/msme-ai-api backend
   ```
4. Deploy to Cloud Run:
   ```bash
   gcloud run deploy msme-ai-api \
     --image gcr.io/PROJECT_ID/msme-ai-api \
     --region asia-south1 \
     --allow-unauthenticated \
     --set-env-vars $(cat .env | xargs)
   ```
5. Update frontend to call the deployed URL

## Testing Checklist
- Upload CSV with sample data and verify Firestore documents
- Hit `/api/sales/summary` to confirm KPIs/trends
- Call `/api/ai/chat` with different languages and ensure responses follow Insights/What Next format
- Confirm Cloud Run health endpoint `/health` returns `status: ok`

## Notes
- No raw sales data is sent to Gemini—only derived summaries and rule signals
- All protected routes enforce Firebase Auth middleware
- Keep `.env` outside version control in real deployments
- Extend `utils/ruleEngine.js` to add more MSME heuristics without touching controllers
