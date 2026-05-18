import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// When running on GitHub Actions, set the base to /<repo-name>/
// This must match your GitHub repo name exactly.
const REPO_NAME = 'peerhour-app' // ← change this if your repo has a different name

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS ? `/${REPO_NAME}/` : '/',
})
