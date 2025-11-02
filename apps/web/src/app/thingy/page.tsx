import { headers } from "next/headers";

export default function Thingy() {
	const headersList = headers();
	console.log(headersList);
	return (
		<div>
			<h1>{headersList}</h1>
		</div>
	);
}
