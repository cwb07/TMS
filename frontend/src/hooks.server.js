export async function handle({ event, resolve }) {
  event.locals.app = event.cookies.get("app")
  const response = await resolve(event)
  return response
}
