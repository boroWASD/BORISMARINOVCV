# Boro Portfolio

This project is a dark premium portfolio for Boro Marinov. It includes an online CV, project previews, and a private owner analytics dashboard.

## Local development

1. Open the project folder in VS Code.
2. Start a local static server from the project root:
   ```bash
   python -m http.server 8000
   ```
3. Open `http://localhost:8000` in your browser.

## Admin dashboard setup

The dashboard is intentionally private and only intended for the site owner.

1. Copy `config.example.js` to `config.js`.
2. Set a strong admin password and hash it with SHA-256.
3. Update `window.BORO_ADMIN_CONFIG.passwordHash` in `config.js` with the generated hex digest.
4. Open `/admin.html` and sign in with the matching password.

Important: `config.js` is ignored by Git, so it stays local and does not get pushed to the repository.

## Git workflow

Use the standard Git workflow:

```bash
git status
git add .
git commit -m "Update portfolio content"
git push origin main
```

## Deployment

The repository includes a GitHub Actions workflow that publishes the site to GitHub Pages when changes are pushed to the `main` branch.

`/.github/workflows/deploy.yml` is the deployment configuration. To enable GitHub Pages in GitHub:

1. Open the repository in GitHub.
2. Navigate to Settings → Pages.
3. Set the source to GitHub Actions.
4. Push to `main` and let the workflow run.

## Privacy notes

- The analytics system tracks privacy-conscious, aggregate metrics only.
- Visitor IP addresses are not exposed publicly.
- Contact form submissions are stored only when the visitor intentionally submits the form.
- The owner dashboard is not public and requires authentication.

## Environment variables and secrets

This project is static and does not require a backend for the portfolio itself. If you add a real database or remote analytics provider later, keep the credentials in a protected environment or server-side configuration and never expose them in the frontend.
