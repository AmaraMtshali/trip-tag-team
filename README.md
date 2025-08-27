# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/11f03d2c-4ec3-4817-8d47-d51711cbeab3

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/11f03d2c-4ec3-4817-8d47-d51711cbeab3) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/11f03d2c-4ec3-4817-8d47-d51711cbeab3) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Contact form email integration

To receive messages from the in-app contact form directly in your inbox, configure an HTTP endpoint and set it via environment variable.

1) Create `.env` at project root:

```
VITE_CONTACT_ENDPOINT=https://your-email-endpoint.example.com
```

2) Your endpoint should accept a JSON POST body like:

```
{
  "source": "bus-buddy-contact-form",
  "email": "sender@example.com",
  "phone": "+1234567890",
  "linkedin": "https://linkedin.com/in/username", // optional
  "message": "Hello", // optional
  "sentAt": "2025-01-01T00:00:00.000Z",
  "path": "/contact-us"
}
```

You can use services like `Formspree`, `Getform`, or a serverless function (Vercel/Netlify/AWS Lambda) that forwards the payload to your email.