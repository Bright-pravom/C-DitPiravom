# C-Dit Piravom

## Search engine files

Regenerate `sitemap.xml` after changing the course slugs in `data.js`:

```powershell
node .\generate-sitemap.js
```

Set `SITE_URL` to the verified HTTPS production origin before generating the production sitemap. The current default, `https://c-ditpiravom.in`, is provisional and must be verified before deployment.
