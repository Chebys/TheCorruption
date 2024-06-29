export function onRequest(context) {
	return env.ASSETS.fetch('/lib/partition.js')
	//return new Response("Hello, world!")
}