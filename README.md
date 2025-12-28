# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Deployment to VPS with Nginx

This section outlines the steps to deploy your React application to a Virtual Private Server (VPS) using Nginx as a web server.

### 1. Prepare your VPS

Ensure you have:
- An Ubuntu 22.04 (or similar) VPS.
- `git`, `Node.js` (LTS version), `npm`, and `nginx` installed.

### 2. Clone your repository

On your VPS, navigate to a suitable directory (e.g., `/var/www/`) and clone your project repository:

```bash
cd /var/www/
sudo git clone <your_repository_url> fortunate-business-management
cd fortunate-business-management
```
Replace `<your_repository_url>` with the actual URL of your Git repository.

### 3. Install Dependencies and Build the Project

Install the project dependencies and create a production build. The build process will generate optimized static files in the `dist` directory.

```bash
npm install
npm run build
```

### 4. Configure Environment Variables

Create a `.env` file in the root of your project directory on the VPS (if not already present) and add your production environment variables.

If you are using the Nginx `location /api` proxy, set `VITE_BASE_URL` to `/api`:
```
VITE_BASE_URL=/api
```
Otherwise, set it to your full backend API URL:
```
VITE_BASE_URL=https://api.your_backend.com/api/v1
```
Ensure you replace `https://api.your_backend.com/api/v1` with your actual backend API URL if not using the Nginx proxy.

### 5. Configure Nginx

Copy the provided `nginx.conf` file (which I've generated for you) to the Nginx sites-available directory and create a symbolic link to sites-enabled.

**a. Create a Nginx configuration file:**
Create a new Nginx configuration file for your application (e.g., `fortunate-business-management.conf`) in `/etc/nginx/sites-available/`.

```bash
sudo nano /etc/nginx/sites-available/fortunate-business-management.conf
```

**b. Paste the Nginx configuration:**
Paste the content of the `nginx.conf` file that was generated for you. Remember to:
- Replace `your_domain.com` and `www.your_domain.com` with your actual domain names.
- Ensure the `root` directive points to your project's `dist` directory.

Example `nginx.conf` content:
```nginx
server {
    listen 80;
    listen [::]:80;

    # Replace with your actual domain(s)
    server_name fortunate.your_domain.com www.fortunate.your_domain.com; 

    # Root points to the built frontend application's 'dist' directory
    root /var/www/fortunate-business-management/dist; 
    index index.html index.htm;

    location / {
        # This is crucial for Single Page Applications (SPAs)
        # It tries to serve a file directly, then a directory, then falls back to index.html
        try_files $uri $uri/ /index.html;
    }

    # Optional: Cache control for static assets to improve performance
    # Adjust expires as needed (e.g., 30d for 30 days)
    location ~* \.(?:css|js|gif|png|jpg|jpeg|svg|woff|woff2|ttf|ico)$ {
        expires 1y;
        access_log off;
        add_header Cache-Control "public";
    }

    # API Proxy configuration (assuming your backend is on the same VPS, as mentioned)
    # This proxies requests from your frontend's /api endpoint to your backend server
    # The VITE_BASE_URL in your frontend should point to /api if using this proxy
    location /api {
        # Replace with your backend server's internal address and port
        # Example: http://localhost:3000 or http://127.0.0.1:3000
        proxy_pass http://localhost:3000; 
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        # Prevent Nginx from buffering the response, especially useful for long-polling or SSE
        proxy_buffering off;
        proxy_read_timeout 300s; # Increase if backend responses are slow
        proxy_send_timeout 300s; # Increase if sending large requests to backend
    }

    # Error pages (optional)
    error_page 404 /index.html;

    # Basic security headers (recommended)
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "no-referrer-when-downgrade";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
}
```

**c. Enable the site and restart Nginx:**

```bash
sudo ln -s /etc/nginx/sites-available/fortunate-business-management.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Access your application

Your application should now be accessible via your configured domain name.

### 7. Continuous Deployment (Optional)

For future updates, you can set up a simple continuous deployment workflow:
1.  Push changes to your Git repository.
2.  On your VPS, navigate to your project directory.
3.  Run `git pull origin main` (or your main branch name).
4.  Run `npm install` (if dependencies changed).
5.  Run `npm run build`.
6.  Restart Nginx: `sudo systemctl restart nginx`.