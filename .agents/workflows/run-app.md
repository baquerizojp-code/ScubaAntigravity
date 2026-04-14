---
description: Start the ScubaTrip development server and open the browser
---

# Run ScubaTrip App

Use this workflow to start the local development environment.

## Environment Setup
The development environment requires including the Homebrew bin path to access `node` and `npm`.

## Steps

### 1. Start Dev Server
Run the following command in the project root to start the Vite development server.

// turbo
```bash
export PATH=$PATH:/opt/homebrew/bin && npm run dev
```

### 2. Access the Application
Once the server is ready, the application will be available at:
- **URL:** [http://localhost:8080](http://localhost:8080)

### 3. Open Browser (Antigravity only)
If using Antigravity, use the `browser_subagent` to navigate to the URL above to troubleshoot UI issues.

## Debugging
- If `npm` is not found, ensure `/opt/homebrew/bin` is in your `PATH`.
- Check `.env` file for required Supabase configuration.
