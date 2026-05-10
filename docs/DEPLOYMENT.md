# Google Cloud Deployment

This app is ready for Cloud Run using the included standalone Next.js Docker image and `cloudbuild.yaml`.

## One-Time Google Cloud Setup

```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com

gcloud artifacts repositories create team-usa-archetype \
  --repository-format=docker \
  --location=us-central1 \
  --description="Team USA Archetype Lab images"

printf "%s" "$GEMINI_API_KEY" | gcloud secrets create gemini-api-key --data-file=-
```

Grant the Cloud Run runtime service account access to the Gemini key:

```bash
PROJECT_ID="$(gcloud config get-value project)"
PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"

gcloud secrets add-iam-policy-binding gemini-api-key \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## Deploy

```bash
gcloud builds submit \
  --config cloudbuild.yaml \
  --substitutions _REGION=us-central1,_AR_REPO=team-usa-archetype,_SERVICE=team-usa-archetype
```

The Cloud Build deployment attaches `GEMINI_API_KEY` from the `gemini-api-key` Secret Manager secret. If you later use a custom domain, set `NEXT_PUBLIC_SITE_URL` before building so social metadata uses that public URL.

## Verify

```bash
SERVICE_URL="$(gcloud run services describe team-usa-archetype --region=us-central1 --format='value(status.url)')"
curl "$SERVICE_URL/api/health"
curl "$SERVICE_URL/data/team-usa-sport-stats.json"
```

Open the `SERVICE_URL`, run the sample profile, and confirm the result badge says `Gemini panel` when the secret is configured. Without the secret, the app intentionally falls back to deterministic demo mode.

## Local Container Check

```bash
docker build -t team-usa-archetype .
docker run --rm -p 8080:8080 --env-file .env.local team-usa-archetype
curl http://localhost:8080/api/health
```
