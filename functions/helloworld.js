export function onRequest(context) {
	return fetch('/lib/partition.js')
	//return new Response("Hello, world!")
}