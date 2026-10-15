export function loader() { throw new Response('Field record not found', { status: 404 }); }
export default function NotFound() { return null; }
