This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, boot up the docker containers:
```bash
docker pull stakingrewards/engineering-frontend-challenge:latest

docker run --name fe-challenge -d -p 8082:8081 stakingrewards/engineering-frontend-challenge:latest
```

Then, run the development server:
```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more, open the `ARCHITECTURE.md` file in the root of the project.
