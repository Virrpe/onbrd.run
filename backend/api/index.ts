import { NextRequest } from 'next/server'

export const config = {
  runtime: 'edge',
}

export default function handler(_req: NextRequest) {
  return new Response('Onboarding Audit API', {
    status: 200,
    headers: {
      'content-type': 'text/plain',
    },
  })
}