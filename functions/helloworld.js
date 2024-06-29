export function onRequest(context) {
	return env.ASSETS.fetch('/The Corruption/')
	//return new Response("Hello, world!")
}